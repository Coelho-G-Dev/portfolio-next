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
      className={`group relative flex items-center gap-2.5 sm:gap-3 rounded-lg border bg-navy/90 backdrop-blur-md shadow-md transition-all duration-300 hover:shadow-lg min-w-0 max-w-full ${
        styles.border
      } ${compact ? "px-3 py-2 w-full" : "px-3.5 sm:px-4 py-2 sm:py-2.5 w-full sm:w-auto"}`}
    >
      <div className={`p-1.5 sm:p-2 rounded-md ${styles.bg} ${styles.text} shrink-0`}>
        <Icon size={compact ? 14 : 16} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <p className="font-mono text-xs font-bold text-cream truncate">{label}</p>
          {badge && (
            <span
              className={`hidden sm:inline-block px-1.5 py-0.5 text-[8px] sm:text-[9px] font-mono tracking-wider uppercase rounded border shrink-0 ${styles.badge}`}
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
      <>
        {/* Horizontal animated conduit on sm+ */}
        <div className="hidden sm:flex items-center gap-1.5 text-lime px-1.5 shrink-0 py-1">
          <div className="relative w-7 lg:w-10 h-[2px] bg-lime/20 rounded-full overflow-hidden flex items-center">
            <span className="absolute inset-0 bg-lime/15" />
            <span className="absolute top-0 bottom-0 w-3.5 bg-gradient-to-r from-transparent via-lime to-transparent animate-data-flow-h rounded-full shadow-[0_0_6px_#EAF35B]" />
          </div>
          {label && (
            <span className="px-2 py-0.5 rounded-full bg-lime/10 border border-lime/30 font-mono text-[9px] uppercase tracking-wider text-lime/90 whitespace-nowrap shadow-sm">
              {label}
            </span>
          )}
          <ArrowRight size={13} className="shrink-0 text-lime animate-flow-pulse" />
        </div>

        {/* Vertical fallback conduit on mobile */}
        <div className="flex sm:hidden flex-col items-center py-1 text-lime my-0.5 shrink-0">
          <div className="relative h-4 w-[2px] bg-lime/20 rounded-full overflow-hidden flex justify-center">
            <span className="absolute left-0 right-0 h-2.5 bg-gradient-to-b from-transparent via-lime to-transparent animate-data-flow-v rounded-full shadow-[0_0_6px_#EAF35B]" />
          </div>
          {label && (
            <span className="my-0.5 px-2 py-0.5 rounded-full bg-lime/10 border border-lime/30 font-mono text-[8px] uppercase tracking-wider text-lime/90 text-center">
              {label}
            </span>
          )}
          <ArrowDown size={12} className="shrink-0 text-lime animate-flow-pulse" />
        </div>
      </>
    );
  }

  // Vertical animated conduit
  return (
    <div className="flex flex-col items-center py-0.5 text-lime my-0.5 max-w-full px-2 text-center shrink-0">
      <div className="relative h-3.5 sm:h-4 w-[2px] bg-lime/20 rounded-full overflow-hidden flex justify-center">
        <span className="absolute left-0 right-0 h-2.5 bg-gradient-to-b from-transparent via-lime to-transparent animate-data-flow-v rounded-full shadow-[0_0_6px_#EAF35B]" />
      </div>

      {label ? (
        <>
          <div className="my-1 px-2.5 py-0.5 rounded-full bg-lime/10 border border-lime/30 flex items-center gap-1.5 shadow-sm max-w-full backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-lime font-medium truncate">
              {label}
            </span>
          </div>
          <div className="relative h-2.5 w-[2px] bg-lime/20 rounded-full overflow-hidden flex justify-center">
            <span className="absolute left-0 right-0 h-2 bg-gradient-to-b from-transparent via-lime to-transparent animate-data-flow-v rounded-full shadow-[0_0_6px_#EAF35B]" />
          </div>
        </>
      ) : null}

      <ArrowDown size={13} className="shrink-0 text-lime animate-flow-pulse" />
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
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                label="Client / HTTP"
                sub={language === "pt" ? "Apps Web & Mobile" : "Web & Mobile Clients"}
                color="cream"
              />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="API Gateway (Express)"
                sub={language === "pt" ? "Rate Limiter Token Bucket" : "Token Bucket Rate Limiter"}
                badge="Express + Redis"
                color="lime"
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Desacoplamento Assíncrono" : "Async Decoupling"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-lime/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lime font-bold">
                  {language === "pt" ? "Autenticação & RBAC" : "Authentication & RBAC"}
                </span>
                <ArchitectureNode icon={Shield} label="Auth Service" sub="MFA / TOTP & JWT" color="lime" compact />
                <Connector orientation="vertical" />
                <div className="flex flex-col gap-2 w-full">
                  <ArchitectureNode
                    icon={Database}
                    label="PostgreSQL"
                    sub={language === "pt" ? "Usuários & Roles" : "Users & Roles"}
                    color="blue"
                    compact
                  />
                  <ArchitectureNode
                    icon={Cpu}
                    label="Redis Blacklist"
                    sub={language === "pt" ? "Tokens Revogados" : "Revoked Tokens"}
                    color="orange"
                    compact
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-orange/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  {language === "pt" ? "Mensageria & Resiliência" : "Messaging & Resilience"}
                </span>
                <ArchitectureNode icon={Workflow} label="RabbitMQ Exchange" sub="Fanout / Direct" color="orange" compact />
                <Connector orientation="vertical" />
                <div className="flex flex-col gap-2 w-full">
                  <ArchitectureNode
                    icon={Layers}
                    label="DLQ Queue"
                    sub={language === "pt" ? "Zero Mensagens Perdidas" : "Zero Message Loss"}
                    color="orange"
                    compact
                  />
                  <ArchitectureNode
                    icon={Server}
                    label="Audit Consumer"
                    sub={language === "pt" ? "Logging Assíncrono" : "Async Audit Logging"}
                    color="lavender"
                    compact
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2: // RAG Serviços Públicos
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Search}
                label="User Query"
                sub={language === "pt" ? "Busca em Linguagem Natural" : "Natural Language Query"}
                color="cream"
              />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="FastAPI Gateway"
                sub={language === "pt" ? "Orquestrador Assíncrono" : "Async Orchestrator"}
                badge="Python 3.12"
                color="lime"
              />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Workflow}
                label="Semantic Router"
                sub={language === "pt" ? "Roteamento Semântico" : "Semantic Routing"}
                color="lavender"
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Busca Híbrida Paralela" : "Parallel Hybrid Search"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-blue/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  {language === "pt" ? "Ramo Vetorial (Semântico)" : "Vector Branch (Semantic)"}
                </span>
                <ArchitectureNode
                  icon={Cpu}
                  label="Local Embeddings (384d)"
                  sub={language === "pt" ? "FastEmbed · Zero Custo de API" : "FastEmbed · Zero API Cost"}
                  color="lime"
                  compact
                />
                <Connector orientation="vertical" />
                <ArchitectureNode
                  icon={Database}
                  label="PostgreSQL + pgvector"
                  sub={language === "pt" ? "Índice HNSW · Latência <15ms" : "HNSW Index · <15ms Latency"}
                  color="blue"
                  compact
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-lavender/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  {language === "pt" ? "Ramo de Metadados & Filtros" : "Metadata & Filters Branch"}
                </span>
                <ArchitectureNode
                  icon={Server}
                  label="Node.js Search Service"
                  sub={language === "pt" ? "Filtros Estruturados & Tags" : "Structured Filters & Tags"}
                  color="lavender"
                  compact
                />
                <Connector orientation="vertical" />
                <ArchitectureNode
                  icon={Layers}
                  label="Document Metadata"
                  sub={language === "pt" ? "Categorias & Secretarias" : "Categories & Departments"}
                  color="orange"
                  compact
                />
              </div>
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Síntese & Ancoragem" : "Synthesis & Grounding"}
            />

            <div className="flex flex-col items-center gap-2 w-full max-w-lg">
              <ArchitectureNode
                icon={Layers}
                label="Context Assembly"
                sub={language === "pt" ? "Rerank & Deduplicação de Chunks" : "Rerank & Chunk Deduplication"}
                color="cream"
                compact
              />
              <Connector orientation="vertical" />
              <ArchitectureNode
                icon={Bot}
                label="Google Gemini AI Engine"
                sub={language === "pt" ? "Geração Restrita (Zero Alucinações)" : "Constrained Generation (No Hallucinations)"}
                badge="LLM Grounding"
                color="lavender"
                compact
              />
              <Connector orientation="vertical" />
              <ArchitectureNode
                icon={Sparkles}
                label="Grounded Answer + Sources"
                sub={language === "pt" ? "Resposta Fundamentada com Fontes Oficiais" : "Grounded Response with Official Sources"}
                color="lime"
                compact
              />
            </div>
          </div>
        );

      case 3: // API Financeira Inteligente
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                label="Client / HTTP"
                sub={language === "pt" ? "Requisições Financeiras" : "Financial Requests"}
                color="cream"
              />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="Express REST API"
                sub={language === "pt" ? "Validação Zod + JWT" : "Zod + JWT Validation"}
                badge="TypeScript"
                color="lime"
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Bifurcação: Transações & Auditoria" : "Branch: Transactions & Audit"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-blue/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  {language === "pt" ? "Consistência Contábil" : "Ledger Consistency"}
                </span>
                <ArchitectureNode
                  icon={Database}
                  label="PostgreSQL (ACID Ledger)"
                  sub="Double-Entry Bookkeeping"
                  color="blue"
                  compact
                />
                <span className="text-[10px] text-cream/70 font-mono text-center">
                  {language === "pt" ? "Balanços, Extratos & Movimentações" : "Balance Sheets, Statements & Transactions"}
                </span>
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-lavender/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  {language === "pt" ? "Inteligência Artificial" : "Artificial Intelligence"}
                </span>
                <ArchitectureNode
                  icon={Bot}
                  label="Gemini AI Engine"
                  sub={language === "pt" ? "Detecção Preditiva de Anomalias" : "Predictive Anomaly Detection"}
                  color="lavender"
                  compact
                />
                <span className="text-[10px] text-cream/70 font-mono text-center">
                  {language === "pt" ? "Auditoria & Categorização Automática" : "Auditing & Automated Categorization"}
                </span>
              </div>
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Síntese Analítica" : "Analytical Synthesis"}
            />

            <div className="w-full max-w-md">
              <ArchitectureNode
                icon={Sparkles}
                label={language === "pt" ? "Relatórios & Recomendações" : "Reports & Recommendations"}
                sub={language === "pt" ? "Painel de Decisão Estratégica" : "Strategic Decision Dashboard"}
                color="lime"
                compact
              />
            </div>
          </div>
        );

      case 4: // Guia Maranhão
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                label="Client App"
                sub={language === "pt" ? "Interface do Cidadão" : "Citizen Interface"}
                color="cream"
              />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="Express REST API"
                sub={language === "pt" ? "Controle e Autenticação JWT" : "Access Control & JWT Auth"}
                color="lime"
              />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Database}
                label="MongoDB / Mongoose"
                sub={language === "pt" ? "Catálogo Centralizado" : "Centralized Catalog"}
                color="blue"
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Agregação de Fontes Governamentais" : "Government Data Aggregation"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-orange/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  {language === "pt" ? "Geolocalização & Rotas" : "Geolocation & Routes"}
                </span>
                <ArchitectureNode
                  icon={MapPin}
                  label="Google Maps Platform"
                  sub="Geocoding & Places API"
                  color="orange"
                  compact
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-lavender/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  {language === "pt" ? "Dados Abertos do IBGE" : "IBGE Open Data"}
                </span>
                <ArchitectureNode
                  icon={Layers}
                  label="IBGE Open Data API"
                  sub={language === "pt" ? "Dados Demográficos e Municípios" : "Demographic Data & Municipalities"}
                  color="lavender"
                  compact
                />
              </div>
            </div>
          </div>
        );

      case 5: // BuscaSUS
      default:
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                label="Client / Mobile"
                sub={language === "pt" ? "Busca de Postos de Saúde" : "Health Unit Search"}
                color="cream"
              />
              <Connector orientation="horizontal" />
              <ArchitectureNode
                icon={Server}
                label="Node.js / Express API"
                sub={language === "pt" ? "Processamento Geoespacial" : "Geospatial Processing"}
                color="lime"
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Cálculo de Proximidade & Rotas" : "Proximity Calculation & Routes"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-blue/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  {language === "pt" ? "Indexação Geoespacial" : "Geospatial Indexing"}
                </span>
                <ArchitectureNode
                  icon={Database}
                  label="MongoDB (2dsphere)"
                  sub={language === "pt" ? "Cálculo de Distâncias Euclidianas" : "Euclidean Distance Calculation"}
                  color="blue"
                  compact
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-orange/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  {language === "pt" ? "Navegação do Paciente" : "Patient Navigation"}
                </span>
                <ArchitectureNode
                  icon={MapPin}
                  label="Google Maps Platform"
                  sub={language === "pt" ? "Rotas até o Posto Mais Próximo" : "Routes to Nearest Health Center"}
                  color="orange"
                  compact
                />
              </div>
            </div>
          </div>
        );
    }
  };

  const asciiDiagram =
    typeof project.architecture?.diagram === "string"
      ? project.architecture.diagram
      : project.architecture?.diagram[language];

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
            {viewMode === "visual" && (
              <span className="relative flex h-1.5 w-1.5 ml-0.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-navy opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-navy" />
              </span>
            )}
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
            <span>{language === "pt" ? "Terminal ASCII" : "ASCII Terminal"}</span>
          </button>
        </div>

        <button
          onClick={onCopyDiagram}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream/30 font-mono text-xs tracking-wider uppercase text-cream/90 hover:bg-lime hover:text-navy hover:border-lime transition-all duration-200 self-start sm:self-auto cursor-pointer"
          aria-label={copyLabel}
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
        <div className="p-3 sm:p-6 rounded-xl bg-black/60 border border-cream/15 shadow-inner overflow-x-auto">
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
            <code>{asciiDiagram}</code>
          </pre>
        </div>
      )}
    </div>
  );
}
