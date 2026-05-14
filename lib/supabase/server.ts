import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Polyfill: Supabase Realtime requiere WebSocket. Node < 22 no lo trae nativo.
if (typeof globalThis.WebSocket === "undefined") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ws = require("ws");
  (globalThis as unknown as { WebSocket: unknown }).WebSocket = ws.WebSocket ?? ws;
}

let cached: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar definidos en el entorno.",
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "x-application-name": "rag-whatsapp-mvp" } },
  });

  return cached;
}
