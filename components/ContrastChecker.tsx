'use client';

import { useEffect, useState } from 'react';
import {
  checkContrastCompliance,
  getContrastWarning,
  getContrastSuggestion,
  calculateEffectiveColor,
  siteColors
} from '@/lib/accessibility';
import { CheckCircle2, AlertTriangle, X, SlidersHorizontal, ChevronUp } from 'lucide-react';

interface ContrastPair {
  foreground: string;
  background: string;
  label: string;
  isLargeText?: boolean;
  category: 'Tipografia' | 'Interativo' | 'Opacidade' | 'Botões';
}

export default function ContrastChecker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'aa' | 'aaa' | 'fail'>('all');
  const [results, setResults] = useState<Array<{
    pair: ContrastPair;
    compliance: ReturnType<typeof checkContrastCompliance>;
    warning: string | null;
    suggestion: string | null;
  }>>([]);
  const [summary, setSummary] = useState<{ total: number; passingAA: number; passingAAA: number; failing: number } | null>(null);

  useEffect(() => {
    const pairsToCheck = generateRealSitePairs();

    const resultsData = pairsToCheck.map(pair => {
      const compliance = checkContrastCompliance(pair.foreground, pair.background, pair.isLargeText);
      const warning = getContrastWarning(compliance, pair.isLargeText);
      let suggestion: string | null = null;

      if (!compliance.passesAA) {
        suggestion = getContrastSuggestion(
          pair.foreground,
          pair.background,
          compliance.ratio,
          pair.isLargeText,
          pair.isLargeText ? 3 : 4.5
        );
      }

      return {
        pair,
        compliance,
        warning,
        suggestion
      };
    });

    setResults(resultsData);

    const total = resultsData.length;
    const passingAAA = resultsData.filter(r => r.compliance.passesAAA).length;
    const passingAA = resultsData.filter(r => r.compliance.passesAA).length;
    const failing = total - passingAA;

    setSummary({ total, passingAA, passingAAA, failing });
  }, []);

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const filteredResults = results.filter(r => {
    if (activeFilter === 'aa') return r.compliance.passesAA && !r.compliance.passesAAA;
    if (activeFilter === 'aaa') return r.compliance.passesAAA;
    if (activeFilter === 'fail') return !r.compliance.passesAA;
    return true;
  });

  return (
    <aside aria-label="Verificador de Contraste WCAG (Desenvolvimento)" className="fixed bottom-4 right-4 z-50 font-mono text-xs">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 px-3 py-2 bg-navy/95 text-cream border border-cream/20 hover:border-lime rounded-full shadow-2xl backdrop-blur transition-all hover:scale-105"
          title="Abrir Validador de Contraste WCAG"
        >
          <span className="w-2 h-2 rounded-full bg-lime animate-pulse" />
          <span className="font-bold">WCAG Contraste</span>
          {summary && (
            <span className={`px-1.5 py-0.5 rounded text-[10px] ${summary.failing === 0 ? 'bg-lime/20 text-lime' : 'bg-red-500/20 text-red-300'}`}>
              {summary.failing === 0 ? '100% AA' : `${summary.failing} falhas`}
            </span>
          )}
          <ChevronUp size={14} className="opacity-70" />
        </button>
      ) : (
        <div className="w-[92vw] sm:w-[420px] max-h-[80vh] flex flex-col bg-navy/95 text-cream border border-cream/20 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-cream/10 bg-navy">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-lime" />
              <h2 className="font-bold text-sm text-lime">WCAG Color Contrast</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-cream/10 rounded-full transition-colors text-cream/70 hover:text-cream"
              aria-label="Fechar painel"
            >
              <X size={16} />
            </button>
          </div>

          {summary && (
            <div className="grid grid-cols-3 gap-2 p-3 bg-cream/[0.03] border-b border-cream/10 text-center">
              <div className="p-2 rounded bg-navy/80 border border-cream/10">
                <p className="text-[10px] uppercase text-cream/60">Total</p>
                <p className="text-sm font-bold">{summary.total}</p>
              </div>
              <div className="p-2 rounded bg-navy/80 border border-lime/20">
                <p className="text-[10px] uppercase text-lime">Passa AA</p>
                <p className="text-sm font-bold text-lime">{summary.passingAA}</p>
              </div>
              <div className="p-2 rounded bg-navy/80 border border-cream/10">
                <p className="text-[10px] uppercase text-cream/60">Passa AAA</p>
                <p className="text-sm font-bold text-cream">{summary.passingAAA}</p>
              </div>
            </div>
          )}

          <div className="flex gap-1 p-2 bg-navy border-b border-cream/10 text-[11px]">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'all' ? 'bg-cream/20 text-cream font-bold' : 'text-cream/60 hover:text-cream'}`}
            >
              Todos ({results.length})
            </button>
            <button
              onClick={() => setActiveFilter('aaa')}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'aaa' ? 'bg-lime/20 text-lime font-bold' : 'text-cream/60 hover:text-cream'}`}
            >
              AAA ({summary?.passingAAA || 0})
            </button>
            <button
              onClick={() => setActiveFilter('aa')}
              className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'aa' ? 'bg-blue/30 text-blue-200 font-bold' : 'text-cream/60 hover:text-cream'}`}
            >
              AA ({results.filter(r => r.compliance.passesAA && !r.compliance.passesAAA).length})
            </button>
            {summary && summary.failing > 0 && (
              <button
                onClick={() => setActiveFilter('fail')}
                className={`px-2.5 py-1 rounded-md transition-colors ${activeFilter === 'fail' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-red-400/80 hover:text-red-300'}`}
              >
                Falhas ({summary.failing})
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[50vh]">
            {filteredResults.map((result, index) => {
              const isFail = !result.compliance.passesAA;
              const isAAA = result.compliance.passesAAA;

              return (
                <div
                  key={index}
                  className={`p-2.5 rounded-lg border transition-colors ${
                    isFail
                      ? 'border-red-500/40 bg-red-500/5'
                      : isAAA
                      ? 'border-lime/30 bg-lime/5'
                      : 'border-blue-400/30 bg-blue-500/5'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cream/10 text-cream/70 uppercase">
                          {result.pair.category}
                        </span>
                        <span className="font-medium text-cream">{result.pair.label}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-cream/60">
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full border border-cream/30 inline-block" style={{ backgroundColor: result.pair.foreground }} />
                          {result.pair.foreground}
                        </span>
                        <span>sobre</span>
                        <span className="flex items-center gap-1">
                          <span className="w-2.5 h-2.5 rounded-full border border-cream/30 inline-block" style={{ backgroundColor: result.pair.background }} />
                          {result.pair.background}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                      <span className={`font-bold font-mono ${isFail ? 'text-red-400' : isAAA ? 'text-lime' : 'text-blue-300'}`}>
                        {result.compliance.ratio.toFixed(2)}:1
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase ${
                        isFail
                          ? 'bg-red-500/20 text-red-300'
                          : isAAA
                          ? 'bg-lime/20 text-lime'
                          : 'bg-blue-400/20 text-blue-300'
                      }`}>
                        {result.compliance.status}
                      </span>
                    </div>
                  </div>

                  {result.warning && (
                    <div className="mt-2 pt-2 border-t border-red-500/20 flex items-start gap-1.5 text-red-300 text-[11px]">
                      <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                      <p>{result.warning}</p>
                    </div>
                  )}

                  {result.suggestion && (
                    <p className="mt-1 text-yellow-300/90 text-[11px]">
                      💡 {result.suggestion}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="p-2 border-t border-cream/10 bg-navy text-center text-[10px] text-cream/50">
            WCAG 2.1 AA requer ≥4.5:1 (texto normal) e ≥3:1 (texto grande)
          </div>
        </div>
      )}
    </aside>
  );
}

function generateRealSitePairs(): ContrastPair[] {
  return [
    { foreground: siteColors.cream, background: siteColors.navy, label: 'Logo / Texto do Header', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.lime, background: siteColors.navy, label: 'Link ativo do Header', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.cream, background: siteColors.navy, label: 'Links inativos do Header', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.lime, background: siteColors.navy, label: 'Botão "Vamos conversar" (Header)', isLargeText: false, category: 'Botões' },
    { foreground: siteColors.navy, background: siteColors.lime, label: 'Botão Header (Hover)', isLargeText: false, category: 'Interativo' },

    { foreground: siteColors.cream, background: siteColors.navy, label: 'Título Hero ("Back-end com")', isLargeText: true, category: 'Tipografia' },
    { foreground: siteColors.lime, background: siteColors.navy, label: 'Destaque Hero ("presença.")', isLargeText: true, category: 'Tipografia' },
    { foreground: calculateEffectiveColor(siteColors.cream, siteColors.navy, 0.8), background: siteColors.navy, label: 'Descrição Hero (cream/80)', isLargeText: false, category: 'Opacidade' },
    { foreground: calculateEffectiveColor(siteColors.cream, siteColors.navy, 0.7), background: siteColors.navy, label: 'Localização Hero (cream/70)', isLargeText: false, category: 'Opacidade' },

    { foreground: siteColors.navy, background: siteColors.orange, label: 'Título Projetos ("Sistemas...")', isLargeText: true, category: 'Tipografia' },
    { foreground: siteColors.navy, background: siteColors.orange, label: 'Títulos dos Projetos (BuscaSUS...)', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.navy, background: siteColors.orange, label: 'Descrição dos Projetos', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.navy, background: siteColors.orange, label: 'Tags dos Projetos', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.navy, background: siteColors.orange, label: 'Filtros da Seção Projetos', isLargeText: false, category: 'Interativo' },
    { foreground: siteColors.orange, background: siteColors.navy, label: 'Botão Demo (Hover no navy)', isLargeText: false, category: 'Interativo' },

    { foreground: siteColors.cream, background: siteColors.blue, label: 'Título Método ("A arquitetura...")', isLargeText: true, category: 'Tipografia' },
    { foreground: siteColors.lime, background: siteColors.blue, label: 'Destaque Método ("meio.")', isLargeText: true, category: 'Tipografia' },
    { foreground: siteColors.cream, background: siteColors.blue, label: 'Títulos dos Passos do Método', isLargeText: false, category: 'Tipografia' },
    { foreground: calculateEffectiveColor(siteColors.cream, siteColors.blue, 0.8), background: siteColors.blue, label: 'Texto dos Passos (cream/80)', isLargeText: false, category: 'Opacidade' },
    { foreground: siteColors.lime, background: siteColors.blue, label: 'Hover no título do Método', isLargeText: false, category: 'Interativo' },

    { foreground: siteColors.navy, background: siteColors.lime, label: 'Título Sobre Mim', isLargeText: true, category: 'Tipografia' },
    { foreground: siteColors.navy, background: siteColors.lime, label: 'Texto Sobre Mim (Bancada/Fora)', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.cream, background: siteColors.navy, label: 'Card Arquivo Pessoal (Sobre)', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.lime, background: siteColors.navy, label: 'Links Sociais Sobre (Hover)', isLargeText: false, category: 'Interativo' },

    { foreground: siteColors.navy, background: siteColors.lavender, label: 'Título Contato ("Tem uma")', isLargeText: true, category: 'Tipografia' },
    { foreground: siteColors.cream, background: siteColors.lavender, label: 'Destaque Contato ("boa ideia?")', isLargeText: true, category: 'Tipografia' },
    { foreground: siteColors.navy, background: siteColors.lavender, label: 'Descrição Contato', isLargeText: false, category: 'Tipografia' },
    { foreground: siteColors.cream, background: siteColors.navy, label: 'Botão E-mail (Contato)', isLargeText: false, category: 'Botões' },
    { foreground: siteColors.lavender, background: siteColors.navy, label: 'Botão Copiar (Hover)', isLargeText: false, category: 'Interativo' },

    { foreground: siteColors.cream, background: siteColors.navy, label: 'Título 404 / Erro', isLargeText: true, category: 'Tipografia' },
    { foreground: siteColors.lime, background: siteColors.navy, label: 'Botão voltar 404', isLargeText: false, category: 'Botões' },
    { foreground: siteColors.navy, background: siteColors.lime, label: 'Botão voltar 404 (Hover)', isLargeText: false, category: 'Interativo' },
  ];
}