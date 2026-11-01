import type { LocalizedString } from "./projects";

// Arquitetura de cada projeto no estilo xadrez (spec §5.6, opção C). Cada nó
// é uma peça numa casa de um tabuleiro 8×6 (a–h, 1–6). O fluxo anda da
// esquerda para a direita e de baixo para cima; as setas são em L.

export type Piece = "pawn" | "knight" | "bishop" | "rook" | "queen" | "king";

export type BoardNode = {
  id: string;
  label: LocalizedString;
  /** Chave de nodeSpecs: o detalhe (protocolo, papel, trade-off) do nó. */
  spec?: string;
  piece: Piece;
  /** Casa de "a1" a "h6". A linha 1 fica embaixo. */
  square: string;
  /** O nó cuja falha derrubaria o sistema. Um por tabuleiro. */
  critical?: boolean;
};

export type BoardEdge = { from: string; to: string; label?: LocalizedString; dashed?: boolean };

export type Board = { nodes: BoardNode[]; edges: BoardEdge[] };

// A mesma tabela peça ↔ papel em todos os projetos (spec §5.6).
export const PIECE_ROLE: Record<Piece, LocalizedString> = {
  pawn: { pt: "cliente", en: "client" },
  knight: { pt: "API ou entrada", en: "API or entry point" },
  bishop: { pt: "serviço interno", en: "internal service" },
  rook: { pt: "fila ou cache", en: "queue or cache" },
  queen: { pt: "serviço externo ou IA", en: "external service or AI" },
  king: { pt: "banco de dados", en: "database" },
};

const same = (s: string): LocalizedString => ({ pt: s, en: s });

export const boards: Record<number, Board> = {
  // Cidade Energia
  1: {
    nodes: [
      { id: "pwa", label: same("PWA"), spec: "PWA Next.js", piece: "pawn", square: "a1" },
      { id: "auth", label: same("Supabase Auth"), spec: "Supabase Auth", piece: "bishop", square: "a3" },
      { id: "proxy", label: same("proxy.ts"), spec: "proxy.ts", piece: "knight", square: "c1" },
      { id: "api", label: same("API + Zod"), spec: "API Routes + Zod", piece: "knight", square: "e1" },
      { id: "pg", label: same("Postgres (RLS)"), spec: "Supabase Postgres", piece: "king", square: "e3", critical: true },
      { id: "ranking", label: same("Rankings"), spec: "Pontos & Rankings", piece: "bishop", square: "e5" },
      { id: "tutor", label: { pt: "Tutor RAG", en: "RAG tutor" }, spec: "Tutor Energinho", piece: "bishop", square: "g3" },
      { id: "vector", label: same("pgvector"), spec: "pgvector", piece: "king", square: "g5" },
      { id: "gemini", label: same("Gemini"), spec: "Gemini API", piece: "queen", square: "h4" },
      { id: "nasa", label: same("NASA POWER"), spec: "NASA POWER", piece: "queen", square: "h1" },
    ],
    edges: [
      { from: "pwa", to: "auth", dashed: true, label: { pt: "login anônimo", en: "anonymous login" } },
      { from: "pwa", to: "proxy", label: same("Bearer") },
      { from: "proxy", to: "api" },
      { from: "api", to: "pg" },
      { from: "pg", to: "ranking" },
      { from: "api", to: "tutor" },
      { from: "tutor", to: "vector" },
      { from: "tutor", to: "gemini" },
      { from: "api", to: "nasa", dashed: true, label: { pt: "cache de 6 h", en: "6 h cache" } },
    ],
  },
  // AuthGuard
  2: {
    nodes: [
      { id: "client", label: { pt: "Cliente", en: "Client" }, spec: "Client / HTTP", piece: "pawn", square: "a1" },
      { id: "gateway", label: same("Gateway"), spec: "API Gateway (Express)", piece: "knight", square: "c3" },
      { id: "auth", label: same("Auth Service"), spec: "Auth Service", piece: "bishop", square: "c5" },
      { id: "redis", label: same("Redis"), spec: "Redis Blacklist", piece: "rook", square: "e6" },
      { id: "pg", label: same("PostgreSQL"), spec: "PostgreSQL", piece: "king", square: "g6" },
      { id: "broker", label: same("RabbitMQ"), spec: "RabbitMQ Exchange", piece: "rook", square: "e3", critical: true },
      { id: "dlq", label: same("DLQ"), spec: "DLQ Queue", piece: "rook", square: "g4" },
      { id: "audit", label: { pt: "Auditoria", en: "Audit worker" }, spec: "Audit Consumer", piece: "bishop", square: "g2" },
    ],
    edges: [
      { from: "client", to: "gateway" },
      { from: "gateway", to: "auth" },
      { from: "auth", to: "redis" },
      { from: "auth", to: "pg" },
      { from: "gateway", to: "broker", dashed: true, label: { pt: "eventos de auditoria", en: "audit events" } },
      { from: "broker", to: "audit" },
      { from: "broker", to: "dlq" },
    ],
  },
  // RAG Serviços Públicos
  3: {
    nodes: [
      { id: "query", label: { pt: "Pergunta", en: "Query" }, spec: "User Query", piece: "pawn", square: "a1" },
      { id: "gateway", label: same("FastAPI"), spec: "FastAPI Gateway", piece: "knight", square: "b1" },
      { id: "router", label: { pt: "Roteador", en: "Router" }, spec: "Semantic Router", piece: "bishop", square: "b3" },
      { id: "embed", label: same("Embeddings"), spec: "Local Embeddings (384d)", piece: "bishop", square: "d3" },
      { id: "pgvector", label: same("pgvector"), spec: "PostgreSQL + pgvector", piece: "king", square: "f3", critical: true },
      { id: "search", label: { pt: "Busca Node", en: "Node search" }, spec: "Node.js Search Service", piece: "bishop", square: "b5" },
      { id: "meta", label: { pt: "Metadados", en: "Metadata" }, spec: "Document Metadata", piece: "king", square: "d5" },
      { id: "assembly", label: { pt: "Contexto", en: "Context" }, spec: "Context Assembly", piece: "bishop", square: "f5" },
      { id: "gemini", label: same("Gemini"), spec: "Google Gemini AI Engine", piece: "queen", square: "h5" },
      { id: "answer", label: { pt: "Resposta", en: "Answer" }, spec: "Grounded Answer + Sources", piece: "pawn", square: "h6" },
    ],
    edges: [
      { from: "query", to: "gateway" },
      { from: "gateway", to: "router" },
      { from: "router", to: "embed" },
      { from: "embed", to: "pgvector" },
      { from: "router", to: "search" },
      { from: "search", to: "meta" },
      { from: "pgvector", to: "assembly" },
      { from: "meta", to: "assembly" },
      { from: "assembly", to: "gemini" },
      { from: "gemini", to: "answer" },
    ],
  },
  // API Financeira Inteligente
  4: {
    nodes: [
      { id: "client", label: { pt: "Cliente", en: "Client" }, spec: "Client / HTTP", piece: "pawn", square: "a2" },
      { id: "api", label: same("API Express"), spec: "Express REST API", piece: "knight", square: "c2" },
      { id: "ledger", label: same("Ledger ACID"), spec: "PostgreSQL (ACID Ledger)", piece: "king", square: "c5", critical: true },
      { id: "ai", label: same("Gemini"), spec: "Gemini AI Engine", piece: "queen", square: "f2" },
      { id: "reports", label: { pt: "Relatórios", en: "Reports" }, spec: "Relatórios & Recomendações", piece: "bishop", square: "f5" },
    ],
    edges: [
      { from: "client", to: "api" },
      { from: "api", to: "ledger" },
      { from: "api", to: "ai", dashed: true, label: { pt: "assíncrono", en: "async" } },
      { from: "ledger", to: "reports" },
      { from: "ai", to: "reports" },
    ],
  },
  // Guia Maranhão
  5: {
    nodes: [
      { id: "client", label: { pt: "Cliente", en: "Client" }, spec: "Client App", piece: "pawn", square: "a2" },
      { id: "api", label: same("API Express"), spec: "Express REST API", piece: "knight", square: "c2" },
      { id: "mongo", label: same("MongoDB"), spec: "MongoDB / Mongoose", piece: "king", square: "c5", critical: true },
      { id: "ibge", label: same("IBGE"), spec: "IBGE Open Data API", piece: "queen", square: "e4" },
      { id: "maps", label: same("Google Maps"), spec: "Google Maps Platform", piece: "queen", square: "g2" },
    ],
    edges: [
      { from: "client", to: "api" },
      { from: "api", to: "mongo" },
      { from: "api", to: "ibge", dashed: true },
      { from: "api", to: "maps", dashed: true },
    ],
  },
  // BuscaSUS
  6: {
    nodes: [
      { id: "client", label: { pt: "Cliente", en: "Client" }, spec: "Client / Mobile", piece: "pawn", square: "a2" },
      { id: "api", label: same("API Express"), spec: "Node.js / Express API", piece: "knight", square: "c2" },
      { id: "mongo", label: same("MongoDB 2dsphere"), spec: "MongoDB (2dsphere)", piece: "king", square: "c5", critical: true },
      { id: "maps", label: same("Google Maps"), spec: "Google Maps Platform", piece: "queen", square: "f2" },
    ],
    edges: [
      { from: "client", to: "api" },
      { from: "api", to: "mongo" },
      { from: "api", to: "maps", dashed: true },
    ],
  },
};
