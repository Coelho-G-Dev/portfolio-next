import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import ContrastChecker from "../components/ContrastChecker";
import ScrollRestore from "@/components/ScrollRestore";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-archivo",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500"],
  variable: "--font-fraunces",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Gabriel Coelho — Desenvolvedor Back-End",
  description:
    "Gabriel Coelho, desenvolvedor back-end. APIs robustas e seguras com Node.js, Express, MongoDB e Java com Spring Boot.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gabriel Coelho — Desenvolvedor Back-End",
    description: "Sistemas que sobrevivem à primeira versão.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabriel Coelho — Desenvolvedor Back-End",
    description: "Sistemas que sobrevivem à primeira versão.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#12222D",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gabriel Coelho",
  jobTitle: "Desenvolvedor Back-End",
  url: SITE_URL,
  address: { "@type": "PostalAddress", addressLocality: "São Luís", addressRegion: "MA", addressCountry: "BR" },
  sameAs: [
    "https://github.com/Coelho-G-Dev",
    "https://www.linkedin.com/in/gabriel-coelho-7184a32a3/",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className="font-display bg-navy text-cream">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:z-50 focus:bg-navy focus:text-cream focus:p-2 focus:m-2 focus:border focus:border-cream focus:rounded">
          Pular para o conteúdo principal
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        <ScrollRestore />
        {process.env.NODE_ENV === "production" && (
          <>
            <Analytics />
            <SpeedInsights />
          </>
        )}
        <ContrastChecker />
      </body>
    </html>
  );
}
