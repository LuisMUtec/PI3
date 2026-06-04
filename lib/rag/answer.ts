import { Output, generateText } from "ai";
import { z } from "zod";
import { chatModel, assertAiProviderEnv } from "../ai/gateway";
import { bloqueDerivacion } from "../triage/derivaciones";
import { runTriageRules, type Severity } from "../triage/rules";
import {
  formatChunksForPrompt,
  formatCitedSources,
  retrieve,
  type RetrievedChunk,
} from "./retrieve";
import {
  formatHistoryForPrompt,
  lastUserTurn,
  type ConversationTurn,
} from "./memory";
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

const RESPUESTA_RIESGO_INMEDIATO =
  "Lamento mucho que estés pasando por esto. No estás solo/a y existe ayuda disponible y gratuita ahora mismo. Por favor, contacta a una de estas líneas — son confidenciales y atendidas por profesionales:";

export type AnswerOptions = {
  /** Ventana reciente de la conversación (orden cronológico) para dar memoria. */
  history?: ConversationTurn[];
};

export async function answer(
  message: string,
  opts: AnswerOptions = {},
): Promise<AnswerResult> {
  assertAiProviderEnv();

  const history = opts.history ?? [];
  const triage = runTriageRules(message);

  // Atajo determinista: si una regla detectó riesgo crítico, respondemos sin
  // esperar al LLM. Vidas > tokens.
  if (triage.severity === "alto") {
    return {
      respuesta: `${RESPUESTA_RIESGO_INMEDIATO}\n\n${bloqueDerivacion()}`,
      severidad: "alto",
      categoria: triage.category,
      requiere_derivacion: true,
      fuentes_citadas: [],
      tag: triage.category,
      chunks: [],
      triage_rule_hit: true,
    };
  }

  // Contextualiza la recuperación con el último turno del usuario para que las
  // preguntas de seguimiento ("¿y los efectos?") recuperen los chunks correctos.
  // Mantenemos una sola llamada al LLM (sin reescritura de consulta) para no
  // sumar latencia ni costo; el mensaje actual sigue dominando la consulta.
  const prevUserTurn = lastUserTurn(history);
  const retrievalQuery = prevUserTurn
    ? `${prevUserTurn}\n${message}`
    : message;
  const chunks = await retrieve(retrievalQuery);
  const contextBlock = formatChunksForPrompt(chunks);

  const result = await generateText({
    model: chatModel,
    output: Output.object({ schema: AnswerSchema }),
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt({
      question: message,
      contextBlock,
      historyBlock: formatHistoryForPrompt(history),
      triageHint:
        triage.category !== "ninguna"
          ? `posible ${triage.category} (severidad reglas=${triage.severity})`
          : undefined,
    }),
    temperature: 0.3,
  });

  const obj = result.output;

  const citas = formatCitedSources(chunks, obj.fuentes_citadas);

  const partes = [obj.respuesta];
  if (citas) partes.push(citas);
  if (obj.requiere_derivacion) partes.push(bloqueDerivacion());
  const finalRespuesta = partes.join("\n\n");

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
