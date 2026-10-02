"use client";

import { useState } from "react";
import {
  Server,
  Database,
  Cpu,
  Layers,
  Bot,
  Shield,
  Workflow,
  Sparkles,
  Search,
  Globe,
  MapPin,
  ArrowRight,
  ArrowDown,
  Copy,
  Check,
  Code2,
  Network
} from "lucide-react";
import type { Project } from "@/data/projects";

interface Props {
  project: Project;
  language: "pt" | "en";
  copiedId: number | null;
  onCopyDiagram: () => void;
  copyLabel: string;
  copiedLabel: string;
}

type NodeColor = "lime" | "blue" | "orange" | "lavender" | "cream";

const colorStyles: Record<NodeColor, { border: string; bg: string; text: string; badge: string }> = {
  lime: {
    border: "border-lime/40 group-hover:border-lime",
    bg: "bg-lime/10",
    text: "text-lime",
    badge: "bg-lime/20 text-lime border-lime/30",
  },
  blue: {
    border: "border-blue/50 group-hover:border-blue",
    bg: "bg-blue/15",
    text: "text-blue-300",
    badge: "bg-blue/20 text-blue-200 border-blue/30",
  },
  orange: {
    border: "border-orange/50 group-hover:border-orange",
    bg: "bg-orange/15",
    text: "text-orange",
    badge: "bg-orange/20 text-orange border-orange/30",
  },
  lavender: {
    border: "border-lavender/50 group-hover:border-lavender",
    bg: "bg-lavender/15",
    text: "text-lavender",
    badge: "bg-lavender/20 text-lavender border-lavender/30",
  },
  cream: {
    border: "border-cream/30 group-hover:border-cream/60",
    bg: "bg-cream/10",
    text: "text-cream",
    badge: "bg-cream/20 text-cream border-cream/30",
  },
};

function ArchitectureNode({
  icon: Icon,
  label,
  sub,
  badge,
  color = "cream",
  compact = false,
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  badge?: string;
  color?: NodeColor;
  compact?: boolean;
}) {
  const styles = colorStyles[color];

  return (
    <div
      className={`group relative flex items-center gap-3 rounded-lg border bg-navy/90 backdrop-blur-md shadow-md transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
        styles.border
      } ${compact ? "px-3 py-2 flex-1" : "px-4 py-2.5 w-full sm:w-auto"}`}
    >
      <div className={`p-2 rounded-md ${styles.bg} ${styles.text} shrink-0`}>
        <Icon size={compact ? 14 : 16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-mono text-xs font-bold text-cream truncate">{label}</p>
          {badge && (
            <span
              className={`hidden sm:inline-block px-1.5 py-0.2 text-[9px] font-mono tracking-wider uppercase rounded border ${styles.badge}`}
            >
              {badge}
            </span>
          )}
        </div>
        {sub && <p className="font-mono text-[10px] text-cream/70 truncate">{sub}</p>}
      </div>
    </div>
  );
}

function Connector({
  orientation = "vertical",
  label,
}: {
  orientation?: "vertical" | "horizontal";
  label?: string;
}) {
  if (orientation === "horizontal") {
    return (
      <div className="hidden sm:flex items-center gap-1.5 text-lime px-1">
        <span className="w-5 h-px bg-lime/60" />
        {label && <span className="font-mono text-[9px] uppercase tracking-wider text-lime/80">{label}</span>}
        <ArrowRight size={13} className="shrink-0 text-lime" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center py-0.5 text-lime my-0.5">
      <span className="h-3 w-px bg-lime/60" />
      {label && <span className="font-mono text-[9px] uppercase tracking-wider text-lime/80 py-0.5">{label}</span>}
      <ArrowDown size={13} className="shrink-0 text-lime" />
    </div>
  );
}

export default function ArchitectureVisualizer({
  project,
  language,
  copiedId,
  onCopyDiagram,
  copyLabel,
  copiedLabel,
}: Props) {
  const [viewMode, setViewMode] = useState<"visual" | "ascii">("visual");

  const renderVisualFlow = () => {
    switch (project.id) {
      case 1: // AuthGuard
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode icon={Globe} label="Client / HTTP" sub="Apps Web & Mobile" color="cream" />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="API Gateway (Express)"
                sub="Rate Limiter Token Bucket"
                badge="Express + Redis"
                color="lime"
              />
            </div>

            <Connector orientation="vertical" label="Desacoplamento Assíncrono" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-lime/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lime font-bold">
                  Autenticação & RBAC
                </span>
                <ArchitectureNode icon={Shield} label="Auth Service" sub="MFA / TOTP & JWT" color="lime" />
                <Connector orientation="vertical" />
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <ArchitectureNode icon={Database} label="PostgreSQL" sub="Users & Roles" color="blue" compact />
                  <ArchitectureNode icon={Cpu} label="Redis Blacklist" sub="Tokens Revogados" color="orange" compact />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-orange/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  Mensageria & Resiliência
                </span>
                <ArchitectureNode icon={Workflow} label="RabbitMQ Exchange" sub="Fanout / Direct" color="orange" />
                <Connector orientation="vertical" />
                <div className="flex flex-col sm:flex-row gap-2 w-full">
                  <ArchitectureNode icon={Layers} label="DLQ Queue" sub="Zero Mensagens Perdidas" color="orange" compact />
                  <ArchitectureNode icon={Server} label="Audit Consumer" sub="Logging Assíncrono" color="lavender" compact />
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // RAG Serviços Públicos
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode icon={Search} label="User Query" sub="Busca em Linguagem Natural" color="cream" />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="FastAPI Gateway"
                sub="Orquestrador Assíncrono"
                badge="Python 3.12"
                color="lime"
              />
              <Connector orientation="horizontal" />
              <ArchitectureNode icon={Workflow} label="Semantic Router" sub="Roteamento Semântico" color="lavender" />
            </div>

            <Connector orientation="vertical" label="Busca Híbrida Paralela" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-blue/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  Ramo Vetorial (Semântico)
                </span>
                <ArchitectureNode icon={Cpu} label="Local Embeddings (384d)" sub="FastEmbed · Zero Custo de API" color="lime" />
                <Connector orientation="vertical" />
                <ArchitectureNode
                  icon={Database}
                  label="PostgreSQL + pgvector"
                  sub="Índice HNSW · Latência <15ms"
                  color="blue"
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-lavender/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  Ramo de Metadados & Filtros
                </span>
                <ArchitectureNode
                  icon={Server}
                  label="Node.js Search Service"
                  sub="Filtros Estruturados & Tags"
                  color="lavender"
                />
                <Connector orientation="vertical" />
                <ArchitectureNode
                  icon={Layers}
                  label="Document Metadata"
                  sub="Categorias & Secretarias"
                  color="orange"
                />
              </div>
            </div>

            <Connector orientation="vertical" label="Síntese & Ancoragem" />

            <div className="flex flex-col items-center gap-2 w-full max-w-lg">
              <ArchitectureNode
                icon={Layers}
                label="Context Assembly"
                sub="Rerank & Deduplicação de Chunks"
                color="cream"
              />
              <Connector orientation="vertical" />
              <ArchitectureNode
                icon={Bot}
                label="Google Gemini AI Engine"
                sub="Geração Restrita (Zero Alucinações)"
                badge="LLM Grounding"
                color="lavender"
              />
              <Connector orientation="vertical" />
              <ArchitectureNode
                icon={Sparkles}
                label="Grounded Answer + Sources"
                sub="Resposta Fundamentada com Fontes Oficiais"
                color="lime"
              />
            </div>
          </div>
        );

      case 3: // API Financeira Inteligente
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode icon={Globe} label="Client / HTTP" sub="Requisições Financeiras" color="cream" />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="Express REST API"
                sub="Validação Zod + JWT"
                badge="TypeScript"
                color="lime"
              />
            </div>

            <Connector orientation="vertical" label="Bifurcação: Transações & Auditoria" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-blue/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  Consistência Contábil
                </span>
                <ArchitectureNode
                  icon={Database}
                  label="PostgreSQL (ACID Ledger)"
                  sub="Double-Entry Bookkeeping"
                  color="blue"
                />
                <span className="text-[10px] text-cream/70 font-mono">Balanços, Extratos & Movimentações</span>
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-lavender/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  Inteligência Artificial
                </span>
                <ArchitectureNode
                  icon={Bot}
                  label="Gemini AI Engine"
                  sub="Detecção Preditiva de Anomalias"
                  color="lavender"
                />
                <span className="text-[10px] text-cream/70 font-mono">Auditoria & Categorização Automática</span>
              </div>
            </div>

            <Connector orientation="vertical" label="Síntese Analítica" />

            <div className="w-full max-w-md">
              <ArchitectureNode
                icon={Sparkles}
                label="Relatórios & Recomendações"
                sub="Painel de Decisão Estratégica"
                color="lime"
              />
            </div>
          </div>
        );

      case 4: // Guia Maranhão
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode icon={Globe} label="Client App" sub="Interface do Cidadão" color="cream" />
              <Connector orientation="horizontal" />
              <ArchitectureNode icon={Server} label="Express REST API" sub="Controle e Autenticação JWT" color="lime" />
              <Connector orientation="horizontal" />
              <ArchitectureNode icon={Database} label="MongoDB / Mongoose" sub="Catálogo Centralizado" color="blue" />
            </div>

            <Connector orientation="vertical" label="Agregação de Fontes Governamentais" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-orange/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  Geolocalização & Rotas
                </span>
                <ArchitectureNode
                  icon={MapPin}
                  label="Google Maps Platform"
                  sub="Geocoding & Places API"
                  color="orange"
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-lavender/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  Dados Abertos do IBGE
                </span>
                <ArchitectureNode
                  icon={Layers}
                  label="IBGE Open Data API"
                  sub="Dados Demográficos e Municípios"
                  color="lavender"
                />
              </div>
            </div>
          </div>
        );

      case 5: // BuscaSUS
      default:
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-2xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode icon={Globe} label="Client / Mobile" sub="Busca de Postos de Saúde" color="cream" />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="Node.js / Express API"
                sub="Processamento Geoespacial"
                color="lime"
              />
            </div>

            <Connector orientation="vertical" label="Cálculo de Proximidade & Rotas" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-blue/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  Indexação Geoespacial
                </span>
                <ArchitectureNode
                  icon={Database}
                  label="MongoDB (2dsphere)"
                  sub="Cálculo de Distâncias Euclidianas"
                  color="blue"
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 rounded-xl bg-navy/60 border border-orange/30">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  Navegação do Paciente
                </span>
                <ArchitectureNode
                  icon={MapPin}
                  label="Google Maps Platform"
                  sub="Rotas até o Posto Mais Próximo"
                  color="orange"
                />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="mt-4">
      {/* View Switcher Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 pb-3 border-b border-cream/10">
        <div className="inline-flex items-center p-1 rounded-lg bg-black/40 border border-cream/15 font-mono text-xs">
          <button
            type="button"
            onClick={() => setViewMode("visual")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              viewMode === "visual"
                ? "bg-lime text-navy font-bold shadow-sm"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            <Network size={13} />
            <span>{language === "pt" ? "Fluxo Visual" : "Visual Flow"}</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("ascii")}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer ${
              viewMode === "ascii"
                ? "bg-lime text-navy font-bold shadow-sm"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            <Code2 size={13} />
            <span>Terminal ASCII</span>
          </button>
        </div>

        <button
          onClick={onCopyDiagram}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream/30 font-mono text-xs tracking-wider uppercase text-cream/90 hover:bg-lime hover:text-navy hover:border-lime transition-all duration-200 self-start sm:self-auto cursor-pointer"
          aria-label="Copiar diagrama"
        >
          {copiedId === project.id ? (
            <>
              <Check size={14} className="text-lime sm:text-navy" />
              <span>{copiedLabel}</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>{copyLabel}</span>
            </>
          )}
        </button>
      </div>

      {/* Render Canvas */}
      {viewMode === "visual" ? (
        <div className="p-4 sm:p-6 rounded-xl bg-black/60 border border-cream/15 shadow-inner">
          {renderVisualFlow()}
        </div>
      ) : (
        <div className="p-4 sm:p-6 rounded-xl bg-black/85 border border-cream/15 overflow-x-auto shadow-inner select-text">
          <pre
            className="whitespace-pre text-lime text-xs sm:text-sm"
            style={{
              fontFamily: "'Consolas', 'Courier New', 'Lucida Console', monospace",
              lineHeight: 1.35,
              letterSpacing: "0px",
            }}
          >
            <code>{project.architecture?.diagram}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
