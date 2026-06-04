/**
 * Construye el enlace `wa.me` para iniciar el chat de WhatsApp desde la landing.
 *
 * Configuración por variables de entorno públicas (visibles en el cliente):
 *   NEXT_PUBLIC_WHATSAPP_NUMBER    número en formato internacional, p. ej. "14155238886"
 *   NEXT_PUBLIC_WHATSAPP_JOIN_CODE código del sandbox, p. ej. "join advice-time"
 *
 * Si no hay variables definidas usa el número compartido del sandbox de Twilio
 * para que la build de preview no rompa.
 */

const SANDBOX_NUMBER = "14155238886";

const rawNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? SANDBOX_NUMBER;
const rawJoinCode = process.env.NEXT_PUBLIC_WHATSAPP_JOIN_CODE ?? "";

/** Sólo dígitos, sin "+" ni espacios — formato que espera wa.me. */
export const whatsappNumber = rawNumber.replace(/\D/g, "") || SANDBOX_NUMBER;

/** Código de unión normalizado (con prefijo "join"), o cadena vacía. */
export const whatsappJoinCode = (() => {
  const code = rawJoinCode.trim();
  if (!code) return "";
  return /^join\b/i.test(code) ? code : `join ${code}`;
})();

/** Texto que se precarga en el chat: el `join <code>` del sandbox, o un saludo. */
export const whatsappPrefill = whatsappJoinCode || "Hola";

/** URL `https://wa.me/<numero>?text=<mensaje>` lista para un <a href>. */
export function whatsappUrl(): string {
  return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappPrefill)}`;
}

/** Número formateado para mostrar, p. ej. "+1 415 523 8886". */
export function whatsappDisplayNumber(): string {
  const n = whatsappNumber;
  if (n === SANDBOX_NUMBER) return "+1 415 523 8886";
  return `+${n}`;
}
