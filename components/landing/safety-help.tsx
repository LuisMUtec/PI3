import { Phone, TriangleAlert } from "lucide-react";
import { DERIVACIONES_PRIORITARIAS } from "@/lib/triage/derivaciones";

export function SafetyHelp() {
  return (
    <section id="ayuda" className="scroll-mt-20 bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-6">
        <div className="rounded-3xl border border-rose-200/80 bg-rose-50/70 p-6 sm:p-10">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <TriangleAlert className="size-5" />
            </span>
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                ¿Necesitas ayuda ahora?
              </h2>
              <p className="mt-2 max-w-2xl text-pretty text-base text-slate-700">
                Si estás en peligro o pasando por un momento muy difícil, estas
                líneas son <strong className="font-semibold">gratuitas</strong> y{" "}
                <strong className="font-semibold">confidenciales</strong>. No
                estás solo ni sola.
              </p>
            </div>
          </div>

          <ul className="mt-8 grid gap-4 sm:grid-cols-2">
            {DERIVACIONES_PRIORITARIAS.map((d) => (
              <li
                key={d.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {d.nombre}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">{d.descripcion}</p>
                </div>
                {d.telefono ? (
                  <a
                    href={`tel:${d.telefono}`}
                    className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
                  >
                    <Phone className="size-4" />
                    Llamar al {d.telefono}
                  </a>
                ) : null}
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-700">
              <strong className="font-semibold">¿Es una emergencia?</strong>{" "}
              Llama gratis al SAMU o acude al centro de salud más cercano.
            </p>
            <a
              href="tel:106"
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-rose-700"
            >
              <Phone className="size-4" />
              Llamar al 106 (SAMU)
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
