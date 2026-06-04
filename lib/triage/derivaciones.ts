import type { TriageCategory } from "./rules";

export type DerivacionId =
  | "linea_100"
  | "ama_113"
  | "cem"
  | "demuna"
  | "centro_salud"
  | "samu";

export type Derivacion = {
  id: DerivacionId;
  nombre: string;
  telefono: string;
  descripcion: string;
};

/**
 * Fuente ÚNICA de los datos de contacto. Tanto la contención de crisis como el
 * bloque de derivación informativa derivan de aquí: nunca se duplican teléfonos
 * ni direcciones, así no hay drift. Las entidades sin teléfono (CEM, DEMUNA,
 * Centro de Salud) degradan a su dirección sin romper el formato.
 */
export const DERIVACIONES_PRIORITARIAS: Derivacion[] = [
  {
    id: "linea_100",
    nombre: "Línea 100",
    telefono: "100",
    descripcion:
      "Atención gratuita 24/7 ante violencia familiar, sexual o psicológica.",
  },
  {
    id: "ama_113",
    nombre: "Línea AMA 113 opción 5",
    telefono: "113",
    descripcion:
      "Salud mental y prevención del suicidio del Ministerio de Salud.",
  },
  {
    id: "cem",
    nombre: "CEM (Centro Emergencia Mujer)",
    telefono: "",
    descripcion:
      "Atención psicológica, social y legal ante violencia. CEM Chincha: Av. Mariscal Castilla 545.",
  },
  {
    id: "demuna",
    nombre: "DEMUNA Chincha",
    telefono: "",
    descripcion:
      "Defensoría Municipal del Niño y Adolescente. Plaza de Armas, Chincha Alta.",
  },
  {
    id: "centro_salud",
    nombre: "Centro de Salud El Carmen",
    telefono: "",
    descripcion:
      "Establecimiento de salud local con atención diferenciada para adolescentes.",
  },
  {
    id: "samu",
    nombre: "SAMU",
    telefono: "106",
    descripcion: "Emergencias médicas, atención inmediata las 24 horas.",
  },
];

const POR_ID = DERIVACIONES_PRIORITARIAS.reduce(
  (acc, d) => {
    acc[d.id] = d;
    return acc;
  },
  {} as Record<DerivacionId, Derivacion>,
);

/**
 * Recurso PERTINENTE por categoría (un primario + un respaldo opcional). En vez
 * de volcar las 5 entidades de golpe, derivamos a lo que de verdad corresponde:
 * ideación → salud mental; violencia/abuso → Línea 100; estupro → DEMUNA.
 * NOTA clínica: este mapeo y los datos de contacto deben validarse contra fuente
 * oficial antes de un piloto real con adolescentes.
 */
type RecursoRef = { primario: DerivacionId; respaldo?: DerivacionId };

const RECURSO_POR_CATEGORIA: Record<
  Exclude<TriageCategory, "ninguna">,
  RecursoRef
> = {
  // ideación: el respaldo (106 SAMU) lo añade el cierre del guion, no como viñeta.
  ideacion_suicida: { primario: "ama_113" },
  abuso_sexual: { primario: "linea_100", respaldo: "cem" },
  violencia: { primario: "linea_100", respaldo: "cem" },
  estupro: { primario: "demuna", respaldo: "linea_100" },
  its_aguda: { primario: "centro_salud" },
  embarazo_riesgo: { primario: "centro_salud" },
};

const RECURSO_DEFAULT: RecursoRef = { primario: "linea_100", respaldo: "ama_113" };

/**
 * Resuelve la categoría (que puede venir como TriageCategory exacta desde las
 * reglas, o como texto libre del LLM: "abuso", "its", "embarazo"…) a su recurso
 * pertinente, con coincidencia tolerante y un default seguro.
 */
function resolverRecurso(categoria?: string): {
  primario: Derivacion;
  respaldo?: Derivacion;
} {
  const cat = buscarCategoria(categoria);
  const ref = (cat && RECURSO_POR_CATEGORIA[cat]) || RECURSO_DEFAULT;
  return {
    primario: POR_ID[ref.primario],
    respaldo: ref.respaldo ? POR_ID[ref.respaldo] : undefined,
  };
}

function buscarCategoria(
  categoria?: string,
): Exclude<TriageCategory, "ninguna"> | undefined {
  const key = (categoria ?? "").toLowerCase().trim();
  if (!key) return undefined;
  const keys = Object.keys(RECURSO_POR_CATEGORIA) as Array<
    Exclude<TriageCategory, "ninguna">
  >;
  return (
    keys.find((k) => k === key) ??
    (key.length >= 3
      ? keys.find((k) => k.includes(key) || key.includes(k))
      : undefined)
  );
}

function lineaContacto(d: Derivacion): string {
  const tel = d.telefono ? ` (📞 ${d.telefono})` : "";
  return `• *${d.nombre}*${tel} — ${d.descripcion}`;
}

// ---------------------------------------------------------------------------
// Acompañamiento (insight #4): bajar la barrera de acción. Texto fijo, neutro
// de canal (sirve para llamada o atención presencial), sin prometer nada que no
// podamos garantizar.
// ---------------------------------------------------------------------------
const LINEAS_ACOMPANAMIENTO = [
  "Es *gratis y confidencial*: te atiende una persona y no tienes que dar tu nombre.",
  "Pedir ayuda no te hace débil; es de las cosas más valientes que puedes hacer.",
  "Si no sabes cómo empezar, puedes decir: «Hola, necesito orientación sobre algo que me pasa».",
];

/**
 * Bloque de derivación para la rama NO-crítica (el LLM ya redactó una respuesta
 * empática). Muestra el/los contacto(s) pertinentes a la categoría — máximo dos,
 * no cinco — y añade el acompañamiento que reduce fricción y normaliza pedir
 * ayuda. `categoria` es opcional para no romper call-sites previos.
 */
export function bloqueDerivacion(categoria?: string): string {
  const { primario, respaldo } = resolverRecurso(categoria);
  const contactos = [primario, ...(respaldo ? [respaldo] : [])];
  return [
    "💚 *Buscar ayuda profesional:*",
    ...contactos.map(lineaContacto),
    ...LINEAS_ACOMPANAMIENTO,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Contención (insight #3): flujo calmar → consolar → encaminar para la ruta de
// crisis (severidad alta). Determinista y auditable: en crisis NO pasa por el
// LLM ("Vidas > tokens"). Validar la emoción concreta, nunca moralizar
// ("deberías"), cerrar con una pregunta abierta, máximo 2 contactos pertinentes.
// ---------------------------------------------------------------------------
type Contencion = {
  calmar: string;
  consolar: string;
  encaminarIntro: string;
  cierre: string;
};

const CONTENCION_POR_CATEGORIA: Partial<
  Record<Exclude<TriageCategory, "ninguna">, Contencion>
> = {
  ideacion_suicida: {
    calmar:
      "Gracias por contarme esto, sé que cuesta mucho ponerlo en palabras 💛. Que lo escribas ya es un paso muy valiente.",
    consolar:
      "No estás solo/a en esto. Lo que sientes ahora es muy pesado, pero puede cambiar, y hay personas preparadas para acompañarte a salir adelante.",
    encaminarIntro: "Una línea que te puede ayudar *ahora mismo*, gratis y confidencial:",
    cierre:
      "Si sientes que podrías hacerte daño en este momento, llama también al *106 (SAMU)*. ¿Quieres que sigamos hablando mientras decides?",
  },
  abuso_sexual: {
    calmar:
      "Lamento mucho que hayas pasado por esto, y quiero que sepas que *no es tu culpa* 💛. Hiciste bien en contarlo.",
    consolar:
      "No estás solo/a y esto tiene salida. Hay personas que te pueden creer, proteger y orientar sin juzgarte.",
    encaminarIntro: "Puedes apoyarte en:",
    cierre:
      "Todo es gratuito y confidencial. ¿Quieres que te cuente qué pasa cuando llamas?",
  },
  violencia: {
    calmar:
      "Siento que estés viviendo esto, no está bien que te traten así y *no es tu culpa* 💛.",
    consolar:
      "No tienes que aguantarlo solo/a. Hay quien puede ayudarte a estar a salvo.",
    encaminarIntro: "Puedes apoyarte en:",
    cierre:
      "Es gratis y confidencial las 24 horas. ¿Te ayudo a pensar cómo dar el primer paso?",
  },
  estupro: {
    calmar:
      "Gracias por confiarme esto 💛. Una relación con una persona mucho mayor puede ponerte en riesgo aunque ahora no lo sientas, y mereces estar protegido/a.",
    consolar:
      "No estás solo/a y hay personas cuyo trabajo es justamente cuidarte, sin meterte en problemas.",
    encaminarIntro: "Puedes acudir a:",
    cierre:
      "Es gratis y confidencial. ¿Quieres que te explique qué hace la DEMUNA?",
  },
};

const CONTENCION_DEFAULT: Contencion = {
  calmar: "Gracias por contarme lo que te pasa, sé que no es fácil dar este paso 💛.",
  consolar:
    "No estás solo/a en esto, y hay ayuda gratuita y confidencial para acompañarte.",
  encaminarIntro: "Puedes apoyarte en:",
  cierre: "¿Quieres que sigamos hablando?",
};

/**
 * Respuesta de contención para crisis: 3 tiempos + recurso pertinente (máx 2),
 * en un solo mensaje bien estructurado. Reemplaza el antiguo volcado de "1 frase
 * + 5 contactos".
 */
export function bloqueContencion(categoria?: string): string {
  const cat = buscarCategoria(categoria);
  const tpl = (cat && CONTENCION_POR_CATEGORIA[cat]) || CONTENCION_DEFAULT;
  const { primario, respaldo } = resolverRecurso(categoria);
  const contactos = [primario, ...(respaldo ? [respaldo] : [])]
    .map(lineaContacto)
    .join("\n");
  return [
    tpl.calmar,
    "",
    tpl.consolar,
    "",
    tpl.encaminarIntro,
    contactos,
    "",
    tpl.cierre,
  ].join("\n");
}
