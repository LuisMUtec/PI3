import {
  Brain,
  HeartPulse,
  ShieldPlus,
  Sprout,
  Stethoscope,
  Users,
  UserRound,
  HelpCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Topic = {
  icon: LucideIcon;
  label: string;
};

const topics: Topic[] = [
  { icon: Sprout, label: "Cambios en mi cuerpo" },
  { icon: Users, label: "Relaciones y consentimiento" },
  { icon: ShieldPlus, label: "Métodos anticonceptivos" },
  { icon: Stethoscope, label: "Prevención de ITS" },
  { icon: Brain, label: "Emociones y autoestima" },
  { icon: HeartPulse, label: "Embarazo en la adolescencia" },
  { icon: UserRound, label: "Identidad y orientación" },
  { icon: HelpCircle, label: "Dónde pedir ayuda" },
];

export function Topics() {
  return (
    <section id="temas" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Temas
          </p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            ¿De qué puedes hablar?
          </h2>
          <p className="mt-3 text-pretty text-base text-slate-600">
            De todo lo que te genere dudas. Estos son algunos de los temas más
            consultados.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {topics.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="flex flex-col items-start gap-3 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-colors hover:border-teal-200"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Icon className="size-5" />
              </span>
              <span className="text-sm font-medium text-slate-800">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
