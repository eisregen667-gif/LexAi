// app/layout.tsx
import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  axes: ["opsz"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LexIA — Análise Inteligente de Processos Jurídicos",
    template: "%s | LexIA",
  },
  description:
    "Faça upload do seu processo e obtenha em segundos: resumo estruturado, linha do tempo, prazos e chat com o processo. IA para advogados brasileiros.",
  keywords: ["advocacia", "processo jurídico", "inteligência artificial", "análise de processo", "jurídico"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="bg-ink-950 text-ink-100 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
