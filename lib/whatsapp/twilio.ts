import twilio from "twilio";

let cached: ReturnType<typeof twilio> | null = null;

function client() {
  if (cached) return cached;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error(
      "TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN deben estar definidos.",
    );
  }
  cached = twilio(sid, token);
  return cached;
}

/**
 * Verifica la firma `X-Twilio-Signature` para asegurar que el webhook viene
 * realmente de Twilio. Devuelve `true` si la firma es válida o si la
 * verificación está deshabilitada explícitamente (solo desarrollo).
 */
export function validateTwilioSignature(opts: {
  signature: string | null;
  url: string;
  params: Record<string, string>;
}): boolean {
  if (process.env.TWILIO_SKIP_SIGNATURE === "true") return true;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token || !opts.signature) return false;
  return twilio.validateRequest(
    token,
    opts.signature,
    opts.url,
    opts.params,
  );
}

/**
 * Envía un mensaje WhatsApp asíncrono usando el número del sandbox de Twilio.
 * El parámetro `to` debe venir ya con el prefijo `whatsapp:+...`.
 */
export async function sendWhatsApp(opts: {
  to: string;
  body: string;
}): Promise<void> {
  const from = process.env.TWILIO_WHATSAPP_FROM;
  if (!from) throw new Error("TWILIO_WHATSAPP_FROM no definido.");
  await client().messages.create({
    from,
    to: opts.to,
    body: truncateForWhatsApp(opts.body),
  });
}

/** Límite duro WhatsApp = 1600 chars. Cortamos con seguridad a 1500. */
function truncateForWhatsApp(text: string, limit = 1500): string {
  if (text.length <= limit) return text;
  return `${text.slice(0, limit - 1)}…`;
}
