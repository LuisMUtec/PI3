/**
 * Ingesta del corpus: recorre `corpus/`, extrae texto (markdown + pdf),
 * trocea, genera embeddings vía AI Gateway, e inserta en `documents`.
 *
 * Uso:  pnpm tsx scripts/ingest.ts            # ingesta incremental
 *       pnpm tsx scripts/ingest.ts --reset    # vacía la tabla antes
 */
import { readFile, readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { embedMany } from "ai";
import { extractText, getDocumentProxy } from "unpdf";
import {
  EMBED_DOC_PROVIDER_OPTS,
  assertAiProviderEnv,
  embeddingModel,
} from "../lib/ai/gateway";
import { chunkText } from "../lib/rag/chunk";
import { getServerSupabase } from "../lib/supabase/server";

type Frontmatter = {
  source?: string;
  document_title?: string;
  url?: string;
  organismo?: string;
  fecha?: string;
};

type SourceDoc = {
  filePath: string;
  relPath: string;
  text: string;
  meta: Frontmatter;
};

const CORPUS_DIR = join(process.cwd(), "corpus");
const BATCH_SIZE = 32;

async function main() {
  assertAiProviderEnv();
  const supabase = getServerSupabase();
  const reset = process.argv.includes("--reset");

  if (reset) {
    console.log("⚠  Vaciando tabla documents …");
    const { error } = await supabase
      .from("documents")
      .delete()
      .gte("created_at", "1970-01-01");
    if (error) throw error;
  }

  const docs = await collectDocs(CORPUS_DIR);
  console.log(`📄 Encontrados ${docs.length} documentos en corpus/`);

  let totalChunks = 0;
  for (const doc of docs) {
    const chunks = chunkText(doc.text);
    if (chunks.length === 0) continue;

    console.log(`   → ${doc.relPath}: ${chunks.length} chunks`);

    for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
      const batch = chunks.slice(i, i + BATCH_SIZE);
      const { embeddings } = await embedMany({
        model: embeddingModel,
        values: batch.map((c) => c.content),
        providerOptions: EMBED_DOC_PROVIDER_OPTS,
      });

      const rows = batch.map((c, j) => ({
        content: c.content,
        source: doc.meta.source ?? "CURADO",
        document_title: doc.meta.document_title ?? doc.relPath,
        section_title: extractFirstHeading(c.content),
        url: doc.meta.url ?? null,
        page: null,
        metadata: {
          organismo: doc.meta.organismo ?? null,
          fecha: doc.meta.fecha ?? null,
          rel_path: doc.relPath,
          chunk_index: c.index,
        },
        embedding: embeddings[j],
      }));

      const { error } = await supabase.from("documents").insert(rows);
      if (error) {
        console.error("  ✗ insert error:", error.message);
        throw error;
      }
      totalChunks += rows.length;
    }
  }

  console.log(`✅ Ingesta completa. ${totalChunks} chunks insertados.`);
}

async function collectDocs(dir: string): Promise<SourceDoc[]> {
  const out: SourceDoc[] = [];
  const entries = await safeReaddir(dir);
  for (const name of entries) {
    if (name.startsWith(".") || name === "README.md" || name === "raw") continue;
    const filePath = join(dir, name);
    const st = await stat(filePath);
    if (st.isDirectory()) {
      out.push(...(await collectDocs(filePath)));
      continue;
    }
    const lower = name.toLowerCase();
    if (lower.endsWith(".md")) {
      const raw = await readFile(filePath, "utf8");
      const { body, meta } = parseFrontmatter(raw);
      out.push({
        filePath,
        relPath: relative(CORPUS_DIR, filePath),
        text: body,
        meta,
      });
    } else if (lower.endsWith(".pdf")) {
      const text = await extractPdfText(filePath);
      out.push({
        filePath,
        relPath: relative(CORPUS_DIR, filePath),
        text,
        meta: inferMetaFromPath(filePath),
      });
    }
  }
  return out;
}

async function safeReaddir(dir: string): Promise<string[]> {
  try {
    return await readdir(dir);
  } catch {
    return [];
  }
}

async function extractPdfText(filePath: string): Promise<string> {
  const buffer = await readFile(filePath);
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  return Array.isArray(text) ? text.join("\n\n") : text;
}

function parseFrontmatter(raw: string): { body: string; meta: Frontmatter } {
  const match = raw.match(/^---\n([\s\S]+?)\n---\n([\s\S]*)$/);
  if (!match) return { body: raw, meta: {} };
  const meta: Frontmatter = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^([a-z_]+):\s*(.+)$/i);
    if (m) (meta as Record<string, string>)[m[1]] = m[2].trim();
  }
  return { body: match[2], meta };
}

function inferMetaFromPath(filePath: string): Frontmatter {
  const lower = filePath.toLowerCase();
  if (lower.includes("/minsa/")) return { source: "MINSA" };
  if (lower.includes("/oms/")) return { source: "OMS" };
  if (lower.includes("/ops/")) return { source: "OPS" };
  if (lower.includes("/unfpa/")) return { source: "UNFPA" };
  if (lower.includes("/unicef/")) return { source: "UNICEF" };
  return { source: "CURADO" };
}

function extractFirstHeading(chunk: string): string | null {
  const m = chunk.match(/^#{1,6} (.+)$/m);
  return m ? m[1].trim() : null;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
