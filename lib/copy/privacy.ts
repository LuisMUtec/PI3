/**
 * Punto ÚNICO de verdad del copy de privacidad (WhatsApp + web).
 *
 * Regla de honestidad: describir las DOS capas reales, no prometer absolutos.
 *  1) Frente a NUESTRO servidor el usuario es anónimo: guardamos un código
 *     (hash irreversible), no el número, y ninguna tabla guarda el texto del
 *     mensaje.
 *  2) Frente a WhatsApp/Meta y a Twilio (proveedor de mensajería) NO hay
 *     anonimato: ellos ven el número y el contenido, como en cualquier chat.
 *     Eso es inevitable por el diseño del canal y no podemos cambiarlo.
 *
 * Por eso NO usamos el absoluto "no guardamos el contenido de tus mensajes":
 * además de omitir a los intermediarios, dejaría de ser cierto si se habilita
 * la memoria conversacional.
 *
 * Memoria conversacional ACTIVA: el hilo se retiene unas horas (caduca por
 * inactividad) y se borra al escribir SALIR. La frase de retención temporal ya
 * está incluida abajo. Mantén este archivo como la única fuente para no volver
 * a desincronizar el copy.
 */

export const PRIVACY_WELCOME =
  "Hola 👋. Este es un canal *anónimo y gratuito* para resolver dudas sobre " +
  "salud sexual y reproductiva. Para nosotros eres anónimo: guardamos solo un " +
  "código, no tu número. Eso sí, WhatsApp y nuestro proveedor de mensajería " +
  "(Twilio) sí ven tus mensajes, como en cualquier chat. Para darte continuidad " +
  "recordamos tu conversación unas horas y luego se borra sola. Escribe *SALIR* " +
  "para terminar y borrarla. Recuerda: soy una orientación informativa, no " +
  "reemplazo a un profesional de salud.";

export const PRIVACY_LANDING =
  "Para empezar, escribe al WhatsApp del piloto. Para nosotros eres anónimo: " +
  "guardamos solo un código, no tu número. WhatsApp y nuestro proveedor de " +
  "mensajería sí ven tus mensajes, como en cualquier chat.";
