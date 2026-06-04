import { getServerSupabase } from "../supabase/server";

/**
 * Memoria conversacional efímera por usuario anónimo.
 *
 * Mantiene una ventana corta de los últimos turnos (texto) llaveada por el
 * `anon_hash` (SHA-256 + sal irreversible). Da continuidad a preguntas de
 * seguimiento sin retención indefinida: caduca por inactividad y se borra con
 * `SALIR`. Toda la lógica de purga/recorte vive en las funciones SQL
 * (`recall_conversation`, `remember_turns`, `forget_conversation`) de la
 * migración 0002; aquí solo invocamos esos RPC.
 */

export type ConversationTurn = {
  role: "user" | "assistant";
  content: string;
};

/** Parsea un entero positivo de env; cae al default si falta o está malformado. */
function posNum(value: string | undefined, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/** Turnos que se inyectan al prompt (los más recientes). */
const RECALL_TURNS = posNum(process.env.MEMORY_RECALL_TURNS, 8);
/** Turnos persistidos por usuario antes de recortar la ventana. */
const MAX_TURNS = posNum(process.env.MEMORY_MAX_TURNS, 12);
/** Vida por inactividad (minutos); cada mensaje nuevo reinicia el reloj. */
const TTL_MINUTES = posNum(process.env.MEMORY_TTL_MINUTES, 360);
/** Tope de caracteres por turno al construir el prompt (controla tokens). */
const MAX_PROMPT_CHARS = 500;
/** Tope de caracteres al persistir un turno (defensa ante mensajes enormes). */
const MAX_STORE_CHARS = 2000;

/**
 * Recupera la ventana reciente del usuario (orden cronológico). Nunca lanza:
 * ante un error de DB devuelve memoria vacía para no tumbar el pipeline RAG.
 */
export async function recallConversation(
  anonHash: string,
): Promise<ConversationTurn[]> {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.rpc("recall_conversation", {
    p_anon_hash: anonHash,
    p_limit: RECALL_TURNS,
  });
  if (error) {
    console.error("recallConversation error", error);
    return [];
  }
  return ((data ?? []) as { role: string; content: string }[]).map((r) => ({
    role: r.role === "assistant" ? "assistant" : "user",
    content: r.content,
  }));
}

/**
 * Persiste el par (mensaje del usuario, respuesta enviada) y refresca el TTL.
 * `inboundAt` (epoch ms del mensaje entrante) permite a la DB descartar este
 * write si el usuario ya pidió SALIR después de que llegó el mensaje.
 */
export async function rememberTurn(opts: {
  anonHash: string;
  userMessage: string;
  assistantMessage: string;
  inboundAt: number;
}): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.rpc("remember_turns", {
    p_anon_hash: opts.anonHash,
    p_user: clip(opts.userMessage, MAX_STORE_CHARS),
    p_assistant: clip(opts.assistantMessage, MAX_STORE_CHARS),
    p_ttl_minutes: TTL_MINUTES,
    p_max_turns: MAX_TURNS,
    p_inbound_at: new Date(opts.inboundAt).toISOString(),
  });
  if (error) console.error("rememberTurn error", error);
}

/** Borra toda la memoria del usuario (comando SALIR). */
export async function forgetConversation(anonHash: string): Promise<void> {
  const supabase = getServerSupabase();
  const { error } = await supabase.rpc("forget_conversation", {
    p_anon_hash: anonHash,
  });
  if (error) console.error("forgetConversation error", error);
}

/** Formatea la ventana para inyectarla al prompt (vacío si no hay historial). */
export function formatHistoryForPrompt(history: ConversationTurn[]): string {
  if (history.length === 0) return "";
  return history
    .map((t) => {
      const who = t.role === "assistant" ? "Asistente" : "Usuario";
      return `${who}: ${clip(t.content, MAX_PROMPT_CHARS)}`;
    })
    .join("\n");
}

/**
 * Último mensaje del usuario en la ventana, para contextualizar la consulta de
 * recuperación (RAG) en preguntas de seguimiento como "¿y los efectos?".
 */
export function lastUserTurn(history: ConversationTurn[]): string | null {
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].role === "user") return history[i].content;
  }
  return null;
}

function clip(s: string, max: number): string {
  const t = s.trim();
  return t.length <= max ? t : `${t.slice(0, max)}…`;
}
