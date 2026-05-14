import { getServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardData = {
  totalConsultas: number;
  conversacionesUnicas: number;
  derivaciones: number;
  latenciaP50: number;
  latenciaP95: number;
  porSeveridad: { severity: string; count: number }[];
  porTopico: { tag: string; count: number }[];
  ultimos7Dias: { day: string; count: number }[];
};

async function loadData(): Promise<DashboardData> {
  const supabase = getServerSupabase();

  const [
    logsRes,
    conversationsRes,
    triageRes,
    topicsRes,
  ] = await Promise.all([
    supabase
      .from("messages_log")
      .select("inbound_at, latency_ms, severity, ok")
      .gte(
        "inbound_at",
        new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      ),
    supabase.from("conversations").select("anon_hash", { count: "exact", head: true }),
    supabase
      .from("triage_events")
      .select("severity")
      .eq("derivation_sent", true),
    supabase
      .from("topic_metrics")
      .select("tag, count")
      .order("count", { ascending: false })
      .limit(10),
  ]);

  const logs = logsRes.data ?? [];
  const totalConsultas = logs.length;
  const conversacionesUnicas = conversationsRes.count ?? 0;
  const derivaciones = triageRes.data?.length ?? 0;

  const latencias = logs
    .map((l) => l.latency_ms ?? 0)
    .filter((n) => n > 0)
    .sort((a, b) => a - b);

  const pct = (arr: number[], p: number) =>
    arr.length === 0 ? 0 : arr[Math.floor((arr.length - 1) * p)];

  const porSeveridad = countBy(logs, (l) => l.severity ?? "sin clasificar");
  const ultimos7Dias = countByDay(logs, 7);

  return {
    totalConsultas,
    conversacionesUnicas,
    derivaciones,
    latenciaP50: pct(latencias, 0.5),
    latenciaP95: pct(latencias, 0.95),
    porSeveridad,
    porTopico: (topicsRes.data ?? []) as { tag: string; count: number }[],
    ultimos7Dias,
  };
}

function countBy<T>(
  items: T[],
  key: (x: T) => string,
): { severity: string; count: number }[] {
  const map = new Map<string, number>();
  for (const item of items) {
    const k = key(item);
    map.set(k, (map.get(k) ?? 0) + 1);
  }
  return [...map.entries()].map(([severity, count]) => ({ severity, count }));
}

function countByDay(
  items: { inbound_at: string }[],
  days: number,
): { day: string; count: number }[] {
  const out: { day: string; count: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    const count = items.filter((it) => it.inbound_at.startsWith(iso)).length;
    out.push({ day: iso, count });
  }
  return out;
}

export default async function DashboardPage() {
  const data = await loadData();

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <h1 className="mb-2 text-3xl font-semibold text-slate-900">
        Dashboard del piloto
      </h1>
      <p className="mb-8 text-sm text-slate-500">
        Métricas agregadas y anónimas — no se muestra contenido de mensajes ni
        identidades.
      </p>

      <section className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Consultas (30d)" value={data.totalConsultas} />
        <Stat label="Conversaciones únicas" value={data.conversacionesUnicas} />
        <Stat label="Derivaciones enviadas" value={data.derivaciones} />
        <Stat
          label="Latencia p95"
          value={`${(data.latenciaP95 / 1000).toFixed(1)} s`}
        />
      </section>

      <section className="mb-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Card title="Severidad observada">
          <Table
            rows={data.porSeveridad.map((s) => [s.severity, s.count])}
            cols={["Severidad", "Consultas"]}
          />
        </Card>
        <Card title="Temas más consultados">
          <Table
            rows={data.porTopico.map((t) => [t.tag, t.count])}
            cols={["Tema", "Consultas"]}
          />
        </Card>
      </section>

      <section>
        <Card title="Consultas en los últimos 7 días">
          <Table
            rows={data.ultimos7Dias.map((d) => [d.day, d.count])}
            cols={["Día", "Consultas"]}
          />
        </Card>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-teal-700">{title}</h2>
      {children}
    </div>
  );
}

function Table({
  rows,
  cols,
}: {
  rows: (string | number)[][];
  cols: string[];
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-slate-500">Sin datos.</p>;
  }
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b text-left text-xs uppercase tracking-wide text-slate-500">
          {cols.map((c) => (
            <th key={c} className="py-2 pr-2">
              {c}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-b border-slate-100">
            {row.map((cell, j) => (
              <td key={j} className="py-2 pr-2 text-slate-800">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
