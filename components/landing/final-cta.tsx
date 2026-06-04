import { Lock } from "lucide-react";
import { WhatsappCta } from "./whatsapp-cta";

export function FinalCta() {
  return (
    <section className="mx-auto w-full max-w-5xl px-5 py-16 sm:px-6 sm:py-20">
      <div className="relative overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center shadow-sm sm:px-12 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full bg-white/10 blur-2xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-20 -left-12 size-64 rounded-full bg-white/10 blur-2xl"
        />
        <div className="relative">
          <h2 className="text-balance text-2xl font-semibold tracking-tight text-primary-foreground sm:text-3xl">
            Tu primera pregunta puede ser hoy
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty text-base text-primary-foreground/85">
            Escribe lo que quieras saber. Es anónimo, gratis y nadie más lo verá.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <WhatsappCta
              label="Empezar en WhatsApp"
              className="h-12 px-7 shadow-md"
            />
            <p className="flex items-center gap-1.5 text-sm text-primary-foreground/80">
              <Lock className="size-4" />
              No guardamos tu número ni tus mensajes en nuestros servidores
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
