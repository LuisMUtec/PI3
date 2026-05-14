export type Chunk = {
  content: string;
  index: number;
};

const DEFAULT_TARGET_TOKENS = 600;
const DEFAULT_OVERLAP_TOKENS = 120;

/** Aproximación 1 token ~= 4 chars en español. */
const CHARS_PER_TOKEN = 4;

const SPLIT_PATTERNS: RegExp[] = [
  /\n#{1,6} .+\n/g, // encabezados markdown
  /\n\n+/g, // párrafos
  /(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿¡])/g, // oraciones
  /\s+/g, // palabras (último recurso)
];

export function chunkText(
  text: string,
  targetTokens = DEFAULT_TARGET_TOKENS,
  overlapTokens = DEFAULT_OVERLAP_TOKENS,
): Chunk[] {
  const targetChars = targetTokens * CHARS_PER_TOKEN;
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;

  const pieces = recursiveSplit(text.trim(), targetChars, 0);
  const merged = mergeWithOverlap(pieces, targetChars, overlapChars);

  return merged.map((content, index) => ({ content, index }));
}

function recursiveSplit(
  text: string,
  targetChars: number,
  patternIndex: number,
): string[] {
  if (text.length <= targetChars) return [text];
  const pattern = SPLIT_PATTERNS[patternIndex];
  if (!pattern) {
    const out: string[] = [];
    for (let i = 0; i < text.length; i += targetChars) {
      out.push(text.slice(i, i + targetChars));
    }
    return out;
  }
  const parts = text.split(pattern).filter(Boolean);
  if (parts.length === 1) {
    return recursiveSplit(text, targetChars, patternIndex + 1);
  }
  const out: string[] = [];
  for (const part of parts) {
    if (part.length <= targetChars) {
      out.push(part);
    } else {
      out.push(...recursiveSplit(part, targetChars, patternIndex + 1));
    }
  }
  return out;
}

function mergeWithOverlap(
  pieces: string[],
  targetChars: number,
  overlapChars: number,
): string[] {
  const chunks: string[] = [];
  let buffer = "";
  for (const piece of pieces) {
    if (buffer.length + piece.length + 1 <= targetChars) {
      buffer = buffer ? `${buffer}\n${piece}` : piece;
      continue;
    }
    if (buffer) chunks.push(buffer);
    const tail = buffer.slice(Math.max(0, buffer.length - overlapChars));
    buffer = tail ? `${tail}\n${piece}` : piece;
  }
  if (buffer.trim().length > 0) chunks.push(buffer);
  return chunks;
}
