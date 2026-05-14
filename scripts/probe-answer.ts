import { answer } from "../lib/rag/answer";

async function main(): Promise<void> {
  const q = process.argv.slice(2).join(" ") || "¿Cómo se transmite el VIH?";
  const result = await answer(q);
  console.log("===== PREGUNTA =====\n" + q);
  console.log("\n===== RESPUESTA FINAL =====\n" + result.respuesta);
  console.log("\n===== META =====");
  console.log({
    severidad: result.severidad,
    categoria: result.categoria,
    requiere_derivacion: result.requiere_derivacion,
    fuentes_citadas: result.fuentes_citadas,
    triage_rule_hit: result.triage_rule_hit,
    num_chunks: result.chunks.length,
  });
  console.log("\n===== CHUNKS RECUPERADOS =====");
  result.chunks.forEach((c, i) =>
    console.log(
      `[${i + 1}] score=${c.score.toFixed(3)} source=${c.source} title=${c.document_title} section=${c.section_title}`,
    ),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
