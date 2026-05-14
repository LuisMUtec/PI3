import { describe, expect, it } from "vitest";
import { runTriageRules } from "./rules";

describe("runTriageRules", () => {
  it.each([
    ["me quiero matar", "ideacion_suicida"],
    ["ya no quiero vivir", "ideacion_suicida"],
    ["mi tío me tocó cuando era niña", "abuso_sexual"],
    ["mi pareja me pega siempre", "violencia"],
    [
      "tengo 13 años y mi novio tiene 22 y tenemos relaciones",
      "estupro",
    ],
    ["tengo dos semanas de atraso", "embarazo_riesgo"],
    ["tengo secreción verde con mal olor", "its_aguda"],
  ])("detecta categoría %s en mensaje crítico", (msg, expected) => {
    const r = runTriageRules(msg);
    expect(r.category).toBe(expected);
    expect(["alto", "medio"]).toContain(r.severity);
  });

  it("retorna bajo/ninguna para consultas informativas", () => {
    const r = runTriageRules("¿cómo se usa un condón?");
    expect(r.severity).toBe("bajo");
    expect(r.category).toBe("ninguna");
  });

  it("retorna bajo/ninguna para mensajes neutros", () => {
    const r = runTriageRules("hola, quiero saber sobre anticonceptivos");
    expect(r.severity).toBe("bajo");
  });
});
