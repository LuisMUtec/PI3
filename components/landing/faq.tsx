"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type QA = {
  value: string;
  question: string;
  answer: string;
};

const faqs: QA[] = [
  {
    value: "anonimo",
    question: "¿De verdad es anónimo?",
    answer:
      "Sí. No guardamos tu número de teléfono ni el contenido de tus mensajes en nuestros servidores; solo medimos cuántas consultas llegan, sin saber quién escribió. Eso sí, tu mensaje viaja por WhatsApp y su proveedor (Twilio) para poder responderte, según sus propias políticas de privacidad.",
  },
  {
    value: "costo",
    question: "¿Cuánto cuesta?",
    answer:
      "Es completamente gratis. Solo necesitas tu conexión a internet o datos para usar WhatsApp como siempre.",
  },
  {
    value: "quien-responde",
    question: "¿Quién responde mis mensajes?",
    answer:
      "Un asistente automático que busca la respuesta en documentos oficiales del MINSA, la OMS, UNFPA y UNICEF. No es un médico y no reemplaza una consulta profesional.",
  },
  {
    value: "privacidad",
    question: "¿Alguien más verá lo que escribo?",
    answer:
      "No. Tu conversación es privada. Ni tus familiares, ni tu colegio, ni otras personas pueden ver lo que preguntas.",
  },
  {
    value: "que-preguntar",
    question: "¿Qué puedo preguntar?",
    answer:
      "Lo que quieras sobre tu cuerpo, relaciones, emociones, prevención y salud sexual. Si detectamos una situación de riesgo, te compartimos líneas de ayuda gratuitas.",
  },
  {
    value: "medico",
    question: "¿Esto reemplaza ir al médico?",
    answer:
      "No. Es orientación informativa para resolver dudas. Para un diagnóstico o tratamiento, acude a un centro de salud.",
  },
];

export function Faq() {
  return (
    <section id="preguntas" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-6 sm:py-20">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">
            Preguntas frecuentes
          </p>
          <h2 className="mt-2 text-balance text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Lo que quizás te preguntas
          </h2>
        </div>

        <Accordion defaultValue={["anonimo"]} className="mt-10">
          {faqs.map((faq) => (
            <AccordionItem key={faq.value} value={faq.value}>
              <AccordionTrigger className="text-base text-slate-900">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-slate-600">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
