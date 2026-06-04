import type { Metadata } from "next";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDown,
  ArrowLeft,
  BookOpenCheck,
  Brain,
  CheckCheck,
  Cloud,
  Compass,
  Database,
  EyeOff,
  Fingerprint,
  HeartHandshake,
  LifeBuoy,
  Lock,
  MessageCircle,
  Phone,
  Puzzle,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Split,
  Zap,
} from "lucide-react";

import { SiteHeader } from "@/components/landing/site-header";
import { SiteFooter } from "@/components/landing/site-footer";
import { WhatsappCta } from "@/components/landing/whatsapp-cta";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Cómo funciona · El recorrido de un mensaje",
  description:
    "El recorrido completo de un mensaje de WhatsApp, desde que un adolescente escribe hasta que recibe una respuesta confiable — paso a paso.",
};

/* -------------------------------------------------------------------------- */
/* Paleta por fase: clases literales (Tailwind no resuelve clases dinámicas).  */
/* -------------------------------------------------------------------------- */
type Accent = {
  dot: string;
  text: string;
  num: string;
  cardBorder: string;
  topBorder: string;
  icon: string;
  swatch: string;
};

const accents = {
  recepcion: {
    dot: "bg-blue-500",
    text: "text-blue-700",
    num: "bg-blue-600",
    cardBorder: "border-l-blue-500",
    topBorder: "border-t-blue-500",
    icon: "text-blue-600",
    swatch: "bg-blue-500",
  },
  atajo: {
    dot: "bg-amber-500",
    text: "text-amber-700",
    num: "bg-amber-500",
    cardBorder: "border-l-amber-500",
    topBorder: "border-t-amber-500",
    icon: "text-amber-600",
    swatch: "bg-amber-500",
  },
  clasifica: {
    dot: "bg-violet-500",
    text: "text-violet-700",
    num: "bg-violet-600",
    cardBorder: "border-l-violet-500",
    topBorder: "border-t-violet-500",
    icon: "text-violet-600",
    swatch: "bg-violet-500",
  },
  crisis: {
    dot: "bg-rose-500",
    text: "text-rose-700",
    num: "bg-rose-600",
    cardBorder: "border-l-rose-500",
    topBorder: "border-t-rose-500",
    icon: "text-rose-600",
    swatch: "bg-rose-500",
  },
  rag: {
    dot: "bg-teal-500",
    text: "text-teal-700",
    num: "bg-teal-600",
    cardBorder: "border-l-teal-500",
    topBorder: "border-t-teal-500",
    icon: "text-teal-600",
    swatch: "bg-teal-500",
  },
  respuesta: {
    dot: "bg-emerald-500",
    text: "text-emerald-700",
    num: "bg-emerald-600",
    cardBorder: "border-l-emerald-500",
    topBorder: "border-t-emerald-500",
    icon: "text-emerald-600",
    swatch: "bg-emerald-500",
  },
} satisfies Record<string, Accent>;

/* -------------------------------------------------------------------------- */
/* Contenido                                                                   */
/* -------------------------------------------------------------------------- */
const keyIdeas: { icon: LucideIcon; title: string; description: ReactNode }[] = [
  {
    icon: EyeOff,
    title: "Anónimo",
    description:
      "Nunca guardamos el número de teléfono. Se convierte en un código irreversible.",
  },
  {
    icon: LifeBuoy,
    title: "Seguridad primero",
    description: (
      <>
        Ante una señal de peligro, se entrega ayuda humana al instante.{" "}
        <em>Vidas por encima de la tecnología.</em>
      </>
    ),
  },
  {
    icon: BookOpenCheck,
    title: "Fuentes confiables",
    description:
      "La IA solo responde con información de MINSA, OMS y UNFPA. No inventa.",
  },
];

type Step = {
  n: number;
  icon: LucideIcon;
  title: string;
  description: ReactNode;
  tech?: ReactNode;
};

type Phase = {
  accent: Accent;
  label: string;
  steps: Step[];
  /** ¿La línea del flujo continúa más allá del último paso de esta fase? */
  continues: boolean;
};

const strong = (text: string) => (
  <strong className="font-semibold text-slate-700">{text}</strong>
);

const Code = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-slate-200/70 px-1.5 py-0.5 font-mono text-[11px] text-slate-700">
    {children}
  </code>
);

const phasesBeforeFork: Phase[] = [
  {
    accent: accents.recepcion,
    label: "1 · Llega el mensaje",
    continues: true,
    steps: [
      {
        n: 1,
        icon: Smartphone,
        title: "El adolescente escribe",
        description:
          "Manda un mensaje por WhatsApp, como a cualquier contacto. No necesita instalar nada ni registrarse.",
      },
      {
        n: 2,
        icon: Cloud,
        title: "Twilio lo entrega a nuestro servidor",
        description:
          "Twilio es el “cartero” oficial entre WhatsApp y nuestra aplicación: recibe el mensaje y nos lo reenvía.",
        tech: (
          <>
            webhook <Code>POST /api/whatsapp</Code>
          </>
        ),
      },
      {
        n: 3,
        icon: ShieldCheck,
        title: "Comprobamos que de verdad viene de Twilio",
        description:
          "Verificamos una “firma” secreta. Si alguien intenta colarse haciéndose pasar por WhatsApp, se rechaza.",
        tech: (
          <>
            validación de <Code>X-Twilio-Signature</Code> → 403 si falla
          </>
        ),
      },
      {
        n: 4,
        icon: Fingerprint,
        title: "Anonimizamos a la persona",
        description:
          "El número de teléfono se transforma en un código único e irreversible. Sirve para hilar la conversación, pero nunca sabemos de quién es.",
        tech: (
          <>
            <Code>SHA-256(sal + número)</Code>
          </>
        ),
      },
    ],
  },
  {
    accent: accents.atajo,
    label: "2 · Atajos rápidos",
    continues: true,
    steps: [
      {
        n: 5,
        icon: Zap,
        title: "¿Es un comando especial?",
        description: (
          <>
            {strong("“Hola”")} → mensaje de bienvenida y privacidad.{" "}
            {strong("“Salir”")} → borra todo su historial al instante. Estos no
            usan la IA: respuesta inmediata.
          </>
        ),
      },
      {
        n: 6,
        icon: CheckCheck,
        title: "Confirmamos recepción y seguimos por detrás",
        description:
          "Le decimos a Twilio “recibido” de inmediato para no hacerlo esperar, mientras el trabajo pesado (pensar la respuesta) continúa en segundo plano.",
        tech: (
          <>
            responde <Code>200 OK</Code> y procesa en <Code>after()</Code>
          </>
        ),
      },
    ],
  },
  {
    accent: accents.clasifica,
    label: "3 · Entender y clasificar",
    continues: true,
    steps: [
      {
        n: 7,
        icon: Brain,
        title: "Recordamos la conversación",
        description:
          "Recuperamos los últimos mensajes de esa persona (anónima) para entender preguntas de seguimiento como “¿y los efectos?”. Esta memoria es temporal y se borra sola.",
      },
      {
        n: 8,
        icon: ShieldAlert,
        title: "Detector de riesgo (filtro de seguridad)",
        description:
          "Antes que nada, revisamos el mensaje buscando señales graves: ideas suicidas, abuso, violencia, embarazo en riesgo… Aquí el camino se divide en dos.",
        tech: "reglas/patrones deterministas por categoría y severidad",
      },
    ],
  },
];

const phaseAfterFork: Phase = {
  accent: accents.respuesta,
  label: "4 · Responder y registrar",
  continues: false,
  steps: [
    {
      n: 9,
      icon: Send,
      title: "Enviamos la respuesta por WhatsApp",
      description:
        "La persona recibe el mensaje en su chat, como si conversara con alguien de confianza.",
    },
    {
      n: 10,
      icon: Database,
      title: "Guardamos memoria y métricas anónimas",
      description: (
        <>
          Si no fue crisis, se recuerda el turno para dar continuidad. Y se
          anotan datos {strong("sin texto ni identidad")} (cuántas consultas, de
          qué temas, cuánto tardó) para mejorar el servicio.
        </>
      ),
    },
  ],
};

type Branch = {
  accent: Accent;
  badge: string;
  title: string;
  caption: string;
  steps: { icon: LucideIcon; title: string; description: ReactNode; tech?: ReactNode }[];
};

const branches: Branch[] = [
  {
    accent: accents.crisis,
    badge: "🆘",
    title: "SÍ — Es una crisis",
    caption: "No se usa la IA · Vidas por encima de los tokens",
    steps: [
      {
        icon: HeartHandshake,
        title: "Respuesta de contención",
        description:
          "Un mensaje preparado con cuidado: calmar, acompañar y orientar. Sin moralizar, validando lo que siente.",
      },
      {
        icon: Phone,
        title: "Líneas de ayuda reales",
        description:
          "Se deriva al recurso adecuado: Línea 100, AMA 113, CEM o DEMUNA, según el caso.",
      },
      {
        icon: Lock,
        title: "No se archiva el relato",
        description:
          "Por respeto y privacidad, los mensajes de crisis no se guardan en la memoria.",
      },
    ],
  },
  {
    accent: accents.rag,
    badge: "💬",
    title: "NO — Consulta informativa",
    caption: "Busca en fuentes y redacta con IA",
    steps: [
      {
        icon: Search,
        title: "Busca en el corpus médico",
        description:
          "Encuentra los fragmentos de MINSA, OMS y UNFPA más parecidos a la pregunta.",
        tech: "embeddings + similitud vectorial (pgvector)",
      },
      {
        icon: Sparkles,
        title: "La IA redacta la respuesta",
        description: (
          <>
            Escribe en lenguaje cercano usando {strong("solo")} esas fuentes. Si
            no hay info, lo dice y sugiere acudir a un centro de salud.
          </>
        ),
      },
      {
        icon: Puzzle,
        title: "Arma el mensaje final",
        description:
          "Respuesta + fuentes citadas + derivación si hace falta, dentro del límite de WhatsApp.",
      },
    ],
  },
];

const legend: { label: string; accent: Accent }[] = [
  { label: "Recepción", accent: accents.recepcion },
  { label: "Atajos", accent: accents.atajo },
  { label: "Clasificación", accent: accents.clasifica },
  { label: "Crisis", accent: accents.crisis },
  { label: "Búsqueda + IA", accent: accents.rag },
  { label: "Respuesta", accent: accents.respuesta },
];

/* -------------------------------------------------------------------------- */
/* Piezas de presentación                                                      */
/* -------------------------------------------------------------------------- */
function Tech({ children }: { children: ReactNode }) {
  return (
    <p className="mt-3 inline-flex flex-wrap items-center gap-x-1.5 gap-y-1 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2.5 py-1 text-xs text-slate-500">
      <span className="font-semibold text-slate-600">Técnico:</span>
      {children}
    </p>
  );
}

function FlowStep({
  step,
  accent,
  showConnector,
}: {
  step: Step;
  accent: Accent;
  showConnector: boolean;
}) {
  const Icon = step.icon;
  return (
    <li className="grid grid-cols-[auto_1fr] gap-4 sm:gap-5">
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm sm:size-11",
            accent.num,
          )}
        >
          {step.n}
        </span>
        {showConnector ? (
          <span
            aria-hidden="true"
            className="mt-2 w-px flex-1 bg-slate-200"
          />
        ) : null}
      </div>

      <div
        className={cn(
          "mb-4 rounded-2xl border border-l-4 border-slate-200/70 bg-white p-5 shadow-sm",
          accent.cardBorder,
        )}
      >
        <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900">
          <Icon className={cn("size-5 shrink-0", accent.icon)} />
          {step.title}
        </h3>
        <p className="mt-1.5 text-sm text-slate-600">{step.description}</p>
        {step.tech ? <Tech>{step.tech}</Tech> : null}
      </div>
    </li>
  );
}

function PhaseBlock({ phase }: { phase: Phase }) {
  return (
    <div>
      <div className="mb-5 mt-12 flex items-center gap-3">
        <span className={cn("size-3 shrink-0 rounded-full", phase.accent.dot)} />
        <span
          className={cn(
            "text-sm font-semibold uppercase tracking-wide",
            phase.accent.text,
          )}
        >
          {phase.label}
        </span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      <ol>
        {phase.steps.map((step, index) => (
          <FlowStep
            key={step.n}
            step={step}
            accent={phase.accent}
            showConnector={index < phase.steps.length - 1 || phase.continues}
          />
        ))}
      </ol>
    </div>
  );
}

function BranchColumn({ branch }: { branch: Branch }) {
  return (
    <div>
      <div
        className={cn(
          "rounded-xl px-4 py-3 text-center text-white shadow-sm",
          branch.accent.num,
        )}
      >
        <p className="text-sm font-semibold">
          <span aria-hidden="true">{branch.badge} </span>
          {branch.title}
        </p>
        <p className="mt-0.5 text-xs font-medium text-white/85">
          {branch.caption}
        </p>
      </div>

      <div className="mt-3 space-y-3">
        {branch.steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.title}
              className={cn(
                "rounded-xl border border-t-4 border-slate-200/70 bg-white p-4 shadow-sm",
                branch.accent.topBorder,
              )}
            >
              <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Icon className={cn("size-4 shrink-0", branch.accent.icon)} />
                {step.title}
              </h4>
              <p className="mt-1 text-sm text-slate-600">{step.description}</p>
              {step.tech ? <Tech>{step.tech}</Tech> : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Página                                                                      */
/* -------------------------------------------------------------------------- */
export default function ArquitecturaPage() {
  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-slate-200/70">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-50 via-background to-background"
          />
          <div className="relative mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
            <a
              href="/#inicio"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              <ArrowLeft className="size-4" />
              Volver al inicio
            </a>

            <div className="mt-8 text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                <MessageCircle className="size-3.5" />
                WhatsApp · Salud sexual adolescente
              </span>
              <h1 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                ¿Qué pasa cuando alguien escribe un mensaje?
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-slate-600 sm:text-lg">
                El recorrido completo de un mensaje, desde que un/a adolescente
                escribe por WhatsApp hasta que recibe una respuesta confiable —
                paso a paso.
              </p>
            </div>
          </div>
        </section>

        {/* Ideas clave */}
        <section className="mx-auto w-full max-w-4xl px-5 pt-10 sm:px-6 sm:pt-12">
          <ul className="grid gap-4 sm:grid-cols-3">
            {keyIdeas.map(({ icon: Icon, title, description }) => (
              <li
                key={title}
                className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Icon className="size-5" />
                </span>
                <h2 className="mt-4 text-base font-semibold text-slate-900">
                  {title}
                </h2>
                <p className="mt-1.5 text-sm text-slate-600">{description}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Flujo */}
        <section className="mx-auto w-full max-w-4xl px-5 pb-4 sm:px-6">
          {phasesBeforeFork.map((phase) => (
            <PhaseBlock key={phase.label} phase={phase} />
          ))}

          {/* Bifurcación */}
          <div className="mt-8 text-center">
            <p className="inline-flex items-center gap-2 text-base font-semibold text-violet-700">
              <Split className="size-5" />
              ¿El mensaje muestra una señal de crisis?
            </p>
            <p className="mt-1 text-sm text-slate-500">
              El camino cambia según la gravedad detectada
            </p>
          </div>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {branches.map((branch) => (
              <BranchColumn key={branch.title} branch={branch} />
            ))}
          </div>

          {/* Reunión de caminos */}
          <div className="mt-8 flex flex-col items-center gap-1 text-sm text-slate-500">
            <ArrowDown className="size-6 text-violet-500" />
            ambos caminos se reúnen para responder
          </div>

          <PhaseBlock phase={phaseAfterFork} />
        </section>

        {/* Cierre: en una frase + leyenda */}
        <section className="mx-auto w-full max-w-4xl px-5 pb-4 sm:px-6">
          <div className="rounded-3xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
              <Compass className="size-5 text-primary" />
              En una frase
            </h2>
            <p className="mt-2 text-pretty text-sm text-slate-600 sm:text-base">
              Un mensaje llega {strong("anónimo")}, se revisa primero por{" "}
              {strong("seguridad")} (y si hay crisis, ayuda humana inmediata sin
              IA), y si es una duda informativa, la{" "}
              {strong("IA responde apoyándose solo en fuentes confiables")} —
              todo sin guardar quién es la persona.
            </p>

            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-slate-100 pt-5">
              {legend.map(({ label, accent }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500"
                >
                  <span className={cn("size-3 rounded-sm", accent.swatch)} />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* CTA de cierre */}
        <section className="mx-auto w-full max-w-4xl px-5 py-14 text-center sm:px-6 sm:py-20">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            ¿Quieres probarlo tú?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-slate-600">
            Es anónimo, gratis y nadie más lo verá. Escribe tu primera pregunta
            por WhatsApp.
          </p>
          <div className="mt-7 flex justify-center">
            <WhatsappCta label="Empezar en WhatsApp" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
