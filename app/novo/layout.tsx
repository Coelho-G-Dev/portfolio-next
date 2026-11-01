import type { Metadata } from "next";
import { Bricolage_Grotesque, JetBrains_Mono } from "next/font/google";
import "./site.css";

// Tipografia PROVISÓRIA (opção A de /novo/tipos) até o Gabriel escolher.
// Trocar a família é só trocar estas duas importações.
const main = Bricolage_Grotesque({ subsets: ["latin"], display: "swap", variable: "--font-main" });
const mono = JetBrains_Mono({ subsets: ["latin"], display: "swap", variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Gabriel Coelho | Prévia do site novo",
  robots: { index: false, follow: false },
};

// Marca <html> com "js" antes da primeira pintura: as animações de entrada só
// existem com JavaScript, e sem ele todo o texto aparece pronto.
const markJs = "document.documentElement.classList.add('js')";

export default function NovoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`site ${main.variable} ${mono.variable}`}>
      <script dangerouslySetInnerHTML={{ __html: markJs }} />
      {children}
    </div>
  );
}
