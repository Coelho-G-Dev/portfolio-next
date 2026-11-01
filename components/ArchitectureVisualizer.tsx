"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
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
  Network,
  Maximize2,
  X,
  Play,
  Pause,
  Info,
  Download,
  FileCode,
  Sun,
  Trophy,
  AlertCircle,
} from "lucide-react";
import type { Project } from "@/data/projects";
import { copyText } from "@/lib/clipboard";
function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
import { nodeSpecs, type NodeColor } from "@/data/nodeSpecs";

interface Props {
  project: Project;
  language: "pt" | "en";
  copiedId: number | null;
  copyFailed: boolean;
  onCopyDiagram: () => void;
  copyLabel: string;
  copiedLabel: string;
  copyFailedLabel: string;
}

const colorStyles: Record<NodeColor, { border: string; bg: string; text: string; badge: string; glow: string }> = {
  lime: {
    border: "border-lime/40 group-hover:border-lime",
    bg: "bg-lime/10",
    text: "text-lime",
    badge: "bg-lime/20 text-lime border-lime/30",
    glow: "shadow-[0_0_12px_rgba(234,243,91,0.35)]",
  },
  blue: {
    border: "border-blue/50 group-hover:border-blue",
    bg: "bg-blue/15",
    text: "text-blue-300",
    badge: "bg-blue/20 text-blue-200 border-blue/30",
    glow: "shadow-[0_0_12px_rgba(46,83,229,0.35)]",
  },
  orange: {
    border: "border-orange/50 group-hover:border-orange",
    bg: "bg-orange/15",
    text: "text-orange",
    badge: "bg-orange/20 text-orange border-orange/30",
    glow: "shadow-[0_0_12px_rgba(233,124,103,0.35)]",
  },
  lavender: {
    border: "border-lavender/50 group-hover:border-lavender",
    bg: "bg-lavender/15",
    text: "text-lavender",
    badge: "bg-lavender/20 text-lavender border-lavender/30",
    glow: "shadow-[0_0_12px_rgba(185,151,255,0.35)]",
  },
  cream: {
    border: "border-cream/30 group-hover:border-cream/60",
    bg: "bg-cream/10",
    text: "text-cream",
    badge: "bg-cream/20 text-cream border-cream/30",
    glow: "shadow-[0_0_12px_rgba(242,234,220,0.25)]",
  },
};


function SemanticLegend({
  language,
  activeLayer,
  onToggleLayer,
}: {
  language: "pt" | "en";
  activeLayer: NodeColor | null;
  onToggleLayer: (layer: NodeColor) => void;
}) {
  const items: { key: NodeColor; dotColor: string; glow: string; label: { pt: string; en: string } }[] = [
    {
      key: "lime",
      dotColor: "bg-lime border-lime/40",
      glow: "shadow-[0_0_5px_#EAF35B]",
      label: { pt: "Gateway & Entrada", en: "Gateway & Ingress" },
    },
    {
      key: "blue",
      dotColor: "bg-blue border-blue/40",
      glow: "shadow-[0_0_5px_#2E53E5]",
      label: { pt: "Persistência ACID", en: "ACID Persistence" },
    },
    {
      key: "orange",
      dotColor: "bg-orange border-orange/40",
      glow: "shadow-[0_0_5px_#E97C67]",
      label: { pt: "Mensageria & Filas", en: "Messaging & Queues" },
    },
    {
      key: "lavender",
      dotColor: "bg-lavender border-lavender/40",
      glow: "shadow-[0_0_5px_#B997FF]",
      label: { pt: "IA & Metadados", en: "AI & Metadata" },
    },
    {
      key: "cream",
      dotColor: "bg-cream/90 border-cream/40",
      glow: "shadow-[0_0_5px_#F2EADC]",
      label: { pt: "Clientes & Requisições", en: "Clients & Requesters" },
    },
  ];

  return (
    <div className="mt-4 pt-3 border-t border-cream/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-[10px] font-mono select-none">
      <div className="flex items-center gap-2 text-cream/70">
        <span className="uppercase tracking-widest text-[9px] text-cream/50 font-bold">
          {language === "pt" ? "Camadas Arquiteturais:" : "Architecture Layers:"}
        </span>
        {activeLayer && (
          <button
            type="button"
            onClick={() => onToggleLayer(activeLayer)}
            className="text-[9px] text-lime underline hover:text-cream cursor-pointer"
          >
            {language === "pt" ? "(Limpar filtro)" : "(Clear filter)"}
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {items.map((item) => {
          const isActive = activeLayer === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onToggleLayer(item.key)}
              title={
                isActive
                  ? language === "pt"
                    ? "Clique para desmarcar filtro"
                    : "Click to clear filter"
                  : language === "pt"
                  ? `Filtrar camada: ${item.label.pt}`
                  : `Filter layer: ${item.label.en}`
              }
              className={`flex items-center gap-1.5 px-2 py-1 rounded-md border transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-lime/20 border-lime/60 text-lime font-bold ring-1 ring-lime/40 shadow-sm"
                  : "bg-navy/40 border-cream/15 text-cream/70 hover:text-cream hover:border-cream/40 hover:bg-cream/5"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${item.dotColor} ${item.glow}`} />
              <span>{item.label[language]}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ArchitectureNode({
  icon: Icon,
  label,
  sub,
  badge,
  color = "cream",
  compact = false,
  isSelected = false,
  activeLayer = null,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  sub?: string;
  badge?: string;
  color?: NodeColor;
  compact?: boolean;
  isSelected?: boolean;
  activeLayer?: NodeColor | null;
  onClick?: () => void;
}) {
  const styles = colorStyles[color];
  const isDimmed = activeLayer !== null && activeLayer !== color;
  const isLayerActive = activeLayer === color;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative text-left flex items-center gap-2.5 sm:gap-3 rounded-lg border bg-navy/90 backdrop-blur-md transition-all duration-300 min-w-0 max-w-full cursor-pointer select-none ${
        compact ? "px-3 py-2 w-full" : "px-3.5 sm:px-4 py-2 sm:py-2.5 w-full sm:w-auto"
      } ${
        isSelected
          ? "ring-2 ring-lime border-lime bg-lime/15 shadow-[0_0_16px_rgba(234,243,91,0.45)] scale-[1.02]"
          : isLayerActive
          ? `ring-2 ring-lime/70 ${styles.border} ${styles.glow} scale-[1.01]`
          : isDimmed
          ? "opacity-25 grayscale-[70%] scale-[0.98] border-cream/10"
          : `${styles.border} hover:shadow-lg hover:-translate-y-0.5 hover:scale-[1.01]`
      }`}
    >
      <div className={`p-1.5 sm:p-2 rounded-md ${styles.bg} ${styles.text} shrink-0 transition-colors`}>
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
    </button>
  );
}

function Connector({
  orientation = "vertical",
  label,
  isFlowing = true,
}: {
  orientation?: "vertical" | "horizontal";
  label?: string;
  isFlowing?: boolean;
}) {
  if (orientation === "horizontal") {
    return (
      <>
        {/* Horizontal animated conduit on sm+ */}
        <div className="hidden sm:flex items-center gap-1.5 text-lime px-1.5 shrink-0 py-1">
          <div className="relative w-7 lg:w-10 h-[2px] bg-lime/20 rounded-full overflow-hidden flex items-center">
            <span className="absolute inset-0 bg-lime/15" />
            {isFlowing && (
              <span className="absolute top-0 bottom-0 w-3.5 bg-gradient-to-r from-transparent via-lime to-transparent animate-data-flow-h rounded-full shadow-[0_0_6px_#EAF35B]" />
            )}
          </div>
          {label && (
            <span className="px-2 py-0.5 rounded-full bg-lime/10 border border-lime/30 font-mono text-[9px] uppercase tracking-wider text-lime/90 whitespace-nowrap shadow-sm">
              {label}
            </span>
          )}
          <ArrowRight
            size={13}
            className={`shrink-0 text-lime ${isFlowing ? "animate-flow-pulse" : "opacity-80"}`}
          />
        </div>

        {/* Vertical fallback conduit on mobile */}
        <div className="flex sm:hidden flex-col items-center py-1 text-lime my-0.5 shrink-0">
          <div className="relative h-4 w-[2px] bg-lime/20 rounded-full overflow-hidden flex justify-center">
            {isFlowing && (
              <span className="absolute left-0 right-0 h-2.5 bg-gradient-to-b from-transparent via-lime to-transparent animate-data-flow-v rounded-full shadow-[0_0_6px_#EAF35B]" />
            )}
          </div>
          {label && (
            <span className="my-0.5 px-2 py-0.5 rounded-full bg-lime/10 border border-lime/30 font-mono text-[8px] uppercase tracking-wider text-lime/90 text-center">
              {label}
            </span>
          )}
          <ArrowDown
            size={12}
            className={`shrink-0 text-lime ${isFlowing ? "animate-flow-pulse" : "opacity-80"}`}
          />
        </div>
      </>
    );
  }

  // Vertical animated conduit
  return (
    <div className="flex flex-col items-center py-0.5 text-lime my-0.5 max-w-full px-2 text-center shrink-0">
      <div className="relative h-3.5 sm:h-4 w-[2px] bg-lime/20 rounded-full overflow-hidden flex justify-center">
        {isFlowing && (
          <span className="absolute left-0 right-0 h-2.5 bg-gradient-to-b from-transparent via-lime to-transparent animate-data-flow-v rounded-full shadow-[0_0_6px_#EAF35B]" />
        )}
      </div>

      {label ? (
        <>
          <div className="my-1 px-2.5 py-0.5 rounded-full bg-lime/10 border border-lime/30 flex items-center gap-1.5 shadow-sm max-w-full backdrop-blur-sm">
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              {isFlowing && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-lime opacity-75" />
              )}
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-lime" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-lime font-medium truncate">
              {label}
            </span>
          </div>
          <div className="relative h-2.5 w-[2px] bg-lime/20 rounded-full overflow-hidden flex justify-center">
            {isFlowing && (
              <span className="absolute left-0 right-0 h-2 bg-gradient-to-b from-transparent via-lime to-transparent animate-data-flow-v rounded-full shadow-[0_0_6px_#EAF35B]" />
            )}
          </div>
        </>
      ) : null}

      <ArrowDown
        size={13}
        className={`shrink-0 text-lime ${isFlowing ? "animate-flow-pulse" : "opacity-80"}`}
      />
    </div>
  );
}

function generateArchitectureSVG(project: Project, language: "pt" | "en"): string {
  const title = escapeXml(project.architecture?.title[language] || project.title);
  const projectTitle = escapeXml(project.title);

  let content = "";
  if (project.id === 1) {
    content = `
    <g transform="translate(50, 105)">
      <rect width="190" height="55" rx="8" fill="#141c2e" stroke="#F2EADC" stroke-width="1.5"/>
      <text x="15" y="25" fill="#F2EADC" font-family="monospace" font-size="12" font-weight="bold">PWA Next.js</text>
      <text x="15" y="42" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Estudante · Login Anônimo" : "Student · Anonymous Login"}</text>
    </g>
    <line x1="240" y1="132" x2="300" y2="132" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(300, 105)">
      <rect width="230" height="55" rx="8" fill="#14281f" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="15" y="25" fill="#EAF35B" font-family="monospace" font-size="12" font-weight="bold">proxy.ts</text>
      <text x="15" y="42" fill="#a0aec0" font-family="monospace" font-size="10">CORS · 404 · 405</text>
    </g>
    <line x1="530" y1="132" x2="590" y2="132" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(590, 105)">
      <rect width="270" height="55" rx="8" fill="#14281f" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="15" y="25" fill="#EAF35B" font-family="monospace" font-size="12" font-weight="bold">API Routes + Zod</text>
      <text x="15" y="42" fill="#a0aec0" font-family="monospace" font-size="10">Next.js App Router · OpenAPI 3.1</text>
    </g>
    <g transform="translate(50, 190)">
      <rect width="390" height="200" rx="12" fill="#0d1829" stroke="#2E53E5" stroke-opacity="0.3" stroke-width="1"/>
      <text x="15" y="25" fill="#2E53E5" font-family="monospace" font-size="10" font-weight="bold">${language === "pt" ? "DADOS &amp; PRIVACIDADE" : "DATA &amp; PRIVACY"}</text>
      <rect x="20" y="40" width="350" height="45" rx="6" fill="#14281f" stroke="#EAF35B" stroke-width="1.2"/>
      <text x="35" y="62" fill="#EAF35B" font-family="monospace" font-size="11" font-weight="bold">Supabase Auth</text>
      <text x="35" y="76" fill="#a0aec0" font-family="monospace" font-size="9">${language === "pt" ? "Login anônimo · Só primeiro nome" : "Anonymous login · First name only"}</text>
      <rect x="20" y="95" width="350" height="45" rx="6" fill="#0f1d38" stroke="#2E53E5" stroke-width="1.2"/>
      <text x="35" y="117" fill="#93c5fd" font-family="monospace" font-size="11" font-weight="bold">Supabase Postgres</text>
      <text x="35" y="131" fill="#64748b" font-family="monospace" font-size="9">${language === "pt" ? "RLS em todas as tabelas" : "RLS on every table"}</text>
      <rect x="20" y="150" width="350" height="40" rx="6" fill="#14281f" stroke="#EAF35B" stroke-width="1.2"/>
      <text x="35" y="175" fill="#EAF35B" font-family="monospace" font-size="11" font-weight="bold">${language === "pt" ? "Pontos &amp; Rankings (Views)" : "Points &amp; Rankings (Views)"}</text>
    </g>
    <g transform="translate(470, 190)">
      <rect width="390" height="200" rx="12" fill="#0d1829" stroke="#B997FF" stroke-opacity="0.3" stroke-width="1"/>
      <text x="15" y="25" fill="#B997FF" font-family="monospace" font-size="10" font-weight="bold">${language === "pt" ? "TUTOR RAG &amp; DADOS SOLARES" : "RAG TUTOR &amp; SOLAR DATA"}</text>
      <rect x="20" y="40" width="350" height="45" rx="6" fill="#201533" stroke="#B997FF" stroke-width="1.2"/>
      <text x="35" y="62" fill="#B997FF" font-family="monospace" font-size="11" font-weight="bold">Tutor Energinho</text>
      <text x="35" y="76" fill="#a0aec0" font-family="monospace" font-size="9">Gemini API · RAG</text>
      <rect x="20" y="95" width="350" height="45" rx="6" fill="#0f1d38" stroke="#2E53E5" stroke-width="1.2"/>
      <text x="35" y="117" fill="#93c5fd" font-family="monospace" font-size="11" font-weight="bold">pgvector</text>
      <text x="35" y="131" fill="#64748b" font-family="monospace" font-size="9">HNSW · 768d · gemini-embedding-2</text>
      <rect x="20" y="150" width="350" height="40" rx="6" fill="#291612" stroke="#E97C67" stroke-width="1.2"/>
      <text x="35" y="175" fill="#E97C67" font-family="monospace" font-size="11" font-weight="bold">${language === "pt" ? "NASA POWER (Cache 6h)" : "NASA POWER (6h Cache)"}</text>
    </g>
    <g transform="translate(250, 415)">
      <rect width="420" height="50" rx="8" fill="#2a2510" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="25" y="30" fill="#EAF35B" font-family="monospace" font-size="12" font-weight="bold">${language === "pt" ? "1º LUGAR · HACKATHON EQUATORIAL 2026" : "1ST PLACE · EQUATORIAL HACKATHON 2026"}</text>
    </g>
    `;
  } else if (project.id === 2) {
    content = `
    <g transform="translate(60, 130)">
      <rect width="190" height="60" rx="8" fill="#141c2e" stroke="#F2EADC" stroke-width="1.5"/>
      <text x="15" y="27" fill="#F2EADC" font-family="monospace" font-size="12" font-weight="bold">Client / HTTP</text>
      <text x="15" y="45" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Apps Web &amp; Mobile" : "Web &amp; Mobile Clients"}</text>
    </g>
    <line x1="250" y1="160" x2="330" y2="160" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(330, 130)">
      <rect width="250" height="60" rx="8" fill="#14281f" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="15" y="27" fill="#EAF35B" font-family="monospace" font-size="12" font-weight="bold">API Gateway (Express)</text>
      <text x="15" y="45" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Rate Limiter Token Bucket" : "Token Bucket Rate Limiter"}</text>
    </g>
    <line x1="455" y1="190" x2="455" y2="240" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(60, 240)">
      <rect width="360" height="180" rx="12" fill="#0d1829" stroke="#EAF35B" stroke-opacity="0.3" stroke-width="1"/>
      <text x="15" y="25" fill="#EAF35B" font-family="monospace" font-size="10" font-weight="bold">${language === "pt" ? "AUTENTICAÇÃO &amp; RBAC" : "AUTHENTICATION &amp; RBAC"}</text>
      <rect x="20" y="40" width="320" height="45" rx="6" fill="#14281f" stroke="#EAF35B" stroke-width="1.2"/>
      <text x="35" y="62" fill="#EAF35B" font-family="monospace" font-size="11" font-weight="bold">Auth Service (MFA &amp; JWT)</text>
      <text x="35" y="76" fill="#a0aec0" font-family="monospace" font-size="9">RS256 Signature · RBAC</text>
      <rect x="20" y="110" width="150" height="50" rx="6" fill="#0f1d38" stroke="#2E53E5" stroke-width="1.2"/>
      <text x="30" y="132" fill="#93c5fd" font-family="monospace" font-size="11" font-weight="bold">PostgreSQL</text>
      <text x="30" y="147" fill="#64748b" font-family="monospace" font-size="9">${language === "pt" ? "Usuários &amp; Roles" : "Users &amp; Roles"}</text>
      <rect x="190" y="110" width="150" height="50" rx="6" fill="#291612" stroke="#E97C67" stroke-width="1.2"/>
      <text x="200" y="132" fill="#E97C67" font-family="monospace" font-size="11" font-weight="bold">Redis Blacklist</text>
      <text x="200" y="147" fill="#a0aec0" font-family="monospace" font-size="9">${language === "pt" ? "Tokens Revogados" : "Revoked Tokens"}</text>
    </g>
    <g transform="translate(480, 240)">
      <rect width="360" height="180" rx="12" fill="#0d1829" stroke="#E97C67" stroke-opacity="0.3" stroke-width="1"/>
      <text x="15" y="25" fill="#E97C67" font-family="monospace" font-size="10" font-weight="bold">${language === "pt" ? "MENSAGERIA &amp; RESILIÊNCIA" : "MESSAGING &amp; RESILIENCE"}</text>
      <rect x="20" y="40" width="320" height="45" rx="6" fill="#291612" stroke="#E97C67" stroke-width="1.2"/>
      <text x="35" y="62" fill="#E97C67" font-family="monospace" font-size="11" font-weight="bold">RabbitMQ Exchange</text>
      <text x="35" y="76" fill="#a0aec0" font-family="monospace" font-size="9">Fanout / Direct · Zero Loss</text>
      <rect x="20" y="110" width="150" height="50" rx="6" fill="#291612" stroke="#E97C67" stroke-width="1.2"/>
      <text x="30" y="132" fill="#E97C67" font-family="monospace" font-size="11" font-weight="bold">DLQ Queue</text>
      <text x="30" y="147" fill="#a0aec0" font-family="monospace" font-size="9">${language === "pt" ? "Zero Perda" : "Zero Loss"}</text>
      <rect x="190" y="110" width="150" height="50" rx="6" fill="#201533" stroke="#B997FF" stroke-width="1.2"/>
      <text x="200" y="132" fill="#B997FF" font-family="monospace" font-size="11" font-weight="bold">Audit Consumer</text>
      <text x="200" y="147" fill="#a0aec0" font-family="monospace" font-size="9">${language === "pt" ? "Logs Assíncronos" : "Async Logging"}</text>
    </g>
    `;
  } else if (project.id === 3) {
    content = `
    <g transform="translate(60, 110)">
      <rect width="180" height="50" rx="6" fill="#141c2e" stroke="#F2EADC" stroke-width="1.5"/>
      <text x="15" y="25" fill="#F2EADC" font-family="monospace" font-size="11" font-weight="bold">User Query</text>
      <text x="15" y="40" fill="#a0aec0" font-family="monospace" font-size="9">${language === "pt" ? "Linguagem Natural" : "Natural Language"}</text>
    </g>
    <line x1="240" y1="135" x2="300" y2="135" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(300, 110)">
      <rect width="210" height="50" rx="6" fill="#14281f" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="15" y="25" fill="#EAF35B" font-family="monospace" font-size="11" font-weight="bold">FastAPI Gateway</text>
      <text x="15" y="40" fill="#a0aec0" font-family="monospace" font-size="9">Python 3.12 · Asyncio</text>
    </g>
    <line x1="510" y1="135" x2="570" y2="135" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(570, 110)">
      <rect width="210" height="50" rx="6" fill="#201533" stroke="#B997FF" stroke-width="1.5"/>
      <text x="15" y="25" fill="#B997FF" font-family="monospace" font-size="11" font-weight="bold">Semantic Router</text>
      <text x="15" y="40" fill="#a0aec0" font-family="monospace" font-size="9">${language === "pt" ? "Roteamento Semântico" : "Semantic Intent Router"}</text>
    </g>
    <g transform="translate(60, 200)">
      <rect width="360" height="150" rx="10" fill="#0d1829" stroke="#2E53E5" stroke-opacity="0.3" stroke-width="1"/>
      <text x="15" y="22" fill="#2E53E5" font-family="monospace" font-size="10" font-weight="bold">${language === "pt" ? "RAMO VETORIAL (SEMÂNTICO)" : "VECTOR BRANCH (SEMANTIC)"}</text>
      <rect x="20" y="35" width="320" height="45" rx="6" fill="#14281f" stroke="#EAF35B" stroke-width="1.2"/>
      <text x="30" y="55" fill="#EAF35B" font-family="monospace" font-size="10" font-weight="bold">Local Embeddings (384d)</text>
      <text x="30" y="70" fill="#a0aec0" font-family="monospace" font-size="9">FastEmbed · Zero API Cost</text>
      <rect x="20" y="90" width="320" height="45" rx="6" fill="#0f1d38" stroke="#2E53E5" stroke-width="1.2"/>
      <text x="30" y="110" fill="#93c5fd" font-family="monospace" font-size="10" font-weight="bold">PostgreSQL + pgvector</text>
      <text x="30" y="125" fill="#64748b" font-family="monospace" font-size="9">HNSW Index · Latency &lt;15ms</text>
    </g>
    <g transform="translate(480, 200)">
      <rect width="360" height="150" rx="10" fill="#0d1829" stroke="#B997FF" stroke-opacity="0.3" stroke-width="1"/>
      <text x="15" y="22" fill="#B997FF" font-family="monospace" font-size="10" font-weight="bold">${language === "pt" ? "RAMO METADADOS &amp; FILTROS" : "METADATA &amp; FILTERS BRANCH"}</text>
      <rect x="20" y="35" width="320" height="45" rx="6" fill="#201533" stroke="#B997FF" stroke-width="1.2"/>
      <text x="30" y="55" fill="#B997FF" font-family="monospace" font-size="10" font-weight="bold">Node.js Search Service</text>
      <text x="30" y="70" fill="#a0aec0" font-family="monospace" font-size="9">Structured Filters &amp; Tags</text>
      <rect x="20" y="90" width="320" height="45" rx="6" fill="#291612" stroke="#E97C67" stroke-width="1.2"/>
      <text x="30" y="110" fill="#E97C67" font-family="monospace" font-size="10" font-weight="bold">Document Metadata</text>
      <text x="30" y="125" fill="#a0aec0" font-family="monospace" font-size="9">JSONB Indexed Store</text>
    </g>
    <g transform="translate(240, 380)">
      <rect width="420" height="40" rx="6" fill="#141c2e" stroke="#F2EADC" stroke-width="1.2"/>
      <text x="25" y="25" fill="#F2EADC" font-family="monospace" font-size="10" font-weight="bold">Context Assembly (RRF Rerank &amp; Deduplication)</text>
    </g>
    <g transform="translate(240, 435)">
      <rect width="420" height="40" rx="6" fill="#201533" stroke="#B997FF" stroke-width="1.2"/>
      <text x="25" y="25" fill="#B997FF" font-family="monospace" font-size="10" font-weight="bold">Google Gemini AI Engine (Grounding &amp; Zero Hallucinations)</text>
    </g>
    `;
  } else if (project.id === 4) {
    content = `
    <g transform="translate(100, 140)">
      <rect width="200" height="55" rx="8" fill="#141c2e" stroke="#F2EADC" stroke-width="1.5"/>
      <text x="20" y="27" fill="#F2EADC" font-family="monospace" font-size="12" font-weight="bold">Client / HTTP</text>
      <text x="20" y="44" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Requisições Financeiras" : "Financial Requests"}</text>
    </g>
    <line x1="300" y1="167" x2="420" y2="167" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(420, 140)">
      <rect width="260" height="55" rx="8" fill="#14281f" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="20" y="27" fill="#EAF35B" font-family="monospace" font-size="12" font-weight="bold">Express REST API</text>
      <text x="20" y="44" fill="#a0aec0" font-family="monospace" font-size="10">Zod Validation · JWT Auth</text>
    </g>
    <g transform="translate(100, 240)">
      <rect width="320" height="70" rx="8" fill="#0f1d38" stroke="#2E53E5" stroke-width="1.5"/>
      <text x="20" y="30" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">PostgreSQL (ACID Ledger)</text>
      <text x="20" y="50" fill="#a0aec0" font-family="monospace" font-size="10">Double-Entry Bookkeeping · Serializable</text>
    </g>
    <g transform="translate(480, 240)">
      <rect width="320" height="70" rx="8" fill="#201533" stroke="#B997FF" stroke-width="1.5"/>
      <text x="20" y="30" fill="#B997FF" font-family="monospace" font-size="12" font-weight="bold">Gemini AI Engine</text>
      <text x="20" y="50" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Detecção Preditiva de Anomalias" : "Predictive Anomaly Detection"}</text>
    </g>
    <g transform="translate(250, 360)">
      <rect width="400" height="60" rx="8" fill="#14281f" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="20" y="28" fill="#EAF35B" font-family="monospace" font-size="12" font-weight="bold">${language === "pt" ? "Relatórios &amp; Recomendações" : "Reports &amp; Recommendations"}</text>
      <text x="20" y="47" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Painel de Decisão Estratégica" : "Strategic Decision Dashboard"}</text>
    </g>
    `;
  } else if (project.id === 5) {
    content = `
    <g transform="translate(60, 150)">
      <rect width="180" height="60" rx="8" fill="#141c2e" stroke="#F2EADC" stroke-width="1.5"/>
      <text x="20" y="28" fill="#F2EADC" font-family="monospace" font-size="12" font-weight="bold">Client App</text>
      <text x="20" y="46" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Interface do Cidadão" : "Citizen Interface"}</text>
    </g>
    <line x1="240" y1="180" x2="340" y2="180" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(340, 150)">
      <rect width="220" height="60" rx="8" fill="#14281f" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="20" y="28" fill="#EAF35B" font-family="monospace" font-size="12" font-weight="bold">Express REST API</text>
      <text x="20" y="46" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Controle e JWT" : "Access &amp; JWT"}</text>
    </g>
    <line x1="560" y1="180" x2="660" y2="180" stroke="#2E53E5" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(660, 150)">
      <rect width="200" height="60" rx="8" fill="#0f1d38" stroke="#2E53E5" stroke-width="1.5"/>
      <text x="20" y="28" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">MongoDB / Mongoose</text>
      <text x="20" y="46" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Catálogo Centralizado" : "Centralized Catalog"}</text>
    </g>
    <g transform="translate(100, 280)">
      <rect width="320" height="70" rx="8" fill="#291612" stroke="#E97C67" stroke-width="1.5"/>
      <text x="20" y="30" fill="#E97C67" font-family="monospace" font-size="12" font-weight="bold">Google Maps Platform</text>
      <text x="20" y="50" fill="#a0aec0" font-family="monospace" font-size="10">Geocoding &amp; Places API</text>
    </g>
    <g transform="translate(480, 280)">
      <rect width="320" height="70" rx="8" fill="#201533" stroke="#B997FF" stroke-width="1.5"/>
      <text x="20" y="30" fill="#B997FF" font-family="monospace" font-size="12" font-weight="bold">IBGE Open Data API</text>
      <text x="20" y="50" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Dados Demográficos e Municípios" : "Demographic Data &amp; Municipalities"}</text>
    </g>
    `;
  } else {
    content = `
    <g transform="translate(100, 150)">
      <rect width="200" height="60" rx="8" fill="#141c2e" stroke="#F2EADC" stroke-width="1.5"/>
      <text x="20" y="28" fill="#F2EADC" font-family="monospace" font-size="12" font-weight="bold">Client / Mobile</text>
      <text x="20" y="46" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Busca de Postos" : "Health Unit Search"}</text>
    </g>
    <line x1="300" y1="180" x2="440" y2="180" stroke="#EAF35B" stroke-width="2" marker-end="url(#arrow)"/>
    <g transform="translate(440, 150)">
      <rect width="250" height="60" rx="8" fill="#14281f" stroke="#EAF35B" stroke-width="1.5"/>
      <text x="20" y="28" fill="#EAF35B" font-family="monospace" font-size="12" font-weight="bold">Node.js / Express API</text>
      <text x="20" y="46" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Processamento Geoespacial" : "Geospatial Processing"}</text>
    </g>
    <g transform="translate(100, 280)">
      <rect width="320" height="70" rx="8" fill="#0f1d38" stroke="#2E53E5" stroke-width="1.5"/>
      <text x="20" y="30" fill="#93c5fd" font-family="monospace" font-size="12" font-weight="bold">MongoDB (2dsphere)</text>
      <text x="20" y="50" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Distâncias Euclidianas" : "Euclidean Distance Calculation"}</text>
    </g>
    <g transform="translate(480, 280)">
      <rect width="320" height="70" rx="8" fill="#291612" stroke="#E97C67" stroke-width="1.5"/>
      <text x="20" y="30" fill="#E97C67" font-family="monospace" font-size="12" font-weight="bold">Google Maps Platform</text>
      <text x="20" y="50" fill="#a0aec0" font-family="monospace" font-size="10">${language === "pt" ? "Rotas até o Posto Mais Próximo" : "Routes to Nearest Health Center"}</text>
    </g>
    `;
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 920 540" width="100%" height="100%">
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#EAF35B"/>
    </marker>
  </defs>
  <rect width="920" height="540" rx="16" fill="#070c1a" stroke="rgba(242,234,220,0.15)" stroke-width="1.5"/>
  <text x="50" y="52" fill="#F2EADC" font-family="system-ui, sans-serif" font-size="20" font-weight="bold">${title}</text>
  <text x="50" y="76" fill="#EAF35B" font-family="monospace" font-size="11" letter-spacing="1">${projectTitle.toUpperCase()} · ARCHITECTURAL BLUEPRINT</text>
  ${content}
  <line x1="50" y1="495" x2="870" y2="495" stroke="rgba(242,234,220,0.1)" stroke-width="1"/>
  <circle cx="60" cy="515" r="4" fill="#EAF35B"/>
  <text x="70" y="519" fill="#a0aec0" font-family="monospace" font-size="10">Gateway</text>
  <circle cx="150" cy="515" r="4" fill="#2E53E5"/>
  <text x="160" y="519" fill="#a0aec0" font-family="monospace" font-size="10">Persistence</text>
  <circle cx="260" cy="515" r="4" fill="#E97C67"/>
  <text x="270" y="519" fill="#a0aec0" font-family="monospace" font-size="10">Messaging</text>
  <circle cx="360" cy="515" r="4" fill="#B997FF"/>
  <text x="370" y="519" fill="#a0aec0" font-family="monospace" font-size="10">AI &amp; Routing</text>
  <circle cx="480" cy="515" r="4" fill="#F2EADC"/>
  <text x="490" y="519" fill="#a0aec0" font-family="monospace" font-size="10">Clients</text>
  <text x="870" y="519" text-anchor="end" fill="#EAF35B" font-family="monospace" font-size="10" opacity="0.8">GABRIEL COELHO · BACK-END</text>
</svg>`;
}

export default function ArchitectureVisualizer({
  project,
  language,
  copiedId,
  copyFailed,
  onCopyDiagram,
  copyLabel,
  copiedLabel,
  copyFailedLabel,
}: Props) {
  const [viewMode, setViewMode] = useState<"visual" | "ascii">("visual");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlowing, setIsFlowing] = useState(true);
  const [activeLayer, setActiveLayer] = useState<NodeColor | null>(null);
  const [selectedNodeLabel, setSelectedNodeLabel] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [mermaidCopyState, setMermaidCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [downloadedSvg, setDownloadedSvg] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const asciiRef = useRef<HTMLDivElement>(null);
  const modalAsciiRef = useRef<HTMLDivElement>(null);

  const handleAsciiScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 12;
    setCanScrollRight(!atEnd);
  };

  const handleCopyMermaid = async () => {
    const mermaidCode = project.architecture?.mermaid
      ? project.architecture.mermaid[language]
      : "";
    if (!mermaidCode) return;
    const ok = await copyText("```mermaid\n" + mermaidCode + "\n```");
    setMermaidCopyState(ok ? "copied" : "failed");
    setTimeout(() => setMermaidCopyState("idle"), 2500);
  };

  const handleDownloadSVG = () => {
    const svgData = generateArchitectureSVG(project, language);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, "-")}-architecture.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloadedSvg(true);
    setTimeout(() => setDownloadedSvg(false), 2500);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isFullscreen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFullscreen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isFullscreen]);

  const handleToggleLayer = (layer: NodeColor) => {
    setActiveLayer((prev) => (prev === layer ? null : layer));
  };

  const handleSelectNode = (label: string) => {
    setSelectedNodeLabel((prev) => (prev === label ? null : label));
  };

  const selectedNodeSpec = selectedNodeLabel ? nodeSpecs[selectedNodeLabel] : null;

  const renderVisualFlow = () => {
    const getNodeProps = (label: string, defaultColor: NodeColor = "cream") => {
      const spec = nodeSpecs[label];
      const color = spec ? spec.color : defaultColor;
      return {
        label,
        color,
        isSelected: selectedNodeLabel === label,
        activeLayer,
        onClick: () => handleSelectNode(label),
      };
    };

    switch (project.id) {
      case 1: // Cidade Energia
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                sub={language === "pt" ? "Estudante · Login Anônimo" : "Student · Anonymous Login"}
                {...getNodeProps("PWA Next.js", "cream")}
              />
              <Connector orientation="horizontal" label="Bearer" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Network}
                sub="CORS · 404 · 405"
                {...getNodeProps("proxy.ts", "lime")}
              />
              <Connector orientation="horizontal" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Server}
                sub={language === "pt" ? "Validação estrita" : "Strict validation"}
                badge="OpenAPI 3.1"
                {...getNodeProps("API Routes + Zod", "lime")}
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Regras Puras em src/lib" : "Pure Rules in src/lib"}
              isFlowing={isFlowing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-blue/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  {language === "pt" ? "Dados & Privacidade" : "Data & Privacy"}
                </span>
                <ArchitectureNode
                  icon={Shield}
                  sub={language === "pt" ? "Só o primeiro nome" : "First name only"}
                  compact
                  {...getNodeProps("Supabase Auth", "lime")}
                />
                <Connector orientation="vertical" isFlowing={isFlowing} />
                <ArchitectureNode
                  icon={Database}
                  sub={language === "pt" ? "RLS em todas as tabelas" : "RLS on every table"}
                  compact
                  {...getNodeProps("Supabase Postgres", "blue")}
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-lavender/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  {language === "pt" ? "Tutor RAG & Dados Solares" : "RAG Tutor & Solar Data"}
                </span>
                <ArchitectureNode
                  icon={Bot}
                  sub={language === "pt" ? "Responde com base nas lições" : "Lesson-grounded answers"}
                  compact
                  {...getNodeProps("Tutor Energinho", "lavender")}
                />
                <Connector orientation="vertical" isFlowing={isFlowing} />
                <div className="flex flex-col gap-2 w-full">
                  <ArchitectureNode
                    icon={Database}
                    sub="HNSW · 768d"
                    compact
                    {...getNodeProps("pgvector", "blue")}
                  />
                  <ArchitectureNode
                    icon={Sparkles}
                    sub={language === "pt" ? "Geração ancorada" : "Grounded generation"}
                    compact
                    {...getNodeProps("Gemini API", "lavender")}
                  />
                  <ArchitectureNode
                    icon={Sun}
                    sub={language === "pt" ? "Irradiação de São Luís · Cache 6h" : "São Luís irradiance · 6h cache"}
                    compact
                    {...getNodeProps("NASA POWER", "orange")}
                  />
                </div>
              </div>
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Gamificação no Servidor" : "Server-Side Gamification"}
              isFlowing={isFlowing}
            />

            <div className="w-full max-w-md">
              <ArchitectureNode
                icon={Trophy}
                sub={language === "pt" ? "Views agregadas · Sem dados individuais" : "Aggregated views · No individual data"}
                compact
                {...getNodeProps("Pontos & Rankings", "lime")}
              />
            </div>
          </div>
        );

      case 2: // AuthGuard
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                sub={language === "pt" ? "Apps Web & Mobile" : "Web & Mobile Clients"}
                {...getNodeProps("Client / HTTP", "cream")}
              />
              <Connector orientation="horizontal" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Server}
                sub={language === "pt" ? "Rate Limiter Token Bucket" : "Token Bucket Rate Limiter"}
                badge="Express + Redis"
                {...getNodeProps("API Gateway (Express)", "lime")}
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Desacoplamento Assíncrono" : "Async Decoupling"}
              isFlowing={isFlowing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-lime/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lime font-bold">
                  {language === "pt" ? "Autenticação & RBAC" : "Authentication & RBAC"}
                </span>
                <ArchitectureNode
                  icon={Shield}
                  sub="MFA / TOTP & JWT"
                  compact
                  {...getNodeProps("Auth Service", "lime")}
                />
                <Connector orientation="vertical" isFlowing={isFlowing} />
                <div className="flex flex-col gap-2 w-full">
                  <ArchitectureNode
                    icon={Database}
                    sub={language === "pt" ? "Usuários & Roles" : "Users & Roles"}
                    compact
                    {...getNodeProps("PostgreSQL", "blue")}
                  />
                  <ArchitectureNode
                    icon={Cpu}
                    sub={language === "pt" ? "Tokens Revogados" : "Revoked Tokens"}
                    compact
                    {...getNodeProps("Redis Blacklist", "orange")}
                  />
                </div>
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-orange/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  {language === "pt" ? "Mensageria & Resiliência" : "Messaging & Resilience"}
                </span>
                <ArchitectureNode
                  icon={Workflow}
                  sub="Fanout / Direct"
                  compact
                  {...getNodeProps("RabbitMQ Exchange", "orange")}
                />
                <Connector orientation="vertical" isFlowing={isFlowing} />
                <div className="flex flex-col gap-2 w-full">
                  <ArchitectureNode
                    icon={Layers}
                    sub={language === "pt" ? "Zero Mensagens Perdidas" : "Zero Message Loss"}
                    compact
                    {...getNodeProps("DLQ Queue", "orange")}
                  />
                  <ArchitectureNode
                    icon={Server}
                    sub={language === "pt" ? "Logging Assíncrono" : "Async Audit Logging"}
                    compact
                    {...getNodeProps("Audit Consumer", "lavender")}
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 3: // RAG Serviços Públicos
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Search}
                sub={language === "pt" ? "Busca em Linguagem Natural" : "Natural Language Query"}
                {...getNodeProps("User Query", "cream")}
              />
              <Connector orientation="horizontal" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Server}
                sub={language === "pt" ? "Orquestrador Assíncrono" : "Async Orchestrator"}
                badge="Python 3.12"
                {...getNodeProps("FastAPI Gateway", "lime")}
              />
              <Connector orientation="horizontal" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Workflow}
                sub={language === "pt" ? "Roteamento Semântico" : "Semantic Routing"}
                {...getNodeProps("Semantic Router", "lavender")}
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Busca Híbrida Paralela" : "Parallel Hybrid Search"}
              isFlowing={isFlowing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-blue/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  {language === "pt" ? "Ramo Vetorial (Semântico)" : "Vector Branch (Semantic)"}
                </span>
                <ArchitectureNode
                  icon={Cpu}
                  sub={language === "pt" ? "FastEmbed · Zero Custo de API" : "FastEmbed · Zero API Cost"}
                  compact
                  {...getNodeProps("Local Embeddings (384d)", "lime")}
                />
                <Connector orientation="vertical" isFlowing={isFlowing} />
                <ArchitectureNode
                  icon={Database}
                  sub={language === "pt" ? "Índice HNSW · Latência <15ms" : "HNSW Index · <15ms Latency"}
                  compact
                  {...getNodeProps("PostgreSQL + pgvector", "blue")}
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-lavender/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  {language === "pt" ? "Ramo de Metadados & Filtros" : "Metadata & Filters Branch"}
                </span>
                <ArchitectureNode
                  icon={Server}
                  sub={language === "pt" ? "Filtros Estruturados & Tags" : "Structured Filters & Tags"}
                  compact
                  {...getNodeProps("Node.js Search Service", "lavender")}
                />
                <Connector orientation="vertical" isFlowing={isFlowing} />
                <ArchitectureNode
                  icon={Layers}
                  sub={language === "pt" ? "Categorias & Secretarias" : "Categories & Departments"}
                  compact
                  {...getNodeProps("Document Metadata", "orange")}
                />
              </div>
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Síntese & Ancoragem" : "Synthesis & Grounding"}
              isFlowing={isFlowing}
            />

            <div className="flex flex-col items-center gap-2 w-full max-w-lg">
              <ArchitectureNode
                icon={Layers}
                sub={language === "pt" ? "Rerank & Deduplicação de Chunks" : "Rerank & Chunk Deduplication"}
                compact
                {...getNodeProps("Context Assembly", "cream")}
              />
              <Connector orientation="vertical" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Bot}
                sub={language === "pt" ? "Geração Restrita (Zero Alucinações)" : "Constrained Generation (No Hallucinations)"}
                badge="LLM Grounding"
                compact
                {...getNodeProps("Google Gemini AI Engine", "lavender")}
              />
              <Connector orientation="vertical" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Sparkles}
                sub={language === "pt" ? "Resposta Fundamentada com Fontes Oficiais" : "Grounded Response with Official Sources"}
                compact
                {...getNodeProps("Grounded Answer + Sources", "lime")}
              />
            </div>
          </div>
        );

      case 4: // API Financeira Inteligente
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                sub={language === "pt" ? "Requisições Financeiras" : "Financial Requests"}
                {...getNodeProps("Client / HTTP", "cream")}
              />
              <Connector orientation="horizontal" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Server}
                sub={language === "pt" ? "Validação Zod + JWT" : "Zod + JWT Validation"}
                badge="TypeScript"
                {...getNodeProps("Express REST API", "lime")}
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Bifurcação: Transações & Auditoria" : "Branch: Transactions & Audit"}
              isFlowing={isFlowing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-blue/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  {language === "pt" ? "Consistência Contábil" : "Ledger Consistency"}
                </span>
                <ArchitectureNode
                  icon={Database}
                  sub="Double-Entry Bookkeeping"
                  compact
                  {...getNodeProps("PostgreSQL (ACID Ledger)", "blue")}
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
                  sub={language === "pt" ? "Detecção Preditiva de Anomalias" : "Predictive Anomaly Detection"}
                  compact
                  {...getNodeProps("Gemini AI Engine", "lavender")}
                />
                <span className="text-[10px] text-cream/70 font-mono text-center">
                  {language === "pt" ? "Auditoria & Categorização Automática" : "Auditing & Automated Categorization"}
                </span>
              </div>
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Síntese Analítica" : "Analytical Synthesis"}
              isFlowing={isFlowing}
            />

            <div className="w-full max-w-md">
              <ArchitectureNode
                icon={Sparkles}
                sub={language === "pt" ? "Painel de Decisão Estratégica" : "Strategic Decision Dashboard"}
                compact
                {...getNodeProps("Relatórios & Recomendações", "lime")}
              />
            </div>
          </div>
        );

      case 5: // Guia Maranhão
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                sub={language === "pt" ? "Interface do Cidadão" : "Citizen Interface"}
                {...getNodeProps("Client App", "cream")}
              />
              <Connector orientation="horizontal" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Server}
                sub={language === "pt" ? "Controle e Autenticação JWT" : "Access Control & JWT Auth"}
                {...getNodeProps("Express REST API", "lime")}
              />
              <Connector orientation="horizontal" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Database}
                sub={language === "pt" ? "Catálogo Centralizado" : "Centralized Catalog"}
                {...getNodeProps("MongoDB / Mongoose", "blue")}
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Agregação de Fontes Governamentais" : "Government Data Aggregation"}
              isFlowing={isFlowing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-orange/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  {language === "pt" ? "Geolocalização & Rotas" : "Geolocation & Routes"}
                </span>
                <ArchitectureNode
                  icon={MapPin}
                  sub="Geocoding & Places API"
                  compact
                  {...getNodeProps("Google Maps Platform", "orange")}
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-lavender/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-lavender font-bold">
                  {language === "pt" ? "Dados Abertos do IBGE" : "IBGE Open Data"}
                </span>
                <ArchitectureNode
                  icon={Layers}
                  sub={language === "pt" ? "Dados Demográficos e Municípios" : "Demographic Data & Municipalities"}
                  compact
                  {...getNodeProps("IBGE Open Data API", "lavender")}
                />
              </div>
            </div>
          </div>
        );

      case 6: // BuscaSUS
      default:
        return (
          <div className="flex flex-col items-center gap-2 w-full max-w-3xl mx-auto py-2">
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full justify-center">
              <ArchitectureNode
                icon={Globe}
                sub={language === "pt" ? "Busca de Postos de Saúde" : "Health Unit Search"}
                {...getNodeProps("Client / Mobile", "cream")}
              />
              <Connector orientation="horizontal" isFlowing={isFlowing} />
              <ArchitectureNode
                icon={Server}
                sub={language === "pt" ? "Processamento Geoespacial" : "Geospatial Processing"}
                {...getNodeProps("Node.js / Express API", "lime")}
              />
            </div>

            <Connector
              orientation="vertical"
              label={language === "pt" ? "Cálculo de Proximidade & Rotas" : "Proximity Calculation & Routes"}
              isFlowing={isFlowing}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-blue/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-blue font-bold">
                  {language === "pt" ? "Indexação Geoespacial" : "Geospatial Indexing"}
                </span>
                <ArchitectureNode
                  icon={Database}
                  sub={language === "pt" ? "Cálculo de Distâncias Euclidianas" : "Euclidean Distance Calculation"}
                  compact
                  {...getNodeProps("MongoDB (2dsphere)", "blue")}
                />
              </div>

              <div className="flex flex-col items-center gap-2.5 p-3.5 sm:p-4 rounded-xl bg-navy/60 border border-orange/30 w-full min-w-0">
                <span className="font-mono text-[10px] tracking-wider uppercase text-orange font-bold">
                  {language === "pt" ? "Navegação do Paciente" : "Patient Navigation"}
                </span>
                <ArchitectureNode
                  icon={MapPin}
                  sub={language === "pt" ? "Rotas até o Posto Mais Próximo" : "Routes to Nearest Health Center"}
                  compact
                  {...getNodeProps("Google Maps Platform", "orange")}
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

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {/* Pause / Play Flow Button */}
          {viewMode === "visual" && (
            <button
              type="button"
              onClick={() => setIsFlowing(!isFlowing)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border font-mono text-xs tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                isFlowing
                  ? "border-lime/40 bg-lime/10 text-lime hover:bg-lime/20"
                  : "border-cream/20 bg-black/40 text-cream/60 hover:text-cream"
              }`}
              title={
                isFlowing
                  ? language === "pt"
                    ? "Pausar animação de tráfego"
                    : "Pause data flow animation"
                  : language === "pt"
                  ? "Ativar animação de tráfego"
                    : "Enable data flow animation"
              }
            >
              {isFlowing ? <Pause size={12} /> : <Play size={12} />}
              <span className="hidden sm:inline">
                {isFlowing
                  ? language === "pt"
                    ? "Fluxo Ativo"
                    : "Live Flow"
                  : language === "pt"
                  ? "Pausado"
                  : "Paused"}
              </span>
            </button>
          )}

          {/* Export Mermaid Button */}
          {project.architecture?.mermaid && (
            <button
              type="button"
              onClick={handleCopyMermaid}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cream/30 font-mono text-xs tracking-wider uppercase text-cream/90 hover:bg-lavender hover:text-navy hover:border-lavender transition-all duration-200 cursor-pointer"
              title={language === "pt" ? "Copiar diagrama para Mermaid.js (GitHub/Notion)" : "Copy diagram to Mermaid.js (GitHub/Notion)"}
            >
              {mermaidCopyState === "copied" ? (
                <>
                  <Check size={13} className="text-lime sm:text-navy" />
                  <span className="hidden md:inline">{language === "pt" ? "Mermaid Copiado!" : "Mermaid Copied!"}</span>
                </>
              ) : mermaidCopyState === "failed" ? (
                <>
                  <AlertCircle size={13} className="text-orange" />
                  <span className="hidden md:inline">{copyFailedLabel}</span>
                </>
              ) : (
                <>
                  <FileCode size={13} />
                  <span className="hidden md:inline">Mermaid</span>
                </>
              )}
            </button>
          )}

          {/* Download SVG Button */}
          <button
            type="button"
            onClick={handleDownloadSVG}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cream/30 font-mono text-xs tracking-wider uppercase text-cream/90 hover:bg-blue hover:text-white hover:border-blue transition-all duration-200 cursor-pointer"
            title={language === "pt" ? "Baixar diagrama em imagem vetorial (SVG)" : "Download architecture vector diagram (SVG)"}
          >
            {downloadedSvg ? (
              <>
                <Check size={13} className="text-lime" />
                <span className="hidden md:inline">{language === "pt" ? "SVG Baixado!" : "SVG Downloaded!"}</span>
              </>
            ) : (
              <>
                <Download size={13} />
                <span className="hidden md:inline">SVG</span>
              </>
            )}
          </button>

          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cream/30 font-mono text-xs tracking-wider uppercase text-cream/90 hover:bg-cream/15 hover:border-cream/60 transition-all duration-200 cursor-pointer"
            title={language === "pt" ? "Modo Tela Cheia (Esc)" : "Fullscreen Mode (Esc)"}
            aria-label={language === "pt" ? "Expandir diagrama" : "Expand diagram"}
          >
            <Maximize2 size={13} />
            <span className="hidden sm:inline">{language === "pt" ? "Expandir" : "Expand"}</span>
          </button>

          {/* Copy ASCII Button */}
          <button
            type="button"
            onClick={onCopyDiagram}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cream/30 font-mono text-xs tracking-wider uppercase text-cream/90 hover:bg-lime hover:text-navy hover:border-lime transition-all duration-200 cursor-pointer"
            aria-label={copyLabel}
          >
            {copiedId === project.id ? (
              <>
                <Check size={14} className="text-lime sm:text-navy" />
                <span>{copiedLabel}</span>
              </>
            ) : copyFailed ? (
              <>
                <AlertCircle size={14} className="text-orange" />
                <span>{copyFailedLabel}</span>
              </>
            ) : (
              <>
                <Copy size={14} />
                <span className="hidden sm:inline">{copyLabel}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Render Canvas */}
      {viewMode === "visual" ? (
        <div className="p-3 sm:p-6 rounded-xl bg-black/60 border border-cream/15 shadow-inner overflow-x-auto">
          {renderVisualFlow()}
          
          {/* Interactive Node Inspector Panel */}
          {selectedNodeSpec && selectedNodeLabel && (
            <div className="mt-4 p-3.5 sm:p-4 rounded-xl bg-navy/95 border border-lime/40 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200">
              <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-cream/15">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 sm:p-2 rounded-lg ${
                      colorStyles[selectedNodeSpec.color].bg
                    } ${colorStyles[selectedNodeSpec.color].text}`}
                  >
                    <selectedNodeSpec.icon size={16} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h5 className="font-mono font-bold text-sm text-cream">{selectedNodeLabel}</h5>
                      <span
                        className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border ${
                          colorStyles[selectedNodeSpec.color].badge
                        }`}
                      >
                        {selectedNodeSpec.badge || selectedNodeSpec.color}
                      </span>
                    </div>
                    <p className="font-mono text-[10px] text-cream/70">{selectedNodeSpec.protocol}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedNodeLabel(null)}
                  className="p-1 rounded-md text-cream/60 hover:text-cream hover:bg-cream/10 transition-colors"
                  aria-label="Fechar inspetor"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs font-mono">
                <div className="p-2.5 rounded-lg bg-black/40 border border-cream/10">
                  <p className="text-[10px] text-lime font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Info size={11} />
                    {language === "pt" ? "Papel Arquitetural" : "Architectural Role"}
                  </p>
                  <p className="text-cream/90 leading-relaxed text-[11px]">
                    {selectedNodeSpec.role[language]}
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-black/40 border border-cream/10">
                  <p className="text-[10px] text-orange font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Workflow size={11} />
                    {language === "pt" ? "Trade-off & Decisão Técnica" : "Technical Trade-off"}
                  </p>
                  <p className="text-cream/90 leading-relaxed text-[11px]">
                    {selectedNodeSpec.tradeoff[language]}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* User Hint */}
          {!selectedNodeSpec && (
            <p className="mt-3 text-center font-mono text-[10px] text-cream/50 select-none">
              {language === "pt"
                ? "💡 Dica: Clique em qualquer nó da arquitetura para inspecionar decisões técnicas ou filtre pelas cores da legenda."
                : "💡 Tip: Click any architecture node to inspect technical trade-offs or filter by legend layer."}
            </p>
          )}

          <SemanticLegend
            language={language}
            activeLayer={activeLayer}
            onToggleLayer={handleToggleLayer}
          />
        </div>
      ) : (
        <div className="relative group/ascii rounded-xl overflow-hidden border border-cream/15 bg-black/85 shadow-inner select-text">
          {/* Right fade gradient when scrollable on mobile */}
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black via-black/80 to-transparent transition-opacity duration-300 z-10 sm:hidden ${
              canScrollRight ? "opacity-100" : "opacity-0"
            }`}
          />

          {/* Scrollable ASCII container */}
          <div
            ref={asciiRef}
            onScroll={handleAsciiScroll}
            className="p-4 sm:p-6 overflow-x-auto"
          >
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

          {/* Mobile Scroll Indicator Bar */}
          <div className="sm:hidden flex items-center justify-between px-3.5 py-1.5 bg-navy/90 border-t border-cream/10 text-[10px] font-mono text-lime/90">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
              <span>Terminal ASCII</span>
            </span>
            <span className="flex items-center gap-1 text-cream/70">
              {canScrollRight ? (
                <span className="text-lime animate-pulse flex items-center gap-1">
                  <span>{language === "pt" ? "Deslize para ver mais" : "Scroll to view more"}</span>
                  <span>➔</span>
                </span>
              ) : (
                <span className="text-cream/50 flex items-center gap-1">
                  <span>{language === "pt" ? "Fim do diagrama" : "End of diagram"}</span>
                  <Check size={11} className="text-lime" />
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Fullscreen Inspection Modal rendered via React Portal */}
      {isFullscreen && mounted && typeof document !== "undefined" && createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={project.architecture?.title[language] || "Architecture Diagram"}
          className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md p-3 sm:p-6 md:p-8 flex items-center justify-center overflow-y-auto animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false);
          }}
        >
          <div
            className="relative w-full max-w-5xl my-auto p-4 sm:p-6 md:p-8 rounded-2xl bg-navy/95 border border-cream/20 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-cream/15 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-lime/20 border border-lime/30 text-lime flex items-center justify-center shrink-0">
                  <Network size={18} />
                </div>
                <div>
                  <h4 className="font-display font-bold text-base sm:text-xl text-cream">
                    {project.architecture?.title[language]}
                  </h4>
                  <p className="font-mono text-[11px] text-lime tracking-wider uppercase">
                    {project.title} · {language === "pt" ? "Inspeção Arquitetural em Tela Cheia" : "Fullscreen Architectural Inspection"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* View Switcher in Modal */}
                <div className="inline-flex items-center p-0.5 rounded-lg bg-black/40 border border-cream/15 font-mono text-[11px]">
                  <button
                    type="button"
                    onClick={() => setViewMode("visual")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      viewMode === "visual"
                        ? "bg-lime text-navy font-bold"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    {language === "pt" ? "Visual" : "Visual"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("ascii")}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      viewMode === "ascii"
                        ? "bg-lime text-navy font-bold"
                        : "text-cream/70 hover:text-cream"
                    }`}
                  >
                    ASCII
                  </button>
                </div>

                {/* Pause/Play in Modal */}
                {viewMode === "visual" && (
                  <button
                    type="button"
                    onClick={() => setIsFlowing(!isFlowing)}
                    className={`p-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${
                      isFlowing
                        ? "border-lime/40 bg-lime/10 text-lime"
                        : "border-cream/20 bg-black/40 text-cream/60"
                    }`}
                    title={isFlowing ? "Pausar fluxo" : "Ativar fluxo"}
                  >
                    {isFlowing ? <Pause size={14} /> : <Play size={14} />}
                  </button>
                )}

                {/* Modal Mermaid Button */}
                {project.architecture?.mermaid && (
                  <button
                    type="button"
                    onClick={handleCopyMermaid}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-cream/30 font-mono text-[11px] tracking-wider uppercase text-cream/90 hover:bg-lavender hover:text-navy hover:border-lavender transition-all duration-200 cursor-pointer"
                    title={language === "pt" ? "Copiar Mermaid.js" : "Copy Mermaid.js"}
                  >
                    {mermaidCopyState === "copied" ? (
                      <Check size={12} className="text-lime" />
                    ) : mermaidCopyState === "failed" ? (
                      <AlertCircle size={12} className="text-orange" />
                    ) : (
                      <FileCode size={12} />
                    )}
                    <span className="hidden sm:inline">Mermaid</span>
                  </button>
                )}

                {/* Modal SVG Download Button */}
                <button
                  type="button"
                  onClick={handleDownloadSVG}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-cream/30 font-mono text-[11px] tracking-wider uppercase text-cream/90 hover:bg-blue hover:text-white hover:border-blue transition-all duration-200 cursor-pointer"
                  title={language === "pt" ? "Baixar SVG" : "Download SVG"}
                >
                  {downloadedSvg ? (
                    <Check size={12} className="text-lime" />
                  ) : (
                    <Download size={12} />
                  )}
                  <span className="hidden sm:inline">SVG</span>
                </button>

                {/* Copy Button in Modal */}
                <button
                  type="button"
                  onClick={onCopyDiagram}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-cream/30 font-mono text-xs tracking-wider uppercase text-cream/90 hover:bg-lime hover:text-navy hover:border-lime transition-all duration-200 cursor-pointer"
                  aria-label={copyLabel}
                >
                  {copiedId === project.id ? (
                    <>
                      <Check size={13} className="text-lime sm:text-navy" />
                      <span className="hidden sm:inline">{copiedLabel}</span>
                    </>
                  ) : copyFailed ? (
                    <>
                      <AlertCircle size={13} className="text-orange" />
                      <span className="hidden sm:inline">{copyFailedLabel}</span>
                    </>
                  ) : (
                    <>
                      <Copy size={13} />
                      <span className="hidden sm:inline">{copyLabel}</span>
                    </>
                  )}
                </button>

                {/* Close Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setIsFullscreen(false)}
                  className="p-2 rounded-full border border-cream/30 text-cream/90 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400 transition-all duration-200 cursor-pointer"
                  aria-label={language === "pt" ? "Fechar tela cheia (Esc)" : "Close fullscreen (Esc)"}
                  title="Esc"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Canvas */}
            <div className="p-4 sm:p-8 rounded-xl bg-black/75 border border-cream/15 shadow-inner overflow-x-auto overflow-y-auto flex-1 min-h-0">
              {viewMode === "visual" ? (
                <>
                  {renderVisualFlow()}

                  {/* Inspector inside Modal */}
                  {selectedNodeSpec && selectedNodeLabel && (
                    <div className="mt-4 p-4 rounded-xl bg-navy/95 border border-lime/40 shadow-xl backdrop-blur-md animate-in fade-in duration-200">
                      <div className="flex items-start justify-between gap-3 pb-2.5 border-b border-cream/15">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`p-2 rounded-lg ${
                              colorStyles[selectedNodeSpec.color].bg
                            } ${colorStyles[selectedNodeSpec.color].text}`}
                          >
                            <selectedNodeSpec.icon size={16} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h5 className="font-mono font-bold text-sm text-cream">{selectedNodeLabel}</h5>
                              <span
                                className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider rounded border ${
                                  colorStyles[selectedNodeSpec.color].badge
                                }`}
                              >
                                {selectedNodeSpec.badge || selectedNodeSpec.color}
                              </span>
                            </div>
                            <p className="font-mono text-[10px] text-cream/70">{selectedNodeSpec.protocol}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedNodeLabel(null)}
                          className="p-1 rounded-md text-cream/60 hover:text-cream hover:bg-cream/10"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 text-xs font-mono">
                        <div className="p-2.5 rounded-lg bg-black/40 border border-cream/10">
                          <p className="text-[10px] text-lime font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Info size={11} />
                            {language === "pt" ? "Papel Arquitetural" : "Architectural Role"}
                          </p>
                          <p className="text-cream/90 leading-relaxed text-[11px]">
                            {selectedNodeSpec.role[language]}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-black/40 border border-cream/10">
                          <p className="text-[10px] text-orange font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Workflow size={11} />
                            {language === "pt" ? "Trade-off & Decisão Técnica" : "Technical Trade-off"}
                          </p>
                          <p className="text-cream/90 leading-relaxed text-[11px]">
                            {selectedNodeSpec.tradeoff[language]}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <SemanticLegend
                    language={language}
                    activeLayer={activeLayer}
                    onToggleLayer={handleToggleLayer}
                  />
                </>
              ) : (
                <div className="relative group/ascii rounded-xl overflow-hidden border border-cream/15 bg-black/85 shadow-inner select-text">
                  <div
                    className={`pointer-events-none absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-black via-black/80 to-transparent transition-opacity duration-300 z-10 sm:hidden ${
                      canScrollRight ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <div
                    ref={modalAsciiRef}
                    onScroll={handleAsciiScroll}
                    className="p-4 sm:p-8 overflow-x-auto"
                  >
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
                  <div className="sm:hidden flex items-center justify-between px-3.5 py-1.5 bg-navy/90 border-t border-cream/10 text-[10px] font-mono text-lime/90">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-lime animate-pulse" />
                      <span>Terminal ASCII</span>
                    </span>
                    <span className="flex items-center gap-1 text-cream/70">
                      {canScrollRight ? (
                        <span className="text-lime animate-pulse flex items-center gap-1">
                          <span>{language === "pt" ? "Deslize para ver mais" : "Scroll to view more"}</span>
                          <span>➔</span>
                        </span>
                      ) : (
                        <span className="text-cream/50 flex items-center gap-1">
                          <span>{language === "pt" ? "Fim do diagrama" : "End of diagram"}</span>
                          <Check size={11} className="text-lime" />
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
