import { createOpenAICompatible } from "@ai-sdk/openai-compatible";

/**
 * Proveedor: GitHub Models (compatible con OpenAI API).
 * Free para usuarios con cuenta GitHub; con Copilot Pro / Student Pack
 * tienes límites más altos. Endpoint: https://models.github.ai/inference
 *
 * Necesitas un Personal Access Token con el scope `models:read`.
 * https://github.com/settings/personal-access-tokens/new
 *
 * Pégalo en `GITHUB_TOKEN` (o `GITHUB_MODELS_TOKEN`) en `.env.local`.
 */

const ENDPOINT =
  process.env.GITHUB_MODELS_BASE_URL ?? "https://models.github.ai/inference";

const TOKEN =
  process.env.GITHUB_MODELS_TOKEN ?? process.env.GITHUB_TOKEN ?? "";

export const CHAT_MODEL_ID = process.env.CHAT_MODEL ?? "openai/gpt-4o-mini";
export const EMBED_MODEL_ID =
  process.env.EMBED_MODEL ?? "openai/text-embedding-3-small";

/** Dimensiones que entrega el modelo de embeddings. Debe igualar `vector(N)` en la DB. */
export const EMBED_DIMENSIONS = 1536;

const githubModels = createOpenAICompatible({
  name: "github-models",
  baseURL: ENDPOINT,
  apiKey: TOKEN,
  // Activa modo Structured Outputs (response_format: json_schema) en vez de
  // json_object. Azure OpenAI Foundry (donde corre GitHub Models) exige que
  // el prompt mencione "json" en modo json_object; json_schema evita eso y
  // además garantiza que la salida cumpla exactamente el schema Zod.
  supportsStructuredOutputs: true,
});

export const chatModel = githubModels.chatModel(CHAT_MODEL_ID);
export const embeddingModel = githubModels.textEmbeddingModel(EMBED_MODEL_ID);

/**
 * Provider options no necesarios para OpenAI-compatible / GitHub Models.
 * Se mantienen como constantes vacías para no romper los call-sites.
 */
export const EMBED_DOC_PROVIDER_OPTS = {};
export const EMBED_QUERY_PROVIDER_OPTS = {};

export function assertAiProviderEnv(): void {
  if (!TOKEN) {
    throw new Error(
      "GITHUB_TOKEN (o GITHUB_MODELS_TOKEN) no está definido. Crea un PAT con scope `models:read` en https://github.com/settings/personal-access-tokens/new",
    );
  }
}
