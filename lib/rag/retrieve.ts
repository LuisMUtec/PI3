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
