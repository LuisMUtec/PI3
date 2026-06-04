import { MessageCircleHeart } from "lucide-react";

const team = [
  "Joel Cayllahua",
  "Abel Escobar",
  "Piero Pilco",
  "Leonardo Montoya",
  "Luis Maquera",
];

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/70 bg-slate-50">
      <div className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageCircleHeart className="size-4" />
              </span>
              <span className="text-sm font-semibold tracking-tight text-slate-900">
                Orientación Sexual Anónima
              </span>
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Orientación informativa en salud sexual y reproductiva para
              adolescentes de El Carmen, Ica. Anónima y basada en fuentes
              validadas (MINSA, OMS/OPS, UNFPA, UNICEF).
            </p>
          </div>

          <div className="text-sm text-slate-600">
            <p className="font-semibold text-slate-900">
              Proyectos Interdisciplinarios 3 — UTEC
            </p>
            <p className="mt-2">{team.join(" · ")}</p>
            <p className="mt-1 text-slate-500">
              Docente: Giancarlo Espinoza Delgado
            </p>
          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-amber-200/70 bg-amber-50 px-4 py-3">
          <p className="text-xs leading-relaxed text-amber-900">
            <strong className="font-semibold">Aviso:</strong> Este es un proyecto
            académico de orientación informativa. No reemplaza una consulta
            médica profesional ni una atención de emergencia. Ante una situación
            crítica, contacta las líneas de ayuda o el centro de salud más
            cercano.
          </p>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          © 2026 Orientación Sexual Anónima · Proyecto académico sin fines de
          lucro.
        </p>
      </div>
    </footer>
  );
}
