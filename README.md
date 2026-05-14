# Agente RAG WhatsApp — Orientación Sexual Anónima

MVP académico para el curso **Proyectos Interdisciplinarios 3 — UTEC**.
Brinda orientación en salud sexual y reproductiva a adolescentes de El Carmen
(Ica) por WhatsApp, de forma **anónima** y apoyada en literatura médica
validada (MINSA, OMS/OPS, UNFPA, UNICEF) mediante una arquitectura
**Retrieval-Augmented Generation (RAG)**.

> Este es un proyecto académico de orientación informativa. **No** sustituye
> consulta médica profesional. Toda situación crítica deriva automáticamente
> hacia Línea 100, CEM, DEMUNA o el centro de salud más cercano.

## Equipo

Joel Cayllahua · Abel Escobar · Piero Pilco · Leonardo Montoya · Luis Maquera
— Docente: Giancarlo Espinoza Delgado.

## Arquitectura

```
┌──────────┐   webhook    ┌────────────────────────────────────────────┐
│ WhatsApp │ ───────────▶ │ Next.js 16 — /api/whatsapp (Fluid Compute) │
└──────────┘   (Twilio)    │  · valida firma X-Twilio-Signature         │
       ▲                   │  · responde 200 inmediato (TwiML vacío)    │
       │ msg async         │  · after(): pipeline RAG en background     │
       │                   └────────────────────────────────────────────┘
       │                                  │
       │                                  ▼
       │                ┌───────────────────────────────────────────┐
       │                │  lib/rag/answer.ts                        │
       │                │   1. triage rules (reglas regex PE)       │
       │                │      → si "alto": derivación inmediata    │
       │                │   2. embed query  ── AI Gateway ──▶ Supa  │
       │                │   3. match_documents (pgvector top-K)     │
       │                │   4. generateText + Output.object()       │
       │                │      → respuesta + severidad + tag        │
       │                └───────────────────────────────────────────┘
       │                                  │
       │                                  ▼
       │            ┌──────────────────────────────────────┐
       └────────────│  Twilio API messages.create()        │
                    │  Supabase: conversations / metrics   │
                    └──────────────────────────────────────┘
```

## Stack

- **Next.js 16** (App Router, Fluid Compute, `after()`).
- **AI SDK v6** + **Vercel AI Gateway** (OIDC en producción).
- **Supabase + pgvector** (HNSW, función `match_documents`).
- **Twilio WhatsApp Sandbox** (sin verificación Meta para piloto).
- **Vitest** para pruebas de las reglas de triaje.

## Estructura del repo

```
app/
  api/whatsapp/route.ts      # webhook
  dashboard/page.tsx          # métricas agregadas
  layout.tsx · page.tsx       # landing simple
corpus/                       # markdown + PDFs de fuentes oficiales
eval/
  golden.jsonl                # 32 casos golden
  run.ts                      # runner de evaluación
lib/
  ai/gateway.ts               # cliente AI Gateway
  anon/hash.ts                # SHA-256 con sal
  rag/
    answer.ts                 # orquestador
    chunk.ts                  # splitter recursivo
    prompt.ts                 # system prompt + guardrails
    retrieve.ts               # embed + match_documents
  supabase/server.ts          # cliente service-role
  triage/
    derivaciones.ts           # Línea 100, CEM, DEMUNA…
    rules.ts                  # regex PE
    rules.test.ts             # tests unitarios
  whatsapp/twilio.ts          # firma + sendMessage
proxy.ts                      # Basic Auth para /dashboard (Next 16)
scripts/ingest.ts             # PDF→MD→chunks→embeddings→Supabase
supabase/migrations/0001_init.sql
```

## Setup local

1. **Instalar dependencias**

   ```bash
   pnpm install   # o npm install
   ```

2. **Variables de entorno**

   ```bash
   cp .env.example .env.local
   ```

   Completar al menos:

   - `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`
   - `AI_GATEWAY_API_KEY` (en local; en Vercel se usa OIDC)
   - `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
   - `ANON_HASH_SALT` (≥ 16 caracteres aleatorios)
   - `DASHBOARD_BASIC_AUTH` (`user:pass`)

3. **Aplicar migración Supabase**

   Vía Supabase MCP o CLI:

   ```bash
   supabase db push    # CLI
   ```

   o aplica `supabase/migrations/0001_init.sql` desde el SQL editor.

4. **Ingestar corpus**

   Coloca documentos en `corpus/minsa/`, `corpus/oms/`, etc. (markdown
   preferido; los PDFs también se procesan con `unpdf`). Luego:

   ```bash
   pnpm ingest             # incremental
   pnpm ingest -- --reset  # vacía la tabla y reingiere
   ```

5. **Levantar el server**

   ```bash
   pnpm dev
   ```

   En otra terminal:

   ```bash
   ngrok http 3000
   ```

   Configura el webhook del *WhatsApp Sandbox* de Twilio apuntando a
   `https://<id>.ngrok.app/api/whatsapp` (método POST).

6. **Pruebas**

   ```bash
   pnpm test            # unitarias (triaje)
   pnpm eval            # 32 casos golden contra el pipeline completo
   ```

## Despliegue Vercel Preview

```bash
vercel link
vercel env pull .env.local --yes
vercel
```

Habilitar la integración **AI Gateway** en el dashboard de Vercel para usar
OIDC sin manejar API keys. Actualizar el webhook de Twilio al URL preview.

## Decisiones clave

| Decisión | Razón |
|---|---|
| Respuesta asíncrona (`after()`) | Evita el timeout de 15s del webhook Twilio en redes rurales. |
| Triaje en dos capas (reglas + LLM) | Reglas deterministas capturan casos críticos sin gastar tokens y son auditables para sustentación. |
| Una sola llamada LLM por consulta | `generateText` con `Output.object()` retorna respuesta + clasificación + tag en un round-trip. |
| Sin historial multi-turno en MVP | Mensajes independientes evitan persistir contenido; reduce riesgo legal y simplifica. |
| Hash anónimo con sal | Permite contar conversaciones únicas sin almacenar identidad (cumple Ley 29733). |
| `proxy.ts` (no `middleware.ts`) | Convención Next.js 16. |

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

## Métricas del dashboard

Disponible en `/dashboard` con Basic Auth (`DASHBOARD_BASIC_AUTH`). Muestra:

- Total de consultas (30 días)
- Conversaciones únicas (anon_hash)
- Derivaciones enviadas
- Latencia p95
- Distribución por severidad
- Temas más consultados
- Serie temporal de 7 días

## Limitaciones conocidas

- WhatsApp Sandbox requiere a cada usuario unirse con un `join <code>`. Para
  piloto real conviene migrar a Meta Cloud API verificada.
- Sin contexto multi-turno: cada mensaje se trata independientemente.
- El corpus inicial depende del material curado por el equipo; la calidad de
  respuesta es directamente proporcional a la calidad del corpus.

## Roadmap post-MVP

- Memoria conversacional cifrada y opt-in.
- Migración a Meta Cloud API verificada y onboarding sin `join`.
- Detección de prompt injection y abuso del canal.
- Evaluación humana ciega (sustentación + piloto con tutores).
