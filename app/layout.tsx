import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import ContrastChecker from "../components/ContrastChecker";
import ScrollRestore from "@/components/ScrollRestore";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import SkipLink from "@/components/SkipLink";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
  variable: "--font-archivo",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  style: ["italic"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-fraunces",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Gabriel Coelho — Desenvolvedor Back-End",
  description:
    "Gabriel Coelho, desenvolvedor back-end focado em sistemas resilientes, APIs escaláveis e IA. Experiência com Node.js, TypeScript, Python, FastAPI, Docker, RabbitMQ e PostgreSQL.",
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
  knowsAbout: [
    "Node.js",
    "TypeScript",
    "Python",
    "FastAPI",
    "PostgreSQL",
    "pgvector",
    "Docker",
    "RabbitMQ",
    "Redis",
    "Microservices",
    "RESTful APIs"
  ]
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${archivo.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}>
      <body className="font-display bg-navy text-cream">
        <LanguageProvider>
          <SkipLink />
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
        </LanguageProvider>
      </body>
    </html>
  );
}
