import type { Metadata } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const siteUrl = process.env.PUBLIC_BASE_URL ?? "https://pi3-puce.vercel.app";
const title = "Orientación Sexual Anónima — Chat de WhatsApp para adolescentes";
const description =
  "Chat de WhatsApp gratuito y anónimo para resolver tus dudas sobre sexualidad. Información confiable basada en fuentes del MINSA y la OMS. Para adolescentes de El Carmen, Ica.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  applicationName: "Orientación Sexual Anónima",
  keywords: [
    "salud sexual",
    "adolescentes",
    "orientación anónima",
    "WhatsApp",
    "El Carmen",
    "Ica",
    "MINSA",
    "OMS",
  ],
  openGraph: {
    type: "website",
    locale: "es_PE",
    url: siteUrl,
    siteName: "Orientación Sexual Anónima",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={cn("font-sans", geist.variable)}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
