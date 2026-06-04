import { Output, generateText } from "ai";
import { z } from "zod";
import { chatModel, assertAiProviderEnv } from "../ai/gateway";
import { bloqueContencion, bloqueDerivacion } from "../triage/derivaciones";
import { runTriageRules, type Severity } from "../triage/rules";
import {
  formatChunksForPrompt,
  formatCitedSources,
  retrieve,
  type RetrievedChunk,
} from "./retrieve";
import { SYSTEM_PROMPT, buildUserPrompt } from "./prompt";

const AnswerSchema = z.object({
  respuesta: z
    .string()
    .min(1)
    .describe(
      "Texto que se enviará al adolescente por WhatsApp. 3–6 oraciones, español neutro PE, sin moralizar.",
    ),
  severidad: z
    .enum(["bajo", "medio", "alto"])
    .describe("Severidad reevaluada según el mensaje + contexto."),
  categoria: z
    .string()
    .describe(
      "Tema principal abreviado (anticoncepcion, its, embarazo, abuso, violencia, ideacion_suicida, otros).",
    ),
  requiere_derivacion: z
    .boolean()
    .describe("True si debe orientarse a Línea 100/CEM/DEMUNA/centro de salud."),
  fuentes_citadas: z
    .array(z.number().int().nonnegative())
    .describe("Índices (base 1) de las fuentes del contexto realmente usadas."),
  tag: z
    .string()
    .describe("Etiqueta corta para métrica de tópicos (1-3 palabras kebab-case)."),
});

export type AnswerResult = {
  respuesta: string;
  severidad: Severity;
  categoria: string;
  requiere_derivacion: boolean;
  fuentes_citadas: number[];
  tag: string;
  chunks: RetrievedChunk[];
  triage_rule_hit: boolean;
};

const WHATSAPP_LIMIT = 1500;

/**
 * Une cuerpo + fuentes + derivación respetando el tope de WhatsApp, pero
 * recortando SIEMPRE primero el cuerpo: las fuentes y, sobre todo, la
 * derivación nunca se cortan en silencio. (El truncado duro de twilio.ts queda
 * como última red de seguridad.)
 */
function ensamblarRespuesta(
  body: string,
  citas: string,
  derivacion: string,
  limit = WHATSAPP_LIMIT,
): string {
  const colas = [citas, derivacion].filter(Boolean).join("\n\n");
  const cola = colas ? `\n\n${colas}` : "";
  const espacio = limit - cola.length;
  let cuerpo = body.trim();
  if (cuerpo.length > espacio) {
    cuerpo = espacio > 1 ? `${cuerpo.slice(0, espacio - 1).trimEnd()}…` : "";
  }
  return `${cuerpo}${cola}`.trimStart();
}

export async function answer(message: string): Promise<AnswerResult> {
  assertAiProviderEnv();

  const triage = runTriageRules(message);

  // Atajo determinista: si una regla detectó riesgo crítico, respondemos sin
  // esperar al LLM. Vidas > tokens.
  if (triage.severity === "alto") {
    return {
      respuesta: bloqueContencion(triage.category),
      severidad: "alto",
      categoria: triage.category,
      requiere_derivacion: true,
      fuentes_citadas: [],
      tag: triage.category,
      chunks: [],
      triage_rule_hit: true,
    };
  }

  const chunks = await retrieve(message);
  const contextBlock = formatChunksForPrompt(chunks);

  const result = await generateText({
    model: chatModel,
    output: Output.object({ schema: AnswerSchema }),
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt({
      question: message,
      contextBlock,
      triageHint:
        triage.category !== "ninguna"
          ? `posible ${triage.category} (severidad reglas=${triage.severity})`
          : undefined,
    }),
    temperature: 0.3,
  });

  const obj = result.output;

  const citas = formatCitedSources(chunks, obj.fuentes_citadas);
  const derivacion = obj.requiere_derivacion
    ? bloqueDerivacion(obj.categoria)
    : "";
  const finalRespuesta = ensamblarRespuesta(obj.respuesta, citas, derivacion);

  return {
    respuesta: finalRespuesta,
    severidad: obj.severidad,
    categoria: obj.categoria,
    requiere_derivacion: obj.requiere_derivacion,
    fuentes_citadas: obj.fuentes_citadas,
    tag: obj.tag,
    chunks,
    triage_rule_hit: false,
  };
}
