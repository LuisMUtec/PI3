import { DIAGRAM_HTML } from "./diagram";

/**
 * Sirve el diagrama de arquitectura en la ruta `/arquitectura`.
 *
 * Es un route handler (no una `page.tsx`) a propósito: el diagrama es un
 * documento HTML autocontenido con su propio `<head>`/`<style>`, así que lo
 * devolvemos tal cual y queda aislado del CSS global del sitio. Da una URL
 * limpia (`/arquitectura`, sin extensión) coherente con el resto de rutas, y
 * funciona igual en cualquier host (sin depender de la resolución de archivos
 * estáticos de la plataforma).
 */
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(DIAGRAM_HTML, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
