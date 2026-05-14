/**
 * Runner de evaluación sobre `eval/golden.jsonl`.
 *
 * Para cada caso:
 *  - invoca `answer()` con la pregunta del golden set
 *  - compara categoría, severidad y necesidad de derivación
 *  - revisa keywords mínimos en la respuesta
 *  - imprime un resumen y una matriz de confusión de triaje
 *
 * Uso:  pnpm eval
 */
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { answer, type AnswerResult } from "../lib/rag/answer";

type GoldenCase = {
  id: string;
  tipo: string;
  pregunta: string;
  categoria_esperada: string;
  severidad_esperada: "bajo" | "medio" | "alto";
  derivacion_esperada: boolean;
  keywords_respuesta: string[];
};

type EvalRow = {
  id: string;
  tipo: string;
  pregunta: string;
  esperado: Pick<
    GoldenCase,
    "categoria_esperada" | "severidad_esperada" | "derivacion_esperada"
  >;
  resultado: Pick<
    AnswerResult,
    "categoria" | "severidad" | "requiere_derivacion"
  >;
  keywords_hit: number;
  keywords_total: number;
  ok_severidad: boolean;
  ok_derivacion: boolean;
  ok_keywords: boolean;
};

async function main() {
  const path = join(process.cwd(), "eval", "golden.jsonl");
  const raw = await readFile(path, "utf8");
  const cases = raw
    .split("\n")
    .filter((l) => l.trim().length > 0)
    .map((l) => JSON.parse(l) as GoldenCase);

  console.log(`🧪 Ejecutando ${cases.length} casos golden…\n`);
  const rows: EvalRow[] = [];

  for (const c of cases) {
    try {
      const r = await answer(c.pregunta);
      const lowered = r.respuesta.toLowerCase();
      const hits = c.keywords_respuesta.filter((k) =>
        lowered.includes(k.toLowerCase()),
      );
      const row: EvalRow = {
        id: c.id,
        tipo: c.tipo,
        pregunta: c.pregunta,
        esperado: {
          categoria_esperada: c.categoria_esperada,
          severidad_esperada: c.severidad_esperada,
          derivacion_esperada: c.derivacion_esperada,
        },
        resultado: {
          categoria: r.categoria,
          severidad: r.severidad,
          requiere_derivacion: r.requiere_derivacion,
        },
        keywords_hit: hits.length,
        keywords_total: c.keywords_respuesta.length,
        ok_severidad: r.severidad === c.severidad_esperada,
        ok_derivacion: r.requiere_derivacion === c.derivacion_esperada,
        ok_keywords: hits.length >= Math.ceil(c.keywords_respuesta.length / 2),
      };
      rows.push(row);
      printRow(row);
    } catch (err) {
      console.error(`  ✗ ${c.id} falló:`, err);
    }
  }

  printSummary(rows);
  await writeFile(
    join(process.cwd(), "eval", "last-run.json"),
    JSON.stringify(rows, null, 2),
    "utf8",
  );
  console.log("\n📝 Reporte guardado en eval/last-run.json");
}

function printRow(r: EvalRow): void {
  const flag = (ok: boolean) => (ok ? "✅" : "❌");
  console.log(
    `  ${r.id} [${r.tipo}]  sev=${flag(r.ok_severidad)} ` +
      `deriv=${flag(r.ok_derivacion)} kw=${r.keywords_hit}/${r.keywords_total}` +
      `   → ${r.resultado.severidad}/${r.resultado.categoria}/${r.resultado.requiere_derivacion}`,
  );
}

function printSummary(rows: EvalRow[]): void {
  const total = rows.length;
  const okSev = rows.filter((r) => r.ok_severidad).length;
  const okDer = rows.filter((r) => r.ok_derivacion).length;
  const okKw = rows.filter((r) => r.ok_keywords).length;
  const criticos = rows.filter((r) => r.esperado.severidad_esperada === "alto");
  const criticosBien = criticos.filter((r) => r.ok_severidad && r.ok_derivacion);

  console.log("\n📊 Resumen:");
  console.log(
    `   severidad correcta:    ${okSev}/${total}  (${pct(okSev, total)}%)`,
  );
  console.log(
    `   derivación correcta:   ${okDer}/${total}  (${pct(okDer, total)}%)`,
  );
  console.log(
    `   keywords mín. ≥ 50%:   ${okKw}/${total}  (${pct(okKw, total)}%)`,
  );
  console.log(
    `   críticos resueltos OK: ${criticosBien.length}/${criticos.length} ` +
      `(recall en 'alto' = ${pct(criticosBien.length, criticos.length)}%)`,
  );

  const matrix: Record<string, Record<string, number>> = {
    bajo: { bajo: 0, medio: 0, alto: 0 },
    medio: { bajo: 0, medio: 0, alto: 0 },
    alto: { bajo: 0, medio: 0, alto: 0 },
  };
  for (const r of rows) {
    matrix[r.esperado.severidad_esperada][r.resultado.severidad] += 1;
  }
  console.log("\n📈 Matriz de confusión (filas=esperado, columnas=predicho):");
  console.log("            bajo  medio  alto");
  for (const k of ["bajo", "medio", "alto"] as const) {
    const row = matrix[k];
    console.log(
      `   ${k.padEnd(8)}  ${pad(row.bajo)}  ${pad(row.medio)}  ${pad(row.alto)}`,
    );
  }
}

function pad(n: number): string {
  return String(n).padStart(4, " ");
}
function pct(num: number, den: number): string {
  if (den === 0) return "0.0";
  return ((num / den) * 100).toFixed(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
