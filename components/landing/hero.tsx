import { ArrowDown, BadgeCheck, Check, Lock } from "lucide-react";
import { WhatsappCta } from "./whatsapp-cta";
import { WhatsappIcon } from "./whatsapp-icon";

const trustPoints = ["Anónimo", "Gratis", "Sin registros"];

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      {/* Fondo degradado + manchas decorativas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-50 via-background to-background"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-teal-200/40 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 top-32 size-72 rounded-full bg-emerald-200/30 blur-3xl"
      />

      <div className="relative mx-auto grid w-full max-w-5xl items-center gap-12 px-5 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-8 lg:py-24">
        {/* Columna de texto */}
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
            <Lock className="size-3.5" />
            Anónimo, gratis y sin registros
          </span>

          <h1 className="mt-5 text-balance text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
            Resuelve tus dudas sobre sexualidad, sin vergüenza
          </h1>

          <p className="mt-5 max-w-xl text-pretty text-lg text-slate-600">
            Un chat de WhatsApp para adolescentes de El Carmen, Ica. Pregunta lo
            que quieras y recibe información clara y confiable, basada en fuentes
            del MINSA y la OMS.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <WhatsappCta label="Empezar en WhatsApp" />
            <a
              href="#como-funciona"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-base font-medium text-slate-700 transition-colors hover:text-primary"
            >
              Cómo funciona
              <ArrowDown className="size-4" />
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
            {trustPoints.map((point) => (
              <li
                key={point}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-600"
              >
                <Check className="size-4 text-primary" />
                {point}
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-xl text-xs text-slate-500">
            Orientación informativa basada en fuentes del MINSA y la OMS. No
            reemplaza una consulta médica profesional.
          </p>
        </div>

        {/* Columna del mockup de chat */}
        <div className="relative lg:justify-self-end">
          <ChatPreview />
        </div>
      </div>
    </section>
  );
}

function ChatPreview() {
  return (
    <div className="mx-auto w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-2.5 shadow-xl ring-1 ring-slate-900/5 transition-transform duration-300 lg:hover:-translate-y-1">
      {/* Barra superior estilo WhatsApp */}
      <div className="flex items-center gap-3 rounded-2xl bg-primary px-4 py-3 text-primary-foreground">
        <span className="flex size-9 items-center justify-center rounded-full bg-white/20">
          <WhatsappIcon className="size-5" />
        </span>
        <div className="leading-tight">
          <p className="text-sm font-semibold">Orientación Anónima</p>
          <p className="text-xs text-primary-foreground/80">
            Asistente automático
          </p>
        </div>
      </div>

      {/* Conversación */}
      <div className="space-y-3 px-2 py-4">
        <div className="flex justify-end">
          <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-whatsapp px-3.5 py-2 text-sm text-whatsapp-foreground shadow-sm">
            Hola, ¿es normal tener muchas dudas sobre mi cuerpo?
          </p>
        </div>

        <div className="flex justify-start">
          <div className="max-w-[88%] rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-2.5 text-sm text-slate-700 shadow-sm">
            <p>
              Sí, es totalmente normal 💚 Durante la adolescencia el cuerpo
              cambia mucho y tener preguntas es parte de crecer sano.
            </p>
            <p className="mt-2 inline-flex items-center gap-1 rounded-md bg-teal-50 px-2 py-0.5 text-xs font-medium text-teal-700">
              <BadgeCheck className="size-3.5" />
              Fuente: MINSA
            </p>
          </div>
        </div>

        <div className="flex justify-start">
          <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-slate-100 px-3.5 py-3">
            <span className="size-1.5 animate-pulse rounded-full bg-slate-400" />
            <span className="size-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
