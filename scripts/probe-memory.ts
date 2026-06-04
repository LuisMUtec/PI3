/**
 * Prueba conversacional de la memoria. Para cada escenario ejecuta:
 *   1) un TURNO 1 que establece contexto (y queda en el "historial"),
 *   2) un TURNO 2 de SEGUIMIENTO cuyo referente solo es resoluble con memoria,
 *      una vez CON historial y otra SIN historial (control).
 * Así se evidencia la diferencia que aporta la memoria. No toca la DB de
 * memoria (el historial se simula); usa retrieve() + LLM reales.
 *
 * Uso:
 *   node --env-file=.env.local --import tsx scripts/probe-memory.ts
 */
import { answer } from "../lib/rag/answer";
import type { ConversationTurn } from "../lib/rag/memory";

type Scenario = {
  id: string;
  porque: string; // qué dato/referente vive SOLO en el historial
  turno1: string;
  turno2: string;
};

const SCENARIOS: Scenario[] = [
  // --- Seguimientos con cohesión léxica (el RAG base suele resolver solos) ---
  {
    id: "elipsis",
    porque: "'tomarla' alude a la PAE introducida en el turno 1.",
    turno1: "¿Qué es la anticoncepción de emergencia?",
    turno2: "¿y cuánto tiempo tengo para tomarla?",
  },
  {
    id: "pronombre",
    porque: "'eso' no tiene anclaje léxico; solo el historial dice que es el condón.",
    turno1: "¿Cómo se usa correctamente el condón?",
    turno2: "¿y eso me protege también del VIH?",
  },
  // --- Alta ambigüedad: T2 anafórico + atractor legal que compite (estos
  //     evidencian que la memoria evita misclasificación / falsas crisis) ---
  {
    id: "edad",
    porque:
      "'a mi edad' (15) y 'conseguirlo' (=un método) viven solo en T1; compite con el atractor de consentimiento.",
    turno1:
      "Tengo 15 años y quiero empezar a usar un método anticonceptivo. ¿Qué opciones tengo?",
    turno2: "¿y a mi edad puedo conseguirlo sin permiso de mis papás?",
  },
  {
    id: "vih",
    porque:
      "'a mi edad' (16) y 'hacérmela' (=prueba de VIH) viven solo en T1; T2 compite con el atractor de consentimiento.",
    turno1: "Tengo 16 años y quiero hacerme la prueba del VIH. ¿Dónde voy?",
    turno2: "¿a mi edad puedo hacérmela sin permiso de mis papás?",
  },
  {
    id: "its",
    porque:
      "'atenderme' (=atención por una ITS) y la edad (15) solo están en T1.",
    turno1:
      "Tengo 15 años y creo que tengo una infección de transmisión sexual.",
    turno2: "¿puedo atenderme sin que mis papás se enteren a mi edad?",
  },
  {
    id: "metodo-legal",
    porque:
      "'eso' (=el implante) y la edad (15) solo están en T1; 'legal a mi edad' atrae fuerte hacia estupro/consentimiento.",
    turno1: "Tengo 15 años y quiero ponerme el implante anticonceptivo.",
    turno2: "¿eso es legal a mi edad sin permiso de mis papás?",
  },
];

function box(title: string): void {
  console.log("\n" + "═".repeat(70));
  console.log(title);
  console.log("═".repeat(70));
}

function metaLine(label: string, r: Awaited<ReturnType<typeof answer>>): string {
  const fuentes = r.chunks
    .map((c) => c.document_title ?? c.section_title ?? "?")
    .slice(0, 3)
    .join(" | ");
  return `[${label}] categoria=${r.categoria} sev=${r.severidad} chunks=${r.chunks.length} fuentes: ${fuentes}`;
}

async function main(): Promise<void> {
  for (const s of SCENARIOS) {
    box(`ESCENARIO «${s.id}» — discriminador: ${s.porque}`);

    console.log(`\n— TURNO 1 (usuario): ${s.turno1}`);
    const r1 = await answer(s.turno1, { history: [] });
    console.log(`  bot: ${r1.respuesta.replace(/\n+/g, " ")}`);
    console.log("  " + metaLine("t1", r1));

    const history: ConversationTurn[] = [
      { role: "user", content: s.turno1 },
      { role: "assistant", content: r1.respuesta },
    ];

    console.log(`\n— TURNO 2 (usuario): ${s.turno2}`);

    console.log("\n  ▶ CON memoria:");
    const rMem = await answer(s.turno2, { history });
    console.log(`  bot: ${rMem.respuesta.replace(/\n+/g, " ")}`);
    console.log("  " + metaLine("con-memoria", rMem));

    console.log("\n  ▶ SIN memoria (control):");
    const rCtl = await answer(s.turno2, { history: [] });
    console.log(`  bot: ${rCtl.respuesta.replace(/\n+/g, " ")}`);
    console.log("  " + metaLine("sin-memoria", rCtl));
  }

  box("FIN — comparar, por escenario, la respuesta CON vs SIN memoria al turno 2");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
