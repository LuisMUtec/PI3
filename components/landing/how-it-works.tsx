import { MessageSquareText, Send, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { WhatsappCta } from "./whatsapp-cta";

type Step = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    icon: Send,
    title: "Abre el chat",
    description:
      "Toca el botón y se abre WhatsApp con el mensaje listo para enviar. No necesitas registrarte.",
  },
  {
    icon: MessageSquareText,
    title: "Escribe tu pregunta",
    description:
      "Pregunta como le hablarías a alguien de confianza. Puedes escribir lo que quieras saber.",
  },
  {
    icon: Sparkles,
    title: "Recibe orientación",
    description:
      "Te llega una respuesta clara y confiable, con las fuentes en las que se basa.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="como-funciona"
      className="scroll-mt-20 bg-slate-50 py-16 sm:py-20"
    >
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Cómo funciona
          </p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Empezar es muy fácil
          </h2>
          <p className="mt-3 text-pretty text-base text-slate-600">
            Tres pasos y listo. Todo ocurre dentro de WhatsApp, la app que ya
            usas todos los días.
          </p>
        </div>

        <ol className="mt-12 grid gap-5 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, description }, index) => (
            <li
              key={title}
              className="relative rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
            >
              <span className="absolute right-5 top-5 text-5xl font-bold text-slate-100">
                {index + 1}
              </span>
              <span className="relative flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Icon className="size-5" />
              </span>
              <h3 className="relative mt-4 text-lg font-semibold text-slate-900">
                {title}
              </h3>
              <p className="relative mt-1.5 text-sm text-slate-600">
                {description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex justify-center">
          <WhatsappCta label="Empezar ahora" />
        </div>

        <div className="flex flex-col items-center text-center p-6 bg-slate-50 rounded-xl border border-slate-100">
  <p className="text-sm font-medium text-slate-600 max-w-xs">
    O escanea el código QR con tu celular para abrir el chat directamente:
  </p>
  <div className="mt-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm transition-transform hover:scale-105 duration-300">
    <img
      src="/qrcode.png"
      alt="Código QR de enlace al chat de WhatsApp"
      className="h-40 w-40 object-contain"
    />
  </div>
</div>
      </div>
    </section>
  );
}
