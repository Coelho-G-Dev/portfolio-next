"use client";
import { useEffect } from "react";
import { ArrowLeft, RotateCcw } from "lucide-react";
import Header from "@/components/Header";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <Header />
      <main
        className="relative min-h-screen flex flex-col justify-center px-6 md:px-10 bg-navy text-cream overflow-hidden"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(242,234,220,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      >
        <div className="flex items-center gap-2 font-mono text-sm tracking-widest uppercase text-cream/70 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-orange" />
          Corte mal feito
        </div>

        <h1 className="font-display font-black leading-[0.95] text-[15vw] md:text-[7vw]">
          Algo quebrou
          <br />
          <span className="font-serif italic font-normal text-lime">nos bastidores.</span>
        </h1>

        <p className="max-w-sm text-cream/80 text-lg leading-relaxed mt-8">
          Ocorreu um erro inesperado ao carregar esta página. Não foi culpa sua — tente novamente
          ou volte ao início.
        </p>

        <div className="flex flex-wrap gap-4 mt-10">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 w-fit border border-lime text-lime rounded-full px-5 py-3 font-mono text-xs tracking-widest uppercase hover:bg-lime hover:text-navy transition-colors"
          >
            <RotateCcw size={14} /> Tentar de novo
          </button>
          <a
            href="/"
            className="inline-flex items-center gap-2 w-fit border border-cream/40 text-cream rounded-full px-5 py-3 font-mono text-xs tracking-widest uppercase hover:bg-cream hover:text-navy transition-colors"
          >
            <ArrowLeft size={14} /> Voltar ao início
          </a>
        </div>
      </main>
    </>
  );
}
