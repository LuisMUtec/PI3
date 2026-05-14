-- =====================================================================
-- MVP: Agente RAG WhatsApp — Orientación Sexual Anónima
-- Migración 0001: corpus vectorial + métricas anónimas + triaje
-- =====================================================================

create extension if not exists "vector";
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- documents: chunks vectorizados del corpus médico
-- ---------------------------------------------------------------------
create table if not exists public.documents (
  id            uuid primary key default gen_random_uuid(),
  content       text not null,
  source        text not null,              -- p.ej. "MINSA", "OMS", "UNFPA"
  document_title text,
  section_title text,
  url           text,
  page          int,
  metadata      jsonb not null default '{}'::jsonb,
  embedding     vector(768),
  created_at    timestamptz not null default now()
);

create index if not exists documents_embedding_hnsw
  on public.documents using hnsw (embedding vector_cosine_ops);

create index if not exists documents_source_idx
  on public.documents (source);

-- ---------------------------------------------------------------------
-- conversations: contador por usuario anónimo (hash) — sin contenido
-- ---------------------------------------------------------------------
create table if not exists public.conversations (
  anon_hash      text primary key,
  message_count  int not null default 0,
  last_topic     text,
  last_seen      timestamptz not null default now(),
  created_at     timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- triage_events: eventos de derivación (sin contenido del mensaje)
-- ---------------------------------------------------------------------
create table if not exists public.triage_events (
  id                uuid primary key default gen_random_uuid(),
  anon_hash         text not null,
  severity          text not null check (severity in ('bajo', 'medio', 'alto')),
  category          text not null,            -- p.ej. "ideacion_suicida", "abuso", "its_aguda"
  derivation_sent   boolean not null default false,
  created_at        timestamptz not null default now()
);

create index if not exists triage_events_anon_idx
  on public.triage_events (anon_hash);
create index if not exists triage_events_severity_idx
  on public.triage_events (severity);

-- ---------------------------------------------------------------------
-- topic_metrics: contador agregado por tema
-- ---------------------------------------------------------------------
create table if not exists public.topic_metrics (
  tag         text primary key,
  count       int not null default 0,
  last_seen   timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- messages_log: solo para latencia y auditoría agregada (sin texto)
-- ---------------------------------------------------------------------
create table if not exists public.messages_log (
  id               uuid primary key default gen_random_uuid(),
  anon_hash        text not null,
  inbound_at       timestamptz not null default now(),
  responded_at     timestamptz,
  latency_ms       int,
  used_chunks      int default 0,
  severity         text,
  category         text,
  ok               boolean not null default true,
  error_code       text
);

create index if not exists messages_log_inbound_idx
  on public.messages_log (inbound_at desc);

-- ---------------------------------------------------------------------
-- Función: búsqueda semántica top-k con filtro por score
-- ---------------------------------------------------------------------
create or replace function public.match_documents(
  query_embedding vector(768),
  match_count     int default 5,
  min_score       float default 0.5
)
returns table (
  id            uuid,
  content       text,
  source        text,
  document_title text,
  section_title text,
  url           text,
  page          int,
  metadata      jsonb,
  score         float
)
language plpgsql
stable
as $$
begin
  return query
    select
      d.id,
      d.content,
      d.source,
      d.document_title,
      d.section_title,
      d.url,
      d.page,
      d.metadata,
      1 - (d.embedding <=> query_embedding) as score
    from public.documents d
    where d.embedding is not null
      and 1 - (d.embedding <=> query_embedding) >= min_score
    order by d.embedding <=> query_embedding asc
    limit match_count;
end;
$$;

-- ---------------------------------------------------------------------
-- Función helper: upsert métrica de tópico
-- ---------------------------------------------------------------------
create or replace function public.bump_topic(p_tag text)
returns void
language plpgsql
as $$
begin
  insert into public.topic_metrics (tag, count, last_seen)
    values (p_tag, 1, now())
    on conflict (tag) do update
      set count     = public.topic_metrics.count + 1,
          last_seen = now();
end;
$$;

-- ---------------------------------------------------------------------
-- Función helper: upsert conversación anónima
-- ---------------------------------------------------------------------
create or replace function public.touch_conversation(
  p_anon_hash text,
  p_topic     text default null
)
returns void
language plpgsql
as $$
begin
  insert into public.conversations (anon_hash, message_count, last_topic, last_seen)
    values (p_anon_hash, 1, p_topic, now())
    on conflict (anon_hash) do update
      set message_count = public.conversations.message_count + 1,
          last_topic    = coalesce(p_topic, public.conversations.last_topic),
          last_seen     = now();
end;
$$;
