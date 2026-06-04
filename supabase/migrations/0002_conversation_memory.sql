-- =====================================================================
-- Migración 0002: memoria conversacional efímera por usuario anónimo
-- =====================================================================
-- Guarda una VENTANA CORTA de los últimos turnos (texto) llaveada por el
-- mismo `anon_hash` (SHA-256 + sal irreversible) que ya usa el resto del
-- sistema. Da continuidad a preguntas de seguimiento SIN retención indefinida:
--
--   * Caducidad por INACTIVIDAD: cada mensaje nuevo refresca `expires_at` de
--     toda la ventana del usuario. Si pasan >TTL minutos sin escribir, la
--     memoria se considera vencida.
--   * Purga FÍSICA en dos vías: (a) perezosa en cada lectura y (b) programada
--     vía pg_cron cada 15 min (ver bloque final), para que el contenido
--     vencido se borre aunque cese el tráfico. Si pg_cron no está disponible,
--     queda solo la vía perezosa (ver README → Limitaciones).
--   * Recorte de ventana: solo se conservan los últimos N turnos por usuario.
--   * `SALIR` borra la conversación de inmediato y deja un "tombstone" que
--     evita que un pipeline en vuelo re-persista lo que el usuario pidió borrar.
--
-- Orden total estable: `seq` (identity) desempata turnos del mismo intercambio,
-- que comparten `created_at` (now() = timestamp de transacción).
--
-- Privacidad: el contenido se almacena en claro pero de forma temporal y sin
-- vínculo con la identidad real (solo el hash). Coherente con la promesa
-- actualizada de la bienvenida. El cifrado en reposo queda como mejora futura.

-- ---------------------------------------------------------------------
-- conversation_turns: ventana corta de turnos por hash anónimo
-- ---------------------------------------------------------------------
create table if not exists public.conversation_turns (
  id          uuid primary key default gen_random_uuid(),
  seq         bigint generated always as identity,
  anon_hash   text not null,
  role        text not null check (role in ('user', 'assistant')),
  content     text not null,
  created_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '6 hours'
);

-- (anon_hash, seq) cubre el orden cronológico estable de la ventana del usuario.
create index if not exists conversation_turns_anon_idx
  on public.conversation_turns (anon_hash, seq);
create index if not exists conversation_turns_expires_idx
  on public.conversation_turns (expires_at);

-- ---------------------------------------------------------------------
-- conversation_forgets: marca de "olvido" por usuario (comando SALIR).
-- Evita que un INSERT tardío (pipeline en vuelo) reviva memoria borrada.
-- Solo guarda el hash + timestamp; sin contenido. Se purga tras 1 h.
-- ---------------------------------------------------------------------
create table if not exists public.conversation_forgets (
  anon_hash    text primary key,
  forgotten_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- purge_expired_memory: borrado físico de turnos vencidos + tombstones
-- viejos. Idempotente; la invocan recall (perezosa) y pg_cron (programada).
-- ---------------------------------------------------------------------
create or replace function public.purge_expired_memory()
returns void
language sql
as $$
  delete from public.conversation_turns where expires_at < now();
  delete from public.conversation_forgets where forgotten_at < now() - interval '1 hour';
$$;

-- ---------------------------------------------------------------------
-- recall_conversation: purga vencidos y devuelve los últimos N turnos
-- del usuario en orden cronológico (más antiguo primero) para el prompt.
-- ---------------------------------------------------------------------
create or replace function public.recall_conversation(
  p_anon_hash text,
  p_limit     int default 8
)
returns table (
  role        text,
  content     text,
  created_at  timestamptz
)
language plpgsql
as $$
begin
  -- Purga perezosa (turnos vencidos + tombstones viejos de cualquier usuario).
  perform public.purge_expired_memory();

  return query
    select t.role, t.content, t.created_at
    from (
      select ct.role, ct.content, ct.created_at, ct.seq
      from public.conversation_turns ct
      where ct.anon_hash = p_anon_hash
      order by ct.seq desc
      limit coalesce(p_limit, 8)
    ) t
    order by t.seq asc;
end;
$$;

-- ---------------------------------------------------------------------
-- remember_turns: inserta el turno del usuario + la respuesta, refresca la
-- caducidad de toda la ventana (reloj de inactividad) y recorta a N turnos.
-- Si el usuario pidió SALIR DESPUÉS de que llegó este mensaje (p_inbound_at),
-- NO re-persiste: respeta el borrado inmediato.
-- ---------------------------------------------------------------------
create or replace function public.remember_turns(
  p_anon_hash   text,
  p_user        text,
  p_assistant   text,
  p_ttl_minutes int default 360,
  p_max_turns   int default 12,
  p_inbound_at  timestamptz default null
)
returns void
language plpgsql
as $$
declare
  v_expires   timestamptz := now() + make_interval(mins => coalesce(p_ttl_minutes, 360));
  v_forgotten timestamptz;
begin
  -- Guarda anti-carrera: si hubo un SALIR posterior a la llegada del mensaje,
  -- el usuario ya pidió borrar; no revivimos la memoria.
  if p_inbound_at is not null then
    select cf.forgotten_at into v_forgotten
      from public.conversation_forgets cf
      where cf.anon_hash = p_anon_hash;
    if v_forgotten is not null and v_forgotten >= p_inbound_at then
      return;
    end if;
  end if;

  insert into public.conversation_turns (anon_hash, role, content, expires_at)
  values
    (p_anon_hash, 'user', p_user, v_expires),
    (p_anon_hash, 'assistant', p_assistant, v_expires);

  -- Reinicia el reloj de inactividad para TODA la ventana del usuario.
  update public.conversation_turns
    set expires_at = v_expires
    where anon_hash = p_anon_hash;

  -- Conserva solo los últimos p_max_turns turnos; borra los más antiguos.
  delete from public.conversation_turns
    where anon_hash = p_anon_hash
      and id not in (
        select ct.id
        from public.conversation_turns ct
        where ct.anon_hash = p_anon_hash
        order by ct.seq desc
        limit coalesce(p_max_turns, 12)
      );
end;
$$;

-- ---------------------------------------------------------------------
-- forget_conversation: borra toda la memoria del usuario (comando SALIR) y
-- registra el tombstone para bloquear writes tardíos en vuelo.
-- ---------------------------------------------------------------------
create or replace function public.forget_conversation(p_anon_hash text)
returns void
language plpgsql
as $$
begin
  delete from public.conversation_turns where anon_hash = p_anon_hash;
  insert into public.conversation_forgets (anon_hash, forgotten_at)
    values (p_anon_hash, now())
    on conflict (anon_hash) do update set forgotten_at = now();
end;
$$;

-- ---------------------------------------------------------------------
-- Purga programada (independiente del tráfico) vía pg_cron, si está disponible.
-- Garantiza "se borra sola tras unas horas de inactividad" aunque cese el
-- tráfico. Degradación elegante: si pg_cron no está, queda la purga perezosa.
-- ---------------------------------------------------------------------
do $cron$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule(
      'purge_expired_memory',
      '*/15 * * * *',
      'select public.purge_expired_memory();'
    );
    raise notice 'pg_cron: purga de memoria programada cada 15 min.';
  else
    raise notice 'pg_cron no disponible; la purga física dependerá del tráfico (lazy) o de un Vercel Cron.';
  end if;
exception when others then
  raise notice 'No se pudo programar pg_cron (%); se usará purga perezosa.', sqlerrm;
end
$cron$;
