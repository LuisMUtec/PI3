# Agente RAG WhatsApp — Orientación Sexual Anónima

MVP académico para el curso **Proyectos Interdisciplinarios 3 — UTEC**.
Brinda orientación en salud sexual y reproductiva a adolescentes de El Carmen
(Ica) por WhatsApp, de forma **anónima** y apoyada en literatura médica
validada (MINSA, OMS/OPS, UNFPA, UNICEF) mediante una arquitectura
**Retrieval-Augmented Generation (RAG)**.

> Proyecto académico de orientación informativa. **No** sustituye consulta
> médica profesional. Toda situación crítica deriva automáticamente hacia
> Línea 100, CEM, DEMUNA o el centro de salud más cercano.

## Equipo

Joel Cayllahua · Abel Escobar · Piero Pilco · Leonardo Montoya · Luis Maquera
— Docente: Giancarlo Espinoza Delgado.

---

## Stack

| Componente | Tecnología |
|---|---|
| Canal | WhatsApp Sandbox de Twilio |
| Backend | Next.js 16 (App Router, `after()`) |
| LLM / embeddings | **Vercel AI Gateway** (`google/gemini-2.5-flash-lite` + `openai/text-embedding-3-small`) vía AI SDK v6 |
| Vector store | Supabase Postgres + pgvector (HNSW) |
| Túnel local | ngrok |
| Idioma | Español (variante peruana) |

Vercel AI Gateway es una sola API para 100+ modelos con routing, failover y
observabilidad; cada equipo Vercel incluye créditos gratis mensuales y cobra los
tokens a precio de lista sin recargo. El chat usa el modelo de texto de Google
más barato con Structured Outputs fiable (`google/gemini-2.5-flash-lite`) y los
embeddings siguen en `openai/text-embedding-3-small` (1536 dims) para reusar el
mismo espacio vectorial sin re-ingestar el corpus.

## Arquitectura

```
┌──────────┐  webhook   ┌──────────────────────────────────────────────┐
│ WhatsApp │ ─────────▶ │ Next.js  app/api/whatsapp/route.ts           │
└──────────┘  (Twilio)  │  • valida firma X-Twilio-Signature           │
       ▲                │  • responde 200 OK + TwiML vacío             │
       │ Twilio API     │  • after(): pipeline RAG asíncrono           │
       │                └──────────────────────────────────────────────┘
       │                            │
       │                            ▼
       │                ┌──────────────────────────────────────┐
       │                │ lib/rag/answer.ts                    │
       │                │  1. triage rules (regex PE)          │
       │                │     → "alto" ⇒ deriva sin LLM        │
       │                │  2. embed(query) → match_documents() │
       │                │  3. generateText + Output.object()   │
       │                │     ↳ respuesta + severidad + tag    │
       │                │  4. anexa 📚 Fuentes + derivación    │
       │                └──────────────────────────────────────┘
       │                            │
       │                            ▼
       └────────  twilio.messages.create()  ──────────────────────────
                              + Supabase: conversations / metrics
```

---

## Prerrequisitos

- **Node.js 20 LTS** (Node 22 también funciona).
- **pnpm 10** (`npm install -g pnpm@10`). Con Node 20 *no uses pnpm 11+*.
- **ngrok 3** ([descarga](https://ngrok.com/download)) con cuenta gratuita.
- Cuenta de **Vercel** con **AI Gateway** habilitado (incluye créditos gratis mensuales; sin tarjeta para empezar).
- Cuenta gratis de **Twilio** + WhatsApp Sandbox activado.
- Proyecto **Supabase** gratuito (Free tier es suficiente).

---

## Setup paso a paso

### 1. Clonar e instalar

```bash
git clone https://github.com/LuisMUtec/PI3.git
cd PI3
pnpm install
```

### 2. Crear las credenciales externas

#### a) Vercel AI Gateway

1. Crea (o entra a) una cuenta en <https://vercel.com>.
2. En el dashboard de tu proyecto/equipo abre **AI Gateway** y habilítalo.
3. Crea una **API Key** del AI Gateway (empieza con `vck_...`) y cópiala.
4. Pégala en `.env.local` como `AI_GATEWAY_API_KEY`.

> Alternativa sin clave manual: si despliegas en Vercel, `vercel env pull`
> inyecta un `VERCEL_OIDC_TOKEN` de corta duración y no necesitas API key.

#### b) Twilio WhatsApp Sandbox

1. Crea cuenta en <https://www.twilio.com/try-twilio> (no requiere tarjeta).
2. En la consola: **Messaging → Try it out → Send a WhatsApp message**.
3. Anota:
   - `Account SID` y `Auth Token` (en el dashboard principal).
   - El número compartido del sandbox: **`+1 415 523 8886`** (mismo para
     todos los devs de Twilio).
   - El código `join <dos-palabras>` que te toca a ti.

> ⚠️ El `TWILIO_WHATSAPP_FROM` siempre es `whatsapp:+14155238886`. No uses
> el número que aparece en *"Phone Numbers"* aunque tu cuenta tenga uno
> regular — ese número no tiene canal de WhatsApp.

#### c) Supabase

1. Crea un proyecto en <https://supabase.com/dashboard> (Free).
2. En **Project Settings → API** copia:
   - `Project URL` → `SUPABASE_URL`
   - `service_role` key (la secreta, NO la `anon`) → `SUPABASE_SERVICE_ROLE_KEY`
   - `anon` key → `SUPABASE_ANON_KEY`
3. En **Project Settings → Database** copia el `Connection string` modo
   **IPv4 Session pooler** — lo necesitarás para aplicar la migración.

#### d) ngrok

1. Crea cuenta en <https://dashboard.ngrok.com/signup>
2. Copia tu authtoken desde
   <https://dashboard.ngrok.com/get-started/your-authtoken>
3. Guárdalo localmente:

   ```bash
   ngrok config add-authtoken <tu-token>
   ```

### 3. Variables de entorno

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```bash
# Twilio
TWILIO_ACCOUNT_SID=AC********************************
TWILIO_AUTH_TOKEN=********************************
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886

# Vercel AI Gateway
AI_GATEWAY_API_KEY=vck_***
AI_GATEWAY_CHAT_MODEL=google/gemini-2.5-flash-lite
AI_GATEWAY_EMBED_MODEL=openai/text-embedding-3-small

# Supabase
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ***
SUPABASE_ANON_KEY=eyJ***

# App
ANON_HASH_SALT=<genera 64 bytes aleatorios — ver abajo>
DASHBOARD_BASIC_AUTH=admin:elQueQuieras
PUBLIC_BASE_URL=http://localhost:3000   # se actualiza con la URL de ngrok

# RAG
RAG_TOP_K=5
RAG_MIN_SCORE=0.30
```

**Generar `ANON_HASH_SALT`** (cualquiera sirve, mínimo 16 chars):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64'))"
```

### 4. Aplicar la migración a Supabase

```bash
# Reemplaza <connection-string> con el IPv4 Session pooler de Supabase
psql "<connection-string>" -f supabase/migrations/0001_init.sql
```

Si no tienes `psql`: copia el contenido de `supabase/migrations/0001_init.sql`
y pégalo en el **SQL Editor** del dashboard de Supabase, luego *Run*.

Esto crea las tablas `documents`, `conversations`, `triage_events`,
`topic_metrics`, `messages_log`, el índice HNSW y las funciones
`match_documents`, `bump_topic`, `touch_conversation`.

### 5. Ingestar el corpus

El repo trae 14 markdowns curados en `corpus/{minsa,oms,unfpa,curado}/`. Para
vectorizarlos e insertarlos en Supabase:

```bash
pnpm ingest             # incremental
pnpm ingest --reset     # vacía la tabla antes (úsalo la primera vez)
```

Debería terminar con `~15 chunks insertados`. Para ampliar el corpus, deja
PDFs o `.md` en `corpus/<organismo>/` y vuelve a correr `pnpm ingest`.

### 6. Levantar todo

Necesitas **tres terminales** abiertas:

**Terminal 1 — dev server:**

```bash
pnpm dev
```

**Terminal 2 — túnel ngrok:**

```bash
ngrok http 3000
```

Copia la URL `https://<algo>.ngrok-free.dev` que muestra ngrok, ponla en
`.env.local` como `PUBLIC_BASE_URL` y **reinicia el `pnpm dev`** (Ctrl+C y
arrancarlo de nuevo) para que cargue el cambio. La validación de firma de
Twilio exige que esta URL sea exactamente la misma a la que Twilio llama.

**Terminal 3 — diagnóstico opcional:**

```bash
# Probar el pipeline sin WhatsApp
set -a && source .env.local && set +a
pnpm tsx scripts/probe-answer.ts "¿Cómo se transmite el VIH?"
```

### 7. Configurar Twilio Sandbox

1. En la consola de Twilio, en **Sandbox settings**:
   - **When a message comes in:**
     `https://<algo>.ngrok-free.dev/api/whatsapp`
   - Método: `HTTP POST`
   - Guarda.
2. Desde tu WhatsApp envía al `+1 415 523 8886` el mensaje
   `join <tus-dos-palabras>`.
3. Twilio responderá confirmando que te uniste.
4. Manda cualquier pregunta:
   - `hola` / `ayuda` → mensaje de bienvenida
   - `¿cómo se transmite el VIH?` → respuesta + 📚 Fuentes
   - `me quiero matar` → derivación inmediata a Línea 100 / AMA 113
   - `salir` → mensaje de despedida

---

## Comandos del proyecto

| Comando | Propósito |
|---|---|
| `pnpm dev` | Next dev server (puerto 3000). |
| `pnpm build` | Build de producción. |
| `pnpm typecheck` | `tsc --noEmit`. |
| `pnpm test` | Tests unitarios del triaje (vitest). |
| `pnpm ingest` | Recorre `corpus/`, embebe e inserta en `documents`. |
| `pnpm ingest --reset` | Vacía la tabla `documents` antes de ingerir. |
| `pnpm eval` | Corre el golden set (32 casos) y emite matriz de confusión. |
| `pnpm tsx scripts/probe-answer.ts "..."` | Prueba el pipeline RAG aisladamente (requiere env cargada con `set -a && source .env.local && set +a`). |

---

## Probar diferentes casos

Manda estos mensajes al sandbox para ejercitar cada rama del pipeline:

| Tipo | Mensaje | Comportamiento esperado |
|---|---|---|
| Informativo | `¿Cómo se transmite el VIH?` | Respuesta + cita OMS/MINSA, sin derivación. |
| Anticoncepción | `¿Cómo se usa correctamente un condón?` | Pasos + cita OMS, sin derivación. |
| Ambiguo | `Tuve relaciones sin protección anoche` | Pide contexto o sugiere AOE + centro de salud. |
| Crítico | `Me quiero matar` | <1s; derivación directa Línea 113 + AMA 113. |
| Estupro | `Tengo 13 y mi novio tiene 22` | Derivación Línea 100 + CEM + DEMUNA. |
| Fuera de scope | `¿Quién va a ganar las elecciones?` | Redirige educadamente al tema. |
| Comandos | `SALIR` / `HOLA` / `AYUDA` | Respuesta inmediata, sin LLM. |

Para evaluación cuantitativa: `pnpm eval` corre 32 casos curados
(`eval/golden.jsonl`) y reporta accuracy + matriz de confusión de triaje.

---

## Estructura

```
app/
  api/whatsapp/route.ts   ← webhook Twilio (entrada del sistema)
  dashboard/page.tsx      ← métricas con Basic Auth
  layout.tsx · page.tsx · globals.css
corpus/                   ← markdowns/PDFs por organismo
eval/
  golden.jsonl            ← 32 casos (info, ambiguos, críticos, off-topic)
  run.ts                  ← runner de evaluación
lib/
  ai/gateway.ts           ← provider Vercel AI Gateway (chat + embeddings)
  anon/hash.ts            ← SHA-256(salt + ":" + phone)
  rag/
    chunk.ts              ← splitter recursivo (600 tok / 120 overlap)
    retrieve.ts           ← embed query + match_documents + formato citas
    prompt.ts             ← system prompt + guardrails
    answer.ts             ← orquestador: triage → retrieve → generateText
  supabase/server.ts      ← cliente service-role + polyfill WS
  triage/
    rules.ts              ← regex PE: ideación suicida, abuso, estupro…
    derivaciones.ts       ← Línea 100, AMA 113, CEM, DEMUNA, salud
  whatsapp/twilio.ts      ← firma X-Twilio-Signature + send async
scripts/
  ingest.ts               ← pipeline PDF→MD→chunk→embed→insert
  probe-answer.ts         ← debug del pipeline sin WhatsApp
supabase/migrations/0001_init.sql
proxy.ts                  ← Basic Auth para /dashboard (Next 16)
```

---

## Decisiones clave

| Decisión | Razón |
|---|---|
| Respuesta asíncrona (`after()`) | Evita el timeout de 15s del webhook Twilio en redes rurales. |
| Triaje en dos capas (reglas + LLM) | Reglas deterministas capturan casos críticos sin gastar tokens; auditables para sustentación. |
| Una sola llamada LLM por consulta | `generateText` con `Output.object()` retorna respuesta + clasificación + tag en un round-trip. |
| Structured Outputs (`Output.object`) | `gemini-2.5-flash-lite` soporta JSON Schema nativo; el AI SDK valida la salida contra el schema Zod en un solo round-trip. |
| Sin historial multi-turno en MVP | Mensajes independientes evitan persistir contenido; reduce riesgo legal y simplifica. |
| Hash anónimo con sal | Permite contar conversaciones únicas sin almacenar identidad (cumple Ley 29733). |
| `proxy.ts` (no `middleware.ts`) | Convención Next.js 16. |
| `RAG_MIN_SCORE=0.30` | Con 15 chunks los scores oscilan 0.30–0.40; umbral más alto deja al modelo sin contexto. |

---

## Ética y consideraciones legales

- **Disclaimer permanente**: el agente declara no ser profesional médico.
- **Anonimato fuerte**: SHA-256 + sal irreversible. Nunca se guarda contenido
  del mensaje en claro.
- **Derivación automática**: ideación suicida (Línea 113), abuso (Línea 100,
  CEM), violencia (Línea 100), emergencia médica (SAMU 106), estupro
  (DEMUNA + Línea 100).
- **Marco legal Perú**: Ley 30364 (violencia), Ley 29733 (datos personales),
  estupro tipificado para relaciones con menores de 14 años.
- **Inclusión**: lenguaje sin asunción de género ni orientación; sin
  moralización; adaptado al contexto adolescente.

---

## Dashboard

Disponible en `http://localhost:3000/dashboard` (Basic Auth con
`DASHBOARD_BASIC_AUTH`). Muestra:

- Total de consultas (30 días)
- Conversaciones únicas
- Derivaciones enviadas
- Latencia p95
- Distribución por severidad
- Temas más consultados
- Serie temporal de 7 días

---

## Troubleshooting

| Síntoma | Causa probable | Fix |
|---|---|---|
| Webhook responde 403 | Firma X-Twilio-Signature inválida. | `PUBLIC_BASE_URL` no coincide con el host que llamó Twilio. Sincroniza con la URL exacta de ngrok y reinicia `pnpm dev`. |
| Webhook responde 200 pero no llega WhatsApp | Error 63007 en logs. | `TWILIO_WHATSAPP_FROM` no es el del sandbox. Debe ser `whatsapp:+14155238886`. |
| Respuesta sin bloque `📚 Fuentes` | `num_chunks: 0`. | Bajar `RAG_MIN_SCORE` (0.30 funciona con el corpus seed) o ampliar corpus. |
| `pnpm install` falla con `ERR_VM_DYNAMIC_IMPORT_CALLBACK_MISSING` | pnpm 11 + Node 20. | `npm i -g pnpm@10` o sube a Node 22. |
| AI Gateway 401 `authentication_error` | `AI_GATEWAY_API_KEY` inválida, revocada o sin acceso al Gateway. | Recrea la API Key en el dashboard de Vercel → AI Gateway, o usa `vercel env pull` para un `VERCEL_OIDC_TOKEN`. |
| AI Gateway 402 `Payment Required` | Créditos del Gateway agotados. | Recarga créditos o configura auto top-up en el dashboard de Vercel. |
| Supabase realtime falla en Node 20 | Falta WebSocket global. | El polyfill ya está en `lib/supabase/server.ts`; reinstala con `pnpm install`. |
| ngrok cambia de URL en cada reinicio | Plan Free. | Reservar dominio en ngrok dashboard (gratis) o resincronizar `PUBLIC_BASE_URL` + webhook cada vez. |

---

## Limitaciones conocidas

- WhatsApp Sandbox requiere `join <code>` por usuario; para piloto real
  conviene migrar a Meta Cloud API verificada.
- Sin contexto multi-turno: cada mensaje se trata independientemente.
- La calidad de respuesta es proporcional al corpus; el seed (15 chunks) es
  apenas demostrativo.

## Roadmap post-MVP

- Memoria conversacional cifrada y opt-in.
- Migración a Meta Cloud API verificada.
- Detección de prompt injection y abuso del canal.
- Evaluación humana ciega con tutores en piloto.
