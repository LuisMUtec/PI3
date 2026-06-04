import { after } from "next/server";
import type { NextRequest } from "next/server";
import { anonHash } from "@/lib/anon/hash";
import { answer } from "@/lib/rag/answer";
import { getServerSupabase } from "@/lib/supabase/server";
import { sendWhatsApp, validateTwilioSignature } from "@/lib/whatsapp/twilio";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// El trabajo pesado corre en after() (pipeline RAG + envío a Twilio); damos
// margen para que la función siga viva tras responder 200 OK.
export const maxDuration = 60;

const EMPTY_TWIML = '<?xml version="1.0" encoding="UTF-8"?><Response/>';

const WELCOME =
  "Hola 👋. Este es un canal *anónimo y gratuito* para resolver dudas sobre salud sexual y reproductiva. " +
  "No guardamos tu número ni el contenido de tus mensajes. Escribe *SALIR* para terminar. " +
  "Recuerda: soy una orientación informativa, no reemplazo a un profesional de salud.";

const FAREWELL =
  "Gracias por escribir. Si necesitas ayuda urgente, llama a la *Línea 100* (100) o acude al Centro de Salud más cercano. Cuídate.";

const FALLBACK_ERROR =
  "Tuve un problema procesando tu consulta. Inténtalo de nuevo en unos minutos. " +
  "Si es urgente, llama a la *Línea 100* (100) o al *AMA 113 opción 5*.";

export async function POST(req: NextRequest): Promise<Response> {
  const inboundAt = Date.now();
  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);

  const signature = req.headers.get("x-twilio-signature");
  const baseUrl =
    process.env.PUBLIC_BASE_URL ?? `https://${req.headers.get("host")}`;
  const fullUrl = `${baseUrl.replace(/\/$/, "")}/api/whatsapp`;

  const valid = validateTwilioSignature({ signature, url: fullUrl, params });
  if (!valid) {
    return new Response("invalid signature", { status: 403 });
  }

  const from = params.From ?? "";
  const body = (params.Body ?? "").trim();

  if (!from || !body) return twimlResponse(EMPTY_TWIML);

  const hash = anonHash(from);
  const normalized = body.toLowerCase();

  // Comandos rápidos antes de invocar el pipeline.
  if (normalized === "salir" || normalized === "stop") {
    after(() => sendWhatsApp({ to: from, body: FAREWELL }).catch(logError));
    return twimlResponse(EMPTY_TWIML);
  }
  if (
    normalized === "hola" ||
    normalized === "start" ||
    normalized === "ayuda"
  ) {
    after(() => sendWhatsApp({ to: from, body: WELCOME }).catch(logError));
    return twimlResponse(EMPTY_TWIML);
  }

  // Procesamiento principal asíncrono: respondemos 200 OK ya y enviamos la
  // respuesta vía API de Twilio cuando el pipeline termine.
  after(async () => {
    try {
      const result = await answer(body);
      await sendWhatsApp({ to: from, body: result.respuesta });
      await persistMetrics({
        anonHash: hash,
        inboundAt,
        result,
      });
    } catch (err) {
      logError(err);
      await sendWhatsApp({ to: from, body: FALLBACK_ERROR }).catch(logError);
      await persistError({ anonHash: hash, inboundAt });
    }
  });

  return twimlResponse(EMPTY_TWIML);
}

async function persistMetrics(opts: {
  anonHash: string;
  inboundAt: number;
  result: Awaited<ReturnType<typeof answer>>;
}): Promise<void> {
  const supabase = getServerSupabase();
  const respondedAt = Date.now();
  const latency_ms = respondedAt - opts.inboundAt;

  await Promise.all([
    supabase.rpc("touch_conversation", {
      p_anon_hash: opts.anonHash,
      p_topic: opts.result.tag ?? null,
    }),
    supabase.rpc("bump_topic", { p_tag: opts.result.tag ?? "otros" }),
    supabase.from("messages_log").insert({
      anon_hash: opts.anonHash,
      inbound_at: new Date(opts.inboundAt).toISOString(),
      responded_at: new Date(respondedAt).toISOString(),
      latency_ms,
      used_chunks: opts.result.chunks.length,
      severity: opts.result.severidad,
      category: opts.result.categoria,
      ok: true,
    }),
    opts.result.requiere_derivacion || opts.result.severidad !== "bajo"
      ? supabase.from("triage_events").insert({
          anon_hash: opts.anonHash,
          severity: opts.result.severidad,
          category: opts.result.categoria,
          derivation_sent: opts.result.requiere_derivacion,
        })
      : Promise.resolve(),
  ]);
}

async function persistError(opts: {
  anonHash: string;
  inboundAt: number;
}): Promise<void> {
  const supabase = getServerSupabase();
  await supabase.from("messages_log").insert({
    anon_hash: opts.anonHash,
    inbound_at: new Date(opts.inboundAt).toISOString(),
    responded_at: new Date().toISOString(),
    latency_ms: Date.now() - opts.inboundAt,
    used_chunks: 0,
    ok: false,
    error_code: "pipeline_failure",
  });
}

function twimlResponse(xml: string): Response {
  return new Response(xml, {
    status: 200,
    headers: { "content-type": "text/xml; charset=utf-8" },
  });
}

function logError(err: unknown): void {
  console.error("[whatsapp webhook] error:", err);
}
