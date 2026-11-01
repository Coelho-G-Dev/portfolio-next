import type { Metadata } from "next";
import "./site.css";

export const metadata: Metadata = {
  title: "Gabriel Coelho | Prévia do site novo",
  robots: { index: false, follow: false },
};

// Marca <html> com "js" antes da primeira pintura: as animações de entrada só
// existem com JavaScript, e sem ele todo o texto aparece pronto.
const markJs = "document.documentElement.classList.add('js')";

export default function NovoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <script dangerouslySetInnerHTML={{ __html: markJs }} />
      {children}
    </div>
  );
}
