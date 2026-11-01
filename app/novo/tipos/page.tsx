import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Mono, Familjen_Grotesk, IBM_Plex_Mono, JetBrains_Mono, Literata } from "next/font/google";
import "./tipos.css";

// Página temporária do ponto de controle da Tarefa 3: o Gabriel escolhe a
// tipografia entre três combinações. Some depois da escolha (Tarefa 9).

const bricolage = Bricolage_Grotesque({ subsets: ["latin"], display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], display: "swap" });
const familjen = Familjen_Grotesk({ subsets: ["latin"], display: "swap" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });
const literata = Literata({ subsets: ["latin"], display: "swap" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], display: "swap" });

export const metadata: Metadata = {
  title: "Tipografia | prévia",
  robots: { index: false, follow: false },
};

const OPTIONS = [
  { id: "A", name: "Bricolage Grotesque + JetBrains Mono", note: "grotesca expressiva", main: bricolage, mono: jetbrains },
  { id: "B", name: "Familjen Grotesk + IBM Plex Mono", note: "grotesca quente e contida", main: familjen, mono: plexMono },
  { id: "C", name: "Literata + DM Mono", note: "serifa de livro de xadrez", main: literata, mono: dmMono },
];

function Sample({ option }: { option: (typeof OPTIONS)[number] }) {
  return (
    <article className="t-col" style={{ fontFamily: option.main.style.fontFamily }}>
      <p className="t-tag" style={{ fontFamily: option.mono.style.fontFamily }}>
        {option.id} · {option.name} · {option.note}
      </p>
      <p className="t-label">Back-end · Full-stack · São Luís, MA</p>
      <p className="t-name">Gabriel Coelho</p>
      <p className="t-intro">
        Olá! Eu construo back-ends que não perdem uma mensagem: APIs, filas e IA com fontes. O que vamos construir?
      </p>
      <div className="t-pills">
        <span className="t-pill t-pill--primary">
          Ver projetos <span className="t-pill__dot" aria-hidden="true">→</span>
        </span>
        <span className="t-pill">Tenho um projeto</span>
      </div>
      <p className="t-notation" style={{ fontFamily: option.mono.style.fontFamily }}>
        1. Cliente → API · 2. API → RabbitMQ · Peças perdidas: 0
      </p>
      <p className="t-body">
        Vim da logística, onde aprendi que pacote perdido é cliente perdido. Hoje construo sistemas com a mesma regra:
        filas com Dead-Letter Queue, contratos de API escritos antes do código e testes que acompanham cada entrega.
      </p>
    </article>
  );
}

export default function TiposPage() {
  return (
    <main className="t-page">
      <h1 className="t-title">Escolha a tipografia: A, B ou C</h1>
      {(["light", "dark"] as const).map((surface) => (
        <section key={surface} className="t-row" data-surface={surface} aria-label={surface === "light" ? "Sobre marfim" : "Sobre ébano"}>
          {OPTIONS.map((o) => (
            <Sample key={o.id} option={o} />
          ))}
        </section>
      ))}
    </main>
  );
}
