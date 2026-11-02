import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { SITE_URL } from "@/lib/site";
import "./globals.css";
import "./novo/site.css";
import ScrollRestore from "@/components/ScrollRestore";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import SkipLink from "@/components/SkipLink";

const main = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-main",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

const markJs = "document.documentElement.classList.add('js')";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Gabriel Coelho | Desenvolvedor Back-End",
  description:
    "Gabriel Coelho, desenvolvedor back-end focado em sistemas resilientes, APIs escaláveis e IA. Experiência com Node.js, TypeScript, Python, FastAPI, Docker, RabbitMQ e PostgreSQL.",
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
  openGraph: {
    title: "Gabriel Coelho | Desenvolvedor Back-End",
    description: "Sistemas que sobrevivem à primeira versão.",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gabriel Coelho | Desenvolvedor Back-End",
    description: "Sistemas que sobrevivem à primeira versão.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#F4EEE3",
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
    <html lang="pt-BR" className={`${main.variable} ${mono.variable}`}>
      <body className="site">
        <script dangerouslySetInnerHTML={{ __html: markJs }} />
        <LanguageProvider>
          <SkipLink />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd).replace(/</g, "\\u003c") }}
          />
          {children}
          <ScrollRestore />
          {process.env.NODE_ENV === "production" && (
            <>
              <Analytics />
              <SpeedInsights />
            </>
          )}
        </LanguageProvider>
      </body>
    </html>
  );
}
