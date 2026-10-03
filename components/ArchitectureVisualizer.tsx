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

interface NodeSpec {
  icon: React.ElementType;
  color: NodeColor;
  protocol: string;
  badge?: string;
  role: { pt: string; en: string };
  tradeoff: { pt: string; en: string };
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

const nodeSpecs: Record<string, NodeSpec> = {
  // Project 1 - AuthGuard
  "Client / HTTP": {
    icon: Globe,
    color: "cream",
    protocol: "HTTPS / TLS 1.3",
    badge: "Ingress",
    role: {
      pt: "Entrada unificada para aplicações web, mobile e microsserviços parceiros.",
      en: "Unified ingress point for web, mobile apps, and partner microservices.",
    },
    tradeoff: {
      pt: "TLS 1.3 obrigatório com HSTS e CORS estrito para mitigar man-in-the-middle e spoofing.",
      en: "Mandatory TLS 1.3 with HSTS and strict CORS to mitigate MITM and spoofing.",
    },
  },
  "API Gateway (Express)": {
    icon: Server,
    color: "lime",
    protocol: "Express.js · HTTP/2",
    badge: "Gateway",
    role: {
      pt: "Roteamento reverso, terminação TLS e validação de quota via algoritmo Token Bucket.",
      en: "Reverse routing, TLS termination, and quota validation using Token Bucket algorithm.",
    },
    tradeoff: {
      pt: "Gateway stateless em Node.js com Redis dedicado: latência sub-5ms e desacoplamento do core de autenticação.",
      en: "Stateless Node.js gateway with dedicated Redis: sub-5ms latency and core auth decoupling.",
    },
  },
  "Auth Service": {
    icon: Shield,
    color: "lime",
    protocol: "TypeScript · JWT (RS256)",
    badge: "Core Service",
    role: {
      pt: "Emissão de tokens JWT assimétricos, verificação MFA/TOTP e autorização baseada em RBAC.",
      en: "Asymmetric RS256 JWT issuance, MFA/TOTP verification, and RBAC authorization.",
    },
    tradeoff: {
      pt: "Chaves assimétricas RS256 permitem validação de tokens em microsserviços sem consultar o banco central.",
      en: "Asymmetric RS256 keys enable microservices to validate tokens locally without hitting central DB.",
    },
  },
  PostgreSQL: {
    icon: Database,
    color: "blue",
    protocol: "PostgreSQL Wire Protocol",
    badge: "ACID RDBMS",
    role: {
      pt: "Persistência transacional de identidades, credenciais hasheadas com Argon2id e papéis RBAC.",
      en: "Transactional persistence of identities, Argon2id hashed credentials, and RBAC roles.",
    },
    tradeoff: {
      pt: "Integridade referencial estrita e isolamento serializável onde inconsistência cadastral é inaceitável.",
      en: "Strict referential integrity and serializable isolation where data drift is unacceptable.",
    },
  },
  "Redis Blacklist": {
    icon: Cpu,
    color: "orange",
    protocol: "RESP (In-Memory)",
    badge: "Cache / O(1)",
    role: {
      pt: "Armazenamento volátil de tokens JWT invalidados com TTL alinhado à expiração original.",
      en: "Volatile storage for invalidated JWTs with TTL aligned to original token expiration.",
    },
    tradeoff: {
      pt: "Busca O(1) com latência <1ms, permitindo logout instantâneo sem onerar o banco relacional.",
      en: "O(1) lookups with <1ms latency, enabling instant revocation without relational DB strain.",
    },
  },
  "RabbitMQ Exchange": {
    icon: Workflow,
    color: "orange",
    protocol: "AMQP 0-9-1",
    badge: "Message Broker",
    role: {
      pt: "Distribuição assíncrona de eventos de auditoria e alertas de tentativas de intrusão.",
      en: "Asynchronous broadcast of audit events and intrusion attempt alerts.",
    },
    tradeoff: {
      pt: "Fanout e Direct exchanges garantem desacoplamento temporal e resiliência contra picos de tráfego.",
      en: "Fanout and Direct exchanges ensure temporal decoupling and resilience against traffic spikes.",
    },
  },
  "DLQ Queue": {
    icon: Layers,
    color: "orange",
    protocol: "Dead Letter Exchange",
    badge: "Resilience",
    role: {
      pt: "Fila de contenção para mensagens que excederam o limite de retentativas de processamento.",
      en: "Containment queue for messages exceeding maximum consumer retry thresholds.",
    },
    tradeoff: {
      pt: "Garante zero descarte de eventos críticos de segurança, viabilizando inspeção forense e reprocessamento.",
      en: "Guarantees zero loss of critical security telemetry, allowing forensic inspection and replay.",
    },
  },
  "Audit Consumer": {
    icon: Server,
    color: "lavender",
    protocol: "Worker Thread / Node.js",
    badge: "Worker",
    role: {
      pt: "Processamento e persistência de trilhas de auditoria regulatória em segundo plano.",
      en: "Background processing and persistence of regulatory audit trails.",
    },
    tradeoff: {
      pt: "Consumo desacoplado garante que a lentidão no storage de auditoria nunca degrade o login do usuário.",
      en: "Decoupled consumption ensures storage latency never degrades user-facing login SLAs.",
    },
  },

  // Project 2 - RAG Serviços Públicos
  "User Query": {
    icon: Search,
    color: "cream",
    protocol: "HTTPS / JSON Payload",
    badge: "Natural Language",
    role: {
      pt: "Submissão de dúvidas em linguagem natural sobre serviços públicos e editais.",
      en: "Submission of natural language inquiries regarding public services and notices.",
    },
    tradeoff: {
      pt: "Sanitização de entrada contra prompt injection antes do encaminhamento ao pipeline.",
      en: "Input sanitization against prompt injection before dispatching into pipeline.",
    },
  },
  "FastAPI Gateway": {
    icon: Server,
    color: "lime",
    protocol: "FastAPI · Python 3.12 (ASGI)",
    badge: "Orchestrator",
    role: {
      pt: "Orquestrador assíncrono de pipelines RAG com tipagem estrita via Pydantic V2.",
      en: "Asynchronous RAG pipeline orchestrator with strict Pydantic V2 validation.",
    },
    tradeoff: {
      pt: "Asyncio com Starlette oferece concorrência de I/O massiva para chamadas concorrentes de embeddings.",
      en: "Asyncio with Starlette delivers massive I/O concurrency for parallel embedding calls.",
    },
  },
  "Semantic Router": {
    icon: Workflow,
    color: "lavender",
    protocol: "Cosine Similarity Router",
    badge: "AI Routing",
    role: {
      pt: "Classificação prévia da intenção do usuário para rotear entre busca vetorial ou metadados diretos.",
      en: "Pre-classification of user intent to dispatch between vector search or direct metadata.",
    },
    tradeoff: {
      pt: "Evita execuções caras de LLM quando a consulta pode ser respondida por filtros tabulares estritos.",
      en: "Avoids expensive LLM invocations when inquiries can be answered by deterministic tabular filters.",
    },
  },
  "Local Embeddings (384d)": {
    icon: Cpu,
    color: "lime",
    protocol: "ONNX Runtime / FastEmbed",
    badge: "Zero Cost Embedding",
    role: {
      pt: "Vetorização local de consultas em espaços semânticos de 384 dimensões em CPU.",
      en: "Local CPU vectorization of queries into 384-dimensional semantic space.",
    },
    tradeoff: {
      pt: "Latência <10ms sem dependência de APIs externas de embeddings, garantindo soberania e zero custo.",
      en: "Sub-10ms latency with zero third-party API dependencies, ensuring sovereignty and zero recurring cost.",
    },
  },
  "PostgreSQL + pgvector": {
    icon: Database,
    color: "blue",
    protocol: "PostgreSQL + HNSW Index",
    badge: "Vector Store",
    role: {
      pt: "Busca por similaridade de cosseno acelerada por grafos HNSW sobre chunks documentais.",
      en: "Cosine similarity search accelerated by HNSW graph indexes over document chunks.",
    },
    tradeoff: {
      pt: "pgvector unifica dados relacionais e vetores no mesmo motor ACID, eliminando custos de clusters dedicados.",
      en: "pgvector unifies relational metadata and vectors in one ACID engine, eliminating separate vector cluster costs.",
    },
  },
  "Node.js Search Service": {
    icon: Server,
    color: "lavender",
    protocol: "REST API / Express",
    badge: "Filter Engine",
    role: {
      pt: "Execução de consultas determinísticas em metadados documentais (data, órgão emissor, tags).",
      en: "Execution of deterministic queries against document metadata (date, agency, tags).",
    },
    tradeoff: {
      pt: "Filtragem relacional híbrida pré-vetor reduz o espaço amostral da busca vetorial em até 90%.",
      en: "Hybrid pre-vector relational filtering reduces search sample space by up to 90%.",
    },
  },
  "Document Metadata": {
    icon: Layers,
    color: "orange",
    protocol: "JSONB Indexed Store",
    badge: "Metadata DB",
    role: {
      pt: "Armazenamento estruturado de fontes oficiais, números de portarias e órgãos responsáveis.",
      en: "Structured storage of official sources, gazette numbers, and responsible agencies.",
    },
    tradeoff: {
      pt: "Campos indexados em GIN no PostgreSQL viabilizam buscas por atributos arbitrários em sub-milissegundos.",
      en: "PostgreSQL GIN indexed fields enable arbitrary attribute queries in sub-milliseconds.",
    },
  },
  "Context Assembly": {
    icon: Layers,
    color: "cream",
    protocol: "Reciprocal Rank Fusion (RRF)",
    badge: "Fusion Engine",
    role: {
      pt: "Deduplicação de chunks recuperados, rerank e montagem da janela de contexto para o modelo.",
      en: "Deduplication of retrieved chunks, rerank, and context window assembly for the model.",
    },
    tradeoff: {
      pt: "Limita o prompt aos 5 trechos mais relevantes, minimizando tokens consumidos e tempo de inferência.",
      en: "Caps prompt context to top 5 relevant passages, minimizing token consumption and time-to-first-token.",
    },
  },
  "Google Gemini AI Engine": {
    icon: Bot,
    color: "lavender",
    protocol: "gRPC / Gemini 1.5 Flash",
    badge: "Foundation Model",
    role: {
      pt: "Geração de resposta sintética ancorada estritamente nos chunks fornecidos no contexto.",
      en: "Generation of grounded synthetic responses strictly bound to retrieved context chunks.",
    },
    tradeoff: {
      pt: "System prompt com temperatura 0.1 e diretivas de 'grounding' eliminam alucinações técnicas.",
      en: "System prompt with 0.1 temperature and strict grounding directives eliminates technical hallucinations.",
    },
  },
  "Grounded Answer + Sources": {
    icon: Sparkles,
    color: "lime",
    protocol: "Streaming JSON",
    badge: "Output Ingress",
    role: {
      pt: "Entrega da resposta com citações e hyperlinks diretos para as fontes oficiais dos editais.",
      en: "Delivery of synthesised response with inline citations and direct hyperlinks to official gazettes.",
    },
    tradeoff: {
      pt: "Permite auditoria imediata pelo cidadão, elevando a confiabilidade do serviço público digital.",
      en: "Enables immediate auditing by citizens, increasing digital public service trustworthiness.",
    },
  },

  // Project 3 - API Financeira Inteligente
  "Express REST API": {
    icon: Server,
    color: "lime",
    protocol: "Node.js / Express · Zod",
    badge: "REST Ingress",
    role: {
      pt: "Recepção de lançamentos financeiros com validação de payload em tempo de execução via Zod.",
      en: "Reception of financial postings with runtime payload schema validation via Zod.",
    },
    tradeoff: {
      pt: "Fail-fast na borda: requisições com dados contábeis inválidos são rejeitadas antes de tocar no banco.",
      en: "Edge fail-fast: requests with invalid ledger math are rejected before touching persistence.",
    },
  },
  "PostgreSQL (ACID Ledger)": {
    icon: Database,
    color: "blue",
    protocol: "PostgreSQL / Prisma",
    badge: "Double-Entry Ledger",
    role: {
      pt: "Livro-razão contábil com partidas dobradas (débito/crédito) em transações com isolamento Serializable.",
      en: "Double-entry bookkeeping ledger (debit/credit) with Serializable transaction isolation.",
    },
    tradeoff: {
      pt: "Garante matematicamente que a soma de débitos e créditos de qualquer lançamento seja sempre zero.",
      en: "Mathematically guarantees that the sum of debits and credits of any posting is perpetually zero.",
    },
  },
  "Gemini AI Engine": {
    icon: Bot,
    color: "lavender",
    protocol: "Gemini API",
    badge: "Anomaly Engine",
    role: {
      pt: "Análise preditiva de fluxo de caixa e detecção de desvios padrão em contas a pagar/receber.",
      en: "Predictive cashflow analysis and standard deviation anomaly detection in payables/receivables.",
    },
    tradeoff: {
      pt: "Execução assíncrona desacoplada do fechamento de caixa, não bloqueando a emissão de notas fiscais.",
      en: "Asynchronous execution decoupled from ledger commits, never blocking receipt generation.",
    },
  },
  "Relatórios & Recomendações": {
    icon: Sparkles,
    color: "lime",
    protocol: "Analytics Dashboard",
    badge: "Executive Insights",
    role: {
      pt: "Geração de DRE automatizado, índices de liquidez e recomendações táticas de capital de giro.",
      en: "Automated P&L generation, liquidity ratios, and tactical working capital suggestions.",
    },
    tradeoff: {
      pt: "Cálculo baseado em visões materializadas atualizadas incrementalmente.",
      en: "Calculations derived from incrementally refreshed materialized views.",
    },
  },

  // Project 4 - Guia Maranhão
  "Client App": {
    icon: Globe,
    color: "cream",
    protocol: "Next.js / Responsive PWA",
    badge: "Client PWA",
    role: {
      pt: "Interface responsiva para consulta a atrativos turísticos, rotas e dados de municípios maranhenses.",
      en: "Responsive client for querying tourism hubs, routes, and municipal data across Maranhão.",
    },
    tradeoff: {
      pt: "Server-side rendering (SSR) para SEO de atrativos turísticos e carregamento instantâneo em 3G.",
      en: "Server-side rendering (SSR) for tourism SEO and fast first-contentful paint over 3G.",
    },
  },
  "MongoDB / Mongoose": {
    icon: Database,
    color: "blue",
    protocol: "MongoDB WiredTiger",
    badge: "Document DB",
    role: {
      pt: "Catálogo documental com esquemas flexíveis para diferentes categorias de atrativos e serviços.",
      en: "Document catalog with flexible schemas accommodating varied attraction and service types.",
    },
    tradeoff: {
      pt: "Modelo documental acomoda dados heterogêneos de turismo (hotéis, trilhas, artesanato) sem migrações rígidas.",
      en: "Document model handles heterogeneous tourism data (hotels, trails, crafts) without rigid migrations.",
    },
  },
  "Google Maps Platform": {
    icon: MapPin,
    color: "orange",
    protocol: "Places & Geocoding API",
    badge: "Geo Platform",
    role: {
      pt: "Conversão de endereços em coordenadas geográficas e cálculo de rotas rodoviárias e urbanas.",
      en: "Address-to-coordinate geocoding and calculation of roadway and urban navigational routes.",
    },
    tradeoff: {
      pt: "Cache local de coordenadas frequentemente consultadas para otimizar custos de consumo de API.",
      en: "Local cache of frequently resolved coordinates to optimize external API consumption costs.",
    },
  },
  "IBGE Open Data API": {
    icon: Layers,
    color: "lavender",
    protocol: "HTTPS / REST",
    badge: "Open Data",
    role: {
      pt: "Ingestão automatizada de dados demográficos, malha territorial e censitária do Maranhão.",
      en: "Automated ingestion of demographic, territorial boundary, and census data for Maranhão.",
    },
    tradeoff: {
      pt: "Sincronização agendada via cron com fallback para dados em cache local se a API pública oscilar.",
      en: "Scheduled cron sync with local fallback cache to protect against public API downtimes.",
    },
  },

  // Project 5 - BuscaSUS
  "Client / Mobile": {
    icon: Globe,
    color: "cream",
    protocol: "React Native / PWA",
    badge: "Mobile Ingress",
    role: {
      pt: "Interface mobile leve para localização emergencial de unidades básicas e UPAs do SUS.",
      en: "Lightweight mobile UI for emergency discovery of SUS health centers and triage clinics.",
    },
    tradeoff: {
      pt: "Geolocalização em segundo plano via GPS nativo com suporte a modo offline para postos salvos.",
      en: "Native GPS background location with offline support for previously accessed health units.",
    },
  },
  "Node.js / Express API": {
    icon: Server,
    color: "lime",
    protocol: "Express.js · REST",
    badge: "Geo API",
    role: {
      pt: "Filtragem geoespacial e cálculo de matriz de distância entre o usuário e postos disponíveis.",
      en: "Geospatial filtering and distance matrix calculation between user and active facilities.",
    },
    tradeoff: {
      pt: "Streaming de respostas e paginação por cursor para garantir carregamento em menos de 200ms.",
      en: "Response streaming and cursor pagination ensuring response times under 200ms.",
    },
  },
  "MongoDB (2dsphere)": {
    icon: Database,
    color: "blue",
    protocol: "MongoDB 2dsphere Index",
    badge: "Spatial DB",
    role: {
      pt: "Consultas geoespaciais com operador $nearSphere sobre coordenadas WGS84 de unidades de saúde.",
      en: "Geospatial queries with $nearSphere operator over WGS84 coordinates of healthcare units.",
    },
    tradeoff: {
      pt: "Índice 2dsphere projeta coordenadas na superfície esférica da Terra para precisão métrica real.",
      en: "2dsphere index calculates points across Earth's spherical surface for true metric precision.",
    },
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
      label: { pt: "Clientes & Ingress", en: "Clients & Requesters" },
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
  const title = project.architecture?.title[language] || project.title;
  const projectTitle = project.title;

  let content = "";
  if (project.id === 1) {
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
  } else if (project.id === 2) {
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
  } else if (project.id === 3) {
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
  } else if (project.id === 4) {
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
  onCopyDiagram,
  copyLabel,
  copiedLabel,
}: Props) {
  const [viewMode, setViewMode] = useState<"visual" | "ascii">("visual");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFlowing, setIsFlowing] = useState(true);
  const [activeLayer, setActiveLayer] = useState<NodeColor | null>(null);
  const [selectedNodeLabel, setSelectedNodeLabel] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copiedMermaid, setCopiedMermaid] = useState(false);
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
    try {
      await navigator.clipboard.writeText("```mermaid\n" + mermaidCode + "\n```");
      setCopiedMermaid(true);
      setTimeout(() => setCopiedMermaid(false), 2500);
    } catch {
      // fallback
    }
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
      case 1: // AuthGuard
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

      case 2: // RAG Serviços Públicos
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

      case 3: // API Financeira Inteligente
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

      case 4: // Guia Maranhão
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

      case 5: // BuscaSUS
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
              {copiedMermaid ? (
                <>
                  <Check size={13} className="text-lime sm:text-navy" />
                  <span className="hidden md:inline">{language === "pt" ? "Mermaid Copiado!" : "Mermaid Copied!"}</span>
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
          {/* Opção 06: Right fade gradient when scrollable on mobile */}
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

          {/* Opção 06: Mobile Scroll Indicator Bar */}
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
                    {copiedMermaid ? (
                      <Check size={12} className="text-lime" />
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
