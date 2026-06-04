import { embed } from "ai";
import {
  EMBED_QUERY_PROVIDER_OPTS,
  embeddingModel,
} from "../ai/gateway";
import { getServerSupabase } from "../supabase/server";

export type RetrievedChunk = {
  id: string;
  content: string;
  source: string;
  document_title: string | null;
  section_title: string | null;
  url: string | null;
  page: number | null;
  metadata: Record<string, unknown>;
  score: number;
};

const TOP_K = Number(process.env.RAG_TOP_K ?? 5);
const MIN_SCORE = Number(process.env.RAG_MIN_SCORE ?? 0.55);

export async function retrieve(query: string): Promise<RetrievedChunk[]> {
  const { embedding } = await embed({
    model: embeddingModel,
    value: query,
    providerOptions: EMBED_QUERY_PROVIDER_OPTS,
  });

  const supabase = getServerSupabase();
  const { data, error } = await supabase.rpc("match_documents", {
    query_embedding: embedding,
    match_count: TOP_K,
    min_score: MIN_SCORE,
  });

  if (error) {
    console.error("retrieve.rpc error", error);
    return [];
  }
  return (data ?? []) as RetrievedChunk[];
}

export function formatChunksForPrompt(chunks: RetrievedChunk[]): string {
  if (chunks.length === 0) return "(sin fuentes recuperadas)";
  return chunks
    .map((c, i) => {
      const cite = [c.source, c.document_title, c.section_title]
        .filter(Boolean)
        .join(" · ");
      return `### Fuente [${i + 1}] — ${cite}\n${c.content}`;
    })
    .join("\n\n");
}

/**
 * Convierte los índices que el LLM devolvió en `fuentes_citadas` (base 1) en
 * un bloque legible para WhatsApp. Deduplica por (source, document_title) para
 * no repetir la misma fuente si dos chunks vinieron del mismo documento.
 *
 * Devuelve string vacío si no hay índices válidos.
 */
export function formatCitedSources(
  chunks: RetrievedChunk[],
  citedIndexes: number[],
): string {
  if (chunks.length === 0 || citedIndexes.length === 0) return "";
  const seen = new Set<string>();
  const lines: string[] = [];
  for (const idx of citedIndexes) {
    const chunk = chunks[idx - 1];
    if (!chunk) continue;
    const title = chunk.document_title?.trim() || chunk.section_title?.trim() || null;
    const key = `${chunk.source}::${title ?? ""}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const label = title ? `${chunk.source} — ${title}` : chunk.source;
    // URL en línea propia (sin paréntesis) para que WhatsApp la haga clicable.
    lines.push(chunk.url ? `• ${label}\n${chunk.url}` : `• ${label}`);
  }
  if (lines.length === 0) return "";
  return `📚 Fuentes:\n${lines.join("\n")}`;
}
