export type Severity = "bajo" | "medio" | "alto";

export type TriageCategory =
  | "ideacion_suicida"
  | "abuso_sexual"
  | "violencia"
  | "estupro"
  | "its_aguda"
  | "embarazo_riesgo"
  | "ninguna";

export type TriageMatch = {
  severity: Severity;
  category: TriageCategory;
  hits: string[];
};

type Rule = {
  category: TriageCategory;
  severity: Severity;
  patterns: RegExp[];
};

/**
 * Reglas deterministas para detección rápida de señales de riesgo en español
 * coloquial peruano. Capa de seguridad antes del RAG: si dispara `alto`, el
 * agente responde con derivación inmediata sin esperar al LLM.
 */
const RULES: Rule[] = [
  {
    category: "ideacion_suicida",
    severity: "alto",
    patterns: [
      /\bme\s+quiero\s+matar\b/i,
      /\bquiero\s+morir(me)?\b/i,
      /\bno\s+quiero\s+(seguir|vivir|existir)\b/i,
      /\bme\s+voy\s+a\s+(matar|suicidar)\b/i,
      /\bsuicid(arme|io|arnos)\b/i,
      /\bya\s+no\s+aguanto\b/i,
      /\bme\s+quiero\s+desaparecer\b/i,
    ],
  },
  {
    category: "abuso_sexual",
    severity: "alto",
    patterns: [
      /\bme\s+(viol(o|aron|aba)|tocaron|toc(o|aba)|forzaron|forz(o|aba))\b/i,
      /\babus(o|aron|aba)n?\s+de\s+m(í|i)\b/i,
      /\bmi\s+(t(í|i)o|primo|padrastro|pap(á|a)|hermano|profesor|vecino)\s+(me|nos)\s+(toc|forz|viol)/i,
      /\bme\s+oblig(o|aron|aba)\s+a\s+tener\s+sexo\b/i,
      /\bsin\s+mi\s+consentimiento\b/i,
    ],
  },
  {
    category: "estupro",
    severity: "alto",
    patterns: [
      // Indicios de relación sexual con menor de 14 (estupro en Perú).
      // Captura combinaciones "tengo <10-13>" + pareja con edad ≥ 18 en cualquier orden.
      /\btengo\s+1[0-3]\s+a(ñ|n)os\b[\s\S]*\b(novio|pareja|enamorad[oa]|t(í|i)o|primo|profesor|vecino)\b[\s\S]*\b(tiene|es|de)\s+(de\s+)?(1[89]|2\d|3\d|4\d|5\d)\b/i,
      /\b(novio|pareja|enamorad[oa])\b[\s\S]*\b(tiene|es|de)\s+(de\s+)?(1[89]|2\d|3\d|4\d|5\d)\b[\s\S]*\btengo\s+1[0-3]\s+a(ñ|n)os\b/i,
      /\btengo\s+1[0-3]\s+a(ñ|n)os\b[\s\S]*\b(novio|pareja|enamorad[oa]).*(mayor|adulto|grande)/i,
    ],
  },
  {
    category: "violencia",
    severity: "alto",
    patterns: [
      /\bme\s+(pega|golpea|maltrata)n?\b/i,
      /\bmi\s+(pap(á|a)|mam(á|a)|pareja|enamorad[oa])\s+me\s+(pega|golpea|grita|insulta)/i,
      /\btengo\s+miedo\s+de\s+(mi|que\s+me)/i,
    ],
  },
  {
    category: "its_aguda",
    severity: "medio",
    patterns: [
      /\b(sangrado|hemorragia)\s+(abundante|que\s+no\s+para)/i,
      /\b(dolor|ardor)\s+muy\s+fuerte\s+al\s+(orinar|tener\s+relaciones)/i,
      /\b(úlcera|llaga|herida)\s+en\s+(mis|los)?\s*(genitales|pene|vagina|vulva)/i,
      /\bsecreci(ó|o)n\s+(verde|amarilla|con\s+mal\s+olor|con\s+sangre)/i,
      /\bfiebre\s+alta\b.*(infecci(ó|o)n|its|enfermedad)/i,
    ],
  },
  {
    category: "embarazo_riesgo",
    severity: "medio",
    patterns: [
      /\bestoy\s+embarazada\b/i,
      /\bcreo\s+que\s+estoy\s+embarazada\b/i,
      /\btengo\s+(\d+|un|dos|tres)\s+semanas?\s+de\s+atraso/i,
      /\bme\s+vino\s+(la\s+regla\s+)?con\s+sangrado\s+(raro|fuerte|abundante)/i,
    ],
  },
];

export function runTriageRules(message: string): TriageMatch {
  const text = message.normalize("NFC");
  for (const rule of RULES) {
    const hits = rule.patterns
      .map((p) => text.match(p)?.[0])
      .filter((m): m is string => Boolean(m));
    if (hits.length > 0) {
      return { severity: rule.severity, category: rule.category, hits };
    }
  }
  return { severity: "bajo", category: "ninguna", hits: [] };
}
