import { PRIVACY_LANDING } from "@/lib/copy/privacy";

export default function Home() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="mb-3 text-3xl font-semibold text-slate-900">
        Orientación Sexual Anónima
      </h1>
      <p className="mb-2 text-slate-700">
        Servicio confidencial de orientación para adolescentes de El Carmen,
        Ica.
      </p>
      <p className="text-slate-600">{PRIVACY_LANDING}</p>
      <hr className="my-8 border-slate-200" />
      <p className="text-sm text-slate-500">
        Proyecto académico — Proyectos Interdisciplinarios 3, UTEC.
      </p>
    </main>
  );
}
