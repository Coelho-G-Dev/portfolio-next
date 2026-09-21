export type TileColor = "lime" | "blue" | "orange" | "lavender";

export type LocalizedString = {
  pt: string;
  en: string;
};

export type Project = {
  id: number;
  title: string;
  category: "backend" | "ia";
  type: LocalizedString;
  year: string;
  description: LocalizedString;
  tags: string[];
  githubLink: string;
  demoLink?: string;
  shapeColors: [TileColor, TileColor];
};

export const projects: Project[] = [
  {
    id: 1,
    title: "BuscaSUS",
    category: "backend",
    type: {
      pt: "API de operações",
      en: "Operations API",
    },
    year: "2024",
    description: {
      pt: "Sistema back-end que integra dados públicos e a Google Maps Platform para disponibilizar informações geolocalizadas sobre saúde, cultura e educação.",
      en: "Back-end system integrating public data and Google Maps Platform to deliver geolocated information on health, culture, and education.",
    },
    tags: ["Node.js", "Express", "MongoDB"],
    githubLink: "https://github.com/Coelho-G-Dev/Desafio-05-Back-End",
    shapeColors: ["lime", "blue"],
  },
  {
    id: 2,
    title: "Guia Maranhão",
    category: "backend",
    type: {
      pt: "API de serviços públicos",
      en: "Public Services API",
    },
    year: "2024",
    description: {
      pt: "Projeto full-stack para centralizar o acesso a serviços públicos no Maranhão, integrando dados do IBGE e da Google Maps Platform.",
      en: "Full-stack project centralizing access to public services in Maranhão, integrating IBGE census data and Google Maps Platform.",
    },
    tags: ["Node.js", "Mongoose", "JWT"],
    githubLink: "https://github.com/Coelho-G-Dev/Guia-Maranhao",
    shapeColors: ["lavender", "lime"],
  },
  {
    id: 3,
    title: "API Financeira Inteligente",
    category: "ia",
    type: {
      pt: "API com IA",
      en: "AI-Powered API",
    },
    year: "2025",
    description: {
      pt: "API RESTful de gestão financeira com auditoria automatizada e geração de insights via IA do Google Gemini.",
      en: "RESTful financial management API with automated auditing and AI insight generation powered by Google Gemini.",
    },
    tags: ["Node.js", "PostgreSQL", "Gemini AI", "Jest"],
    githubLink: "https://github.com/Coelho-G-Dev/api-financeira-inteligente",
    shapeColors: ["blue", "lavender"],
  },
  {
    id: 4,
    title: "AuthGuard",
    category: "backend",
    type: {
      pt: "Microsserviço de Identidade",
      en: "Identity Microservice",
    },
    year: "2026",
    description: {
      pt: "Microsserviço corporativo de autenticação e RBAC com suporte a MFA/TOTP, mensageria RabbitMQ com DLQ, rate limiting em Redis e observabilidade completa.",
      en: "Enterprise authentication and RBAC microservice with MFA/TOTP support, RabbitMQ messaging with DLQ, Redis rate limiting, and end-to-end observability.",
    },
    tags: ["Node.js", "TypeScript", "RabbitMQ", "Redis", "Docker"],
    githubLink: "https://github.com/Coelho-G-Dev/authguard",
    shapeColors: ["lime", "orange"],
  },
  {
    id: 5,
    title: "RAG Serviços Públicos",
    category: "ia",
    type: {
      pt: "Arquitetura RAG & Microsserviços",
      en: "RAG Architecture & Microservices",
    },
    year: "2026",
    description: {
      pt: "Sistema de busca semântica e respostas fundamentadas em microsserviços desacoplados (FastAPI + Node.js/TS), com embeddings locais, PostgreSQL/pgvector (HNSW) e geração restrita via Google Gemini.",
      en: "Semantic search and grounded QA across decoupled microservices (FastAPI + Node.js/TS), with local embeddings, PostgreSQL/pgvector (HNSW), and constrained generation with Google Gemini.",
    },
    tags: ["Python", "FastAPI", "pgvector", "Gemini AI", "Docker", "TypeScript"],
    githubLink: "https://github.com/Coelho-G-Dev/rag-servicos-publicos",
    shapeColors: ["lavender", "blue"],
  },
];
