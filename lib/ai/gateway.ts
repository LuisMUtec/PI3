import { gateway } from "ai";

export const CHAT_MODEL_ID =
  process.env.AI_GATEWAY_CHAT_MODEL ?? "openai/gpt-5.4";

export const EMBED_MODEL_ID =
  process.env.AI_GATEWAY_EMBED_MODEL ?? "openai/text-embedding-3-small";

export const EMBED_DIMENSIONS = 1536;

export const chatModel = CHAT_MODEL_ID;
export const embeddingModel = gateway.textEmbeddingModel(EMBED_MODEL_ID);

/**
 * En Vercel con AI Gateway habilitado, la autenticación usa OIDC y no requiere
 * `AI_GATEWAY_API_KEY`. En desarrollo local (o fuera de Vercel) sí es necesario.
 */
export function assertAiGatewayEnv(): void {
  const onVercel = !!process.env.VERCEL;
  if (!onVercel && !process.env.AI_GATEWAY_API_KEY) {
    throw new Error(
      "AI_GATEWAY_API_KEY no está definido. En local debes proveerlo; en Vercel se autentica vía OIDC.",
    );
  }
}
