import { google } from "@ai-sdk/google";

/**
 * Proveedor: Google Generative AI (Gemini) — free tier sin tarjeta de crédito.
 * Obtén tu key en https://aistudio.google.com/apikey y ponla en
 * `GOOGLE_GENERATIVE_AI_API_KEY` (variable estándar del provider).
 */

export const CHAT_MODEL_ID = process.env.CHAT_MODEL ?? "gemini-2.0-flash";

export const EMBED_MODEL_ID = process.env.EMBED_MODEL ?? "gemini-embedding-001";

/** Dimensiones que pedimos al modelo. Debe coincidir con `vector(N)` en la DB. */
export const EMBED_DIMENSIONS = 768;

export const chatModel = google(CHAT_MODEL_ID);
export const embeddingModel = google.embedding(EMBED_MODEL_ID);

/**
 * Opciones que se pasan al provider al embeber un chunk del corpus.
 * `RETRIEVAL_DOCUMENT` produce embeddings asimétricos optimizados para que
 * sean recuperados por una consulta tipo `RETRIEVAL_QUERY`.
 */
export const EMBED_DOC_PROVIDER_OPTS = {
  google: {
    outputDimensionality: EMBED_DIMENSIONS,
    taskType: "RETRIEVAL_DOCUMENT" as const,
  },
};

/** Opciones para embeber la pregunta del usuario en tiempo de búsqueda. */
export const EMBED_QUERY_PROVIDER_OPTS = {
  google: {
    outputDimensionality: EMBED_DIMENSIONS,
    taskType: "RETRIEVAL_QUERY" as const,
  },
};

export function assertAiProviderEnv(): void {
  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    throw new Error(
      "GOOGLE_GENERATIVE_AI_API_KEY no está definido. Crea una key en https://aistudio.google.com/apikey",
    );
  }
}
