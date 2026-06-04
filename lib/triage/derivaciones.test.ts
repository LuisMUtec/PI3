import { describe, expect, it } from "vitest";
import { bloqueContencion, bloqueDerivacion } from "./derivaciones";
import type { TriageCategory } from "./rules";

// Categorías que disparan la ruta determinista de crisis (severidad alta).
const CRISIS: Array<Exclude<TriageCategory, "ninguna" | "its_aguda" | "embarazo_riesgo">> =
  ["ideacion_suicida", "abuso_sexual", "violencia", "estupro"];

const contar = (s: string, re: RegExp) => (s.match(re) ?? []).length;

describe("bloqueContencion — ruta de crisis", () => {
  for (const cat of CRISIS) {
    it(`${cat}: 3 tiempos, sin moralizar, 1–2 contactos, cabe en WhatsApp`, () => {
      const out = bloqueContencion(cat);
      expect(out.length).toBeGreaterThan(0);
      expect(out.length).toBeLessThan(1500);
      // Nunca moralizar en crisis.
      expect(out.toLowerCase()).not.toMatch(/deber[ií]as?/);
      // Dosificación: como mucho dos contactos pertinentes (no el volcado de 5).
      const contactos = contar(out, /^•/gm);
      expect(contactos).toBeGreaterThanOrEqual(1);
      expect(contactos).toBeLessThanOrEqual(2);
    });
  }

  it("categoría desconocida usa plantilla por defecto con un recurso", () => {
    const out = bloqueContencion("otros");
    const contactos = contar(out, /^•/gm);
    expect(contactos).toBeGreaterThanOrEqual(1);
    expect(contactos).toBeLessThanOrEqual(2);
  });
});

describe("bloqueDerivacion — ruta no-crisis (acompañamiento)", () => {
  it("incluye reducción de fricción y normalización, máx 2 contactos", () => {
    const out = bloqueDerivacion("its");
    expect(out.toLowerCase()).toContain("confidencial");
    expect(out.toLowerCase()).toContain("no tienes que dar tu nombre");
    expect(contar(out, /^•/gm)).toBeLessThanOrEqual(2);
  });
});
