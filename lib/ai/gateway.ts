import { gateway } from "ai";

/**
 * Proveedor: Vercel AI Gateway — una sola API para 100+ modelos con routing,
 * failover, control de costos y observabilidad. Es el provider global por
 * defecto del AI SDK v6, así que basta con pasarle slugs `proveedor/modelo`.
 *
 * - Chat: `google/gemini-2.5-flash-lite` — el modelo de texto de Google más
 *   barato que soporta de forma fiable Structured Outputs (JSON Schema) y
 *   acentos del español, ambos imprescindibles para este RAG.
 * - Embeddings: `openai/text-embedding-3-small` (1536 dims) — mismo espacio
 *   vectorial que ya tiene la tabla `documents` en pgvector, por lo que NO hay
 *   que re-ingestar el corpus al migrar de proveedor.
 *
 * Autenticación: `AI_GATEWAY_API_KEY` (clave creada en el dashboard de Vercel)
 * en local/CI; en despliegues sobre Vercel se inyecta `VERCEL_OIDC_TOKEN`
 * automáticamente y no hace falta clave.
 * https://vercel.com/docs/ai-gateway
 */

export const CHAT_MODEL_ID =
  process.env.AI_GATEWAY_CHAT_MODEL ?? "google/gemini-2.5-flash-lite";

export const EMBED_MODEL_ID =
  process.env.AI_GATEWAY_EMBED_MODEL ?? "openai/text-embedding-3-small";

/** Dimensiones que entrega el modelo de embeddings. Debe igualar `vector(N)` en la DB. */
export const EMBED_DIMENSIONS = 1536;

export const chatModel = gateway(CHAT_MODEL_ID);
export const embeddingModel = gateway.embeddingModel(EMBED_MODEL_ID);

/**
 * Provider options para embeddings. Vacías por defecto: el Gateway usa las
 * dimensiones nativas del modelo (1536 para text-embedding-3-small). Se
 * conservan como constantes para no romper los call-sites de
 * `retrieve.ts` / `ingest.ts`, que las pasan a `embed()` / `embedMany()`.
 */
export const EMBED_DOC_PROVIDER_OPTS = {};
export const EMBED_QUERY_PROVIDER_OPTS = {};

export function assertAiProviderEnv(): void {
  // En Vercel basta el OIDC token; en local/CI se necesita la API key.
  if (!process.env.AI_GATEWAY_API_KEY && !process.env.VERCEL_OIDC_TOKEN) {
    throw new Error(
      "Falta AI_GATEWAY_API_KEY (o VERCEL_OIDC_TOKEN). Crea una clave de AI Gateway en el dashboard de Vercel → AI Gateway, o ejecuta `vercel env pull`. Docs: https://vercel.com/docs/ai-gateway",
    );
  }
}
