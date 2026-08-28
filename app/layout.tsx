import type { Metadata, Viewport } from "next";
import { Archivo, Fraunces, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

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
  metadataBase: new URL("https://portfolio-next-flax-seven.vercel.app"),
  title: "Gabriel Coelho — Desenvolvedor Back-End",
  description:
    "Gabriel Coelho, desenvolvedor back-end. APIs robustas e seguras com Node.js, Express, MongoDB e Java com Spring Boot.",
  robots: { index: true, follow: true },
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
  themeColor: "#12222D",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Gabriel Coelho",
  jobTitle: "Desenvolvedor Back-End",
  url: "https://portfolio-next-flax-seven.vercel.app",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
