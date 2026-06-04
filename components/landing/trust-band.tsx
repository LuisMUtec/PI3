import { BookOpenCheck, HeartHandshake, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Pillar = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const pillars: Pillar[] = [
  {
    icon: ShieldCheck,
    title: "Anónimo y privado",
    description:
      "No guardamos tu número ni tus mensajes en nuestros servidores. Tu identidad queda protegida.",
  },
  {
    icon: HeartHandshake,
    title: "Sin juicios",
    description:
      "Pregunta con confianza, sin vergüenza. Aquí no hay preguntas tontas ni respuestas que te avergüencen.",
  },
  {
    icon: BookOpenCheck,
    title: "Información confiable",
    description:
      "Las respuestas se basan en documentos del MINSA, la OMS, UNFPA y UNICEF.",
  },
];

export function TrustBand() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-12 sm:px-6 sm:py-16">
      <div className="grid gap-5 sm:grid-cols-3">
        {pillars.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Icon className="size-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-slate-900">
              {title}
            </h3>
            <p className="mt-1.5 text-sm text-slate-600">{description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
