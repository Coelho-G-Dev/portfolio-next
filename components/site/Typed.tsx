"use client";

import { useEffect, useState } from "react";
import { typedLength } from "@/lib/typewriter";

// Texto que se digita sozinho (spec §5.2).
// - O texto inteiro fica numa span sr-only: o leitor de tela lê de uma vez.
// - O servidor manda o texto completo; sem JavaScript, ele já aparece pronto.
// - O resto ainda não digitado ocupa o espaço invisível, então nada se desloca.
// - Com .js no <html>, o CSS esconde a span até o efeito marcar data-ready,
//   evitando o flash do texto completo antes de a digitação começar.
export default function Typed({ text, className }: { text: string; className?: string }) {
  const [shown, setShown] = useState(text.length);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReady(true);
    if (reduce) {
      setShown(text.length);
      return;
    }

    setShown(0);
    let start: number | null = null;
    let frame = 0;
    const step = (now: number) => {
      if (start === null) start = now;
      const n = typedLength(text, now - start);
      setShown(n);
      if (n < text.length) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [text]);

  // Ao trocar o texto, nada do texto anterior pode aparecer até o efeito rodar.
  const [lastText, setLastText] = useState(text);
  if (lastText !== text) {
    setLastText(text);
    setShown(0);
  }

  return (
    <span className={className}>
      <span className="sr-only">{text}</span>
      <span className="s-typed" aria-hidden="true" data-ready={ready || undefined}>
        <span className="s-typed__shown">{text.slice(0, shown)}</span>
        <span className="s-typed__rest">{text.slice(shown)}</span>
      </span>
    </span>
  );
}
