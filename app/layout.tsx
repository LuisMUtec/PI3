import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Orientación Sexual Anónima — UTEC PI3",
  description:
    "Agente RAG vía WhatsApp para orientación sexual anónima dirigida a adolescentes de El Carmen, Ica.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
