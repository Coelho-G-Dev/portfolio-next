"use client";
import { useReveal } from "@/lib/useReveal";
import SectionCut from "@/components/SectionCut";

const steps = [
  {
    title: "Escuto o problema",
    body: "Antes da implementação, vem a pergunta certa. Entendo o domínio, o negócio e o que precisa continuar funcionando.",
  },
  {
    title: "Dou forma ao sistema",
    body: "Transformo regras e fluxos complexos em contratos de API, dados bem modelados e serviços fáceis de evoluir.",
  },
  {
    title: "Construo com cuidado",
    body: "Código legível, testes automatizados (Jest/Supertest) e decisões documentadas que continuam sólidas depois do lançamento.",
  },
];

export default function Method() {
  const ref = useReveal<HTMLDivElement>();
  return (
    <section id="metodo" className="relative min-h-screen bg-blue text-cream px-6 md:px-10 py-32 overflow-hidden">
      <SectionCut label="segundo corte" color="lime" side="right" />
      <div
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full border-[10px] border-lime"
        aria-hidden="true"
      />
      <div ref={ref} className="reveal max-w-5xl mx-auto grid md:grid-cols-[1fr_1.3fr] gap-16">
        <div>
          <p className="font-mono text-xs tracking-widest uppercase mb-4">02 — Como eu trabalho</p>
          <h2 className="font-display font-black text-[10vw] md:text-5xl leading-[0.95]">
            A arquitetura é o
            <br />
            <span className="font-serif italic font-normal text-lime">meio.</span>
          </h2>
          <p className="text-cream/80 text-sm leading-relaxed mt-6 max-w-sm">
            O trabalho é encontrar a forma mais honesta de um sistema existir. Às vezes é um produto
            inteiro. Às vezes é um endpoint no lugar certo.
          </p>
        </div>

        <div className="divide-y divide-cream/20 border-t border-cream/20">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="group relative grid grid-cols-[auto_1fr] gap-6 py-6 items-start px-4 -mx-4 transition-colors duration-300 hover:bg-cream/[0.04] overflow-hidden"
            >
              <span
                aria-hidden="true"
                className="absolute left-0 top-0 h-full w-0 bg-lime group-hover:w-1 transition-all duration-300 ease-out"
              />
              <span className="font-mono text-xs opacity-50 pt-1 transition-colors duration-300 group-hover:text-lime group-hover:opacity-100">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="grid md:grid-cols-2 gap-4">
                <h3 className="font-display font-bold text-xl transition-colors duration-300 group-hover:text-lime">
                  {s.title}
                </h3>
                <p className="text-sm text-cream/80 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
