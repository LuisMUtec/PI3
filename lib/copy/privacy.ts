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
 * NOTA para el merge de la memoria conversacional: si esa función se activa
 * (retiene el hilo unas horas y se borra con SALIR), añade aquí UNA frase sobre
 * esa retención temporal y su borrado, y consúmela desde el WELCOME. Mantén
 * este archivo como la única fuente para no volver a desincronizar el copy.
 */

export const PRIVACY_WELCOME =
  "Hola 👋. Este es un canal *anónimo y gratuito* para resolver dudas sobre " +
  "salud sexual y reproductiva. Para nosotros eres anónimo: guardamos solo un " +
  "código, no tu número. Eso sí, WhatsApp y nuestro proveedor de mensajería " +
  "(Twilio) sí ven tus mensajes, como en cualquier chat. Escribe *SALIR* para " +
  "terminar. Recuerda: soy una orientación informativa, no reemplazo a un " +
  "profesional de salud.";

export const PRIVACY_LANDING =
  "Para empezar, escribe al WhatsApp del piloto. Para nosotros eres anónimo: " +
  "guardamos solo un código, no tu número. WhatsApp y nuestro proveedor de " +
  "mensajería sí ven tus mensajes, como en cualquier chat.";
