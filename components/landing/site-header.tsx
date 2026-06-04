import { MessageCircleHeart } from "lucide-react";
import { WhatsappCta } from "./whatsapp-cta";

const navLinks = [
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#temas", label: "Temas" },
  { href: "#ayuda", label: "Ayuda urgente" },
  { href: "#preguntas", label: "Preguntas" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5 sm:px-6">
        <a href="#inicio" className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <MessageCircleHeart className="size-5" />
          </span>
          <span className="text-sm font-semibold tracking-tight text-slate-900 sm:text-base">
            Orientación Anónima
          </span>
        </a>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="inline-flex items-center py-2 text-sm font-medium text-slate-600 transition-colors hover:text-primary"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <WhatsappCta
          label="WhatsApp"
          className="h-9 px-4 text-sm"
          iconClassName="size-4"
        />
      </div>
    </header>
  );
}
