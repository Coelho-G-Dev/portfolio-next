export type TileColor = "lime" | "blue" | "orange" | "lavender";

export type LocalizedString = {
  pt: string;
  en: string;
};

export type ProjectMetric = {
  label: LocalizedString;
  value: string;
};

export type ProjectArchitecture = {
  title: LocalizedString;
  diagram: string;
  highlights: LocalizedString[];
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
  apiDocsLink?: string;
  apiDocsLabel?: LocalizedString;
  shapeColors: [TileColor, TileColor];
  metrics?: ProjectMetric[];
  architecture?: ProjectArchitecture;
};

export const projects: Project[] = [
  {
    id: 1,
    title: "AuthGuard",
    category: "backend",
    type: {
      pt: "Microsserviço de Identidade & RBAC",
      en: "Identity & RBAC Microservice",
    },
    year: "2026",
    description: {
      pt: "Microsserviço corporativo de autenticação e RBAC com suporte a MFA/TOTP, mensageria RabbitMQ com DLQ, rate limiting em Redis e observabilidade completa.",
      en: "Enterprise authentication and RBAC microservice with MFA/TOTP support, RabbitMQ messaging with DLQ, Redis rate limiting, and end-to-end observability.",
    },
    tags: ["Node.js", "TypeScript", "RabbitMQ", "Redis", "Docker", "PostgreSQL", "Jest"],
    githubLink: "https://github.com/Coelho-G-Dev/authguard",
    apiDocsLink: "https://github.com/Coelho-G-Dev/authguard#documenta%C3%A7%C3%A3o-da-api-swagger",
    apiDocsLabel: {
      pt: "Swagger Docs",
      en: "Swagger Docs",
    },
    shapeColors: ["lime", "orange"],
    metrics: [
      {
        label: { pt: "Cobertura & Testes", en: "Coverage & Tests" },
        value: "94 testes · >90% cobertura (Jest)",
      },
      {
        label: { pt: "Throughput & Carga", en: "Throughput & Load" },
        value: "1.400 req/s · latência p99 < 35ms",
      },
      {
        label: { pt: "Resiliência Assíncrona", en: "Async Resilience" },
        value: "RabbitMQ Exchange + Dead-Letter Queue (DLQ)",
      },
    ],
    architecture: {
      title: {
        pt: "Arquitetura Distribuída & Fluxo de Autenticação",
        en: "Distributed Architecture & Auth Flow",
      },
      diagram: `[Client / HTTP] ──> [API Gateway / Express] ──> [Redis Token Bucket / Rate Limit]
                              │
                              ├──> [Auth Service] ──> [PostgreSQL (Users & Roles)]
                              │           │
                              │           └──> [Redis Blacklist (Revoked Tokens)]
                              │
                              └──> [RabbitMQ Exchange] ──> [Queue / DLQ] ──> [Audit Consumer]`,
      highlights: [
        {
          pt: "Rate limiting distribuído com algoritmo Token Bucket em Redis para mitigação ativa de ataques de força bruta.",
          en: "Distributed rate limiting with Token Bucket algorithm in Redis for active mitigation of brute-force attacks.",
        },
        {
          pt: "Blacklist em Redis para revogação em tempo real de tokens JWT e invalidação instantânea de sessões comprometidas.",
          en: "Redis blacklist for real-time JWT revocation and immediate invalidation of compromised sessions.",
        },
        {
          pt: "Mensageria desacoplada via RabbitMQ com Dead-Letter Queue (DLQ) e política de retentativa para garantir tolerância a falhas.",
          en: "Decoupled messaging via RabbitMQ with Dead-Letter Queue (DLQ) and retry policy to ensure zero event loss.",
        },
      ],
    },
  },
  {
    id: 2,
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
    tags: ["Python", "FastAPI", "pgvector", "Gemini AI", "Docker", "TypeScript", "PostgreSQL"],
    githubLink: "https://github.com/Coelho-G-Dev/rag-servicos-publicos",
    apiDocsLink: "https://github.com/Coelho-G-Dev/rag-servicos-publicos#documenta%C3%A7%C3%A3o-da-api-swagger--redoc",
    apiDocsLabel: {
      pt: "FastAPI / OpenAPI",
      en: "FastAPI / OpenAPI",
    },
    shapeColors: ["lavender", "blue"],
    metrics: [
      {
        label: { pt: "Busca Vetorial HNSW", en: "HNSW Vector Search" },
        value: "Latência sub-15ms · Similaridade de Cosseno",
      },
      {
        label: { pt: "Embeddings Locais", en: "Local Embeddings" },
        value: "Modelo 384d · Chunking semântico estruturado",
      },
      {
        label: { pt: "Grounding Estrito", en: "Strict Grounding" },
        value: "Geração ancorada em contexto (Zero Alucinações)",
      },
    ],
    architecture: {
      title: {
        pt: "Pipeline RAG com Microsserviços e Busca Vetorial HNSW",
        en: "RAG Pipeline with Microservices & HNSW Vector Search",
      },
      diagram: `[User Query] ──> [FastAPI Gateway] ────────────────> [Semantic Router]
                        │                                   │
                        ▼                                   ▼
            [Local Embeddings (384d)]           [Node.js Search Service]
                        │                                   │
                        ▼                                   ▼
          [PostgreSQL + pgvector (HNSW)] ─────>    [Context Assembly]
                                                            │
                                                            ▼
                                                [Google Gemini AI Engine]
                                                            │
                                                            ▼
                                               [Grounded Answer + Sources]`,
      highlights: [
        {
          pt: "Busca vetorial por similaridade de cosseno com índice HNSW em sub-15ms sobre base com embeddings locais 384d.",
          en: "Cosine similarity vector search with HNSW index in sub-15ms over knowledge base with local 384d embeddings.",
        },
        {
          pt: "Microsserviços desacoplados (FastAPI para orquestração e embeddings, Node.js/TS para roteamento e metadados).",
          en: "Decoupled microservices (FastAPI for AI orchestration & embeddings, Node.js/TS for routing & metadata).",
        },
        {
          pt: "Constrained generation com Google Gemini: injeção de contexto estrito e checagem de fontes para eliminar alucinações.",
          en: "Constrained generation with Google Gemini: strict context injection and source citation preventing hallucinations.",
        },
      ],
    },
  },
  {
    id: 3,
    title: "API Financeira Inteligente",
    category: "ia",
    type: {
      pt: "API com IA & Auditoria",
      en: "AI-Audited Financial API",
    },
    year: "2025",
    description: {
      pt: "API RESTful de gestão financeira com auditoria automatizada, reconciliação de transações e geração de insights estratégicos via IA do Google Gemini.",
      en: "RESTful financial management API with automated auditing, transaction reconciliation, and strategic insights powered by Google Gemini AI.",
    },
    tags: ["Node.js", "PostgreSQL", "Gemini AI", "Jest", "TypeScript", "Docker"],
    githubLink: "https://github.com/Coelho-G-Dev/api-financeira-inteligente",
    apiDocsLink: "https://github.com/Coelho-G-Dev/api-financeira-inteligente#endpoints-e-documenta%C3%A7%C3%A3o",
    apiDocsLabel: {
      pt: "Postman / Docs",
      en: "Postman / Docs",
    },
    shapeColors: ["blue", "lavender"],
    metrics: [
      {
        label: { pt: "Consistência Contábil", en: "Ledger Consistency" },
        value: "Transações ACID em PostgreSQL com ledger seguro",
      },
      {
        label: { pt: "Auditoria com IA", en: "AI Auditing" },
        value: "Classificação preditiva e detecção de anomalias",
      },
    ],
    architecture: {
      title: {
        pt: "Fluxo Transacional ACID e Auditoria Assistida por IA",
        en: "ACID Transaction Flow & AI-Assisted Audit",
      },
      diagram: `[Client / HTTP] ──> [Express REST API] ──> [Validação Zod / JWT]
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
   [PostgreSQL (ACID Ledger)]       [Gemini AI Engine]
     (Balanços e Extratos)       (Auditoria e Anomalias)
                │                           │
                └─────────────┬─────────────┘
                              ▼
                 [Relatórios e Recomendações]`,
      highlights: [
        {
          pt: "Contratos de entrada estritamente tipados e validados em runtime com Zod.",
          en: "Strictly typed input contracts with runtime schema validation via Zod.",
        },
        {
          pt: "Processamento analítico automatizado com isolamento de dados sensíveis antes do envio à IA.",
          en: "Automated analytical processing with sensitive data sanitization before AI ingestion.",
        },
      ],
    },
  },
  {
    id: 4,
    title: "Guia Maranhão",
    category: "backend",
    type: {
      pt: "API de Serviços Públicos",
      en: "Public Services API",
    },
    year: "2024",
    description: {
      pt: "Projeto full-stack para centralizar o acesso a serviços públicos no Maranhão, integrando dados do IBGE e da Google Maps Platform.",
      en: "Full-stack project centralizing access to public services in Maranhão, integrating IBGE census data and Google Maps Platform.",
    },
    tags: ["Node.js", "Mongoose", "MongoDB", "JWT", "Express"],
    githubLink: "https://github.com/Coelho-G-Dev/Guia-Maranhao",
    apiDocsLink: "https://github.com/Coelho-G-Dev/Guia-Maranhao#rotas-e-documenta%C3%A7%C3%A3o",
    apiDocsLabel: {
      pt: "Docs da API",
      en: "API Docs",
    },
    shapeColors: ["lavender", "lime"],
    metrics: [
      {
        label: { pt: "Agregação de Dados", en: "Data Aggregation" },
        value: "Consumo e normalização de dados do IBGE e Maps",
      },
      {
        label: { pt: "Segurança de Acesso", en: "Access Security" },
        value: "Autenticação baseada em tokens JWT",
      },
    ],
    architecture: {
      title: {
        pt: "Agregação de Fontes Governamentais e Geolocalização",
        en: "Government Data Aggregation & Geolocation",
      },
      diagram: `[Client App] ───> [Express REST API] ───> [MongoDB / Mongoose]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
  [Google Maps Platform]        [IBGE Open Data API]
   (Geocoding & Places)       (Dados & Estatísticas)`,
      highlights: [
        {
          pt: "Normalização de esquemas heterogêneos de fontes governamentais em API RESTful consistente.",
          en: "Normalization of heterogeneous governmental data into a unified, consistent RESTful API.",
        },
      ],
    },
  },
  {
    id: 5,
    title: "BuscaSUS",
    category: "backend",
    type: {
      pt: "API de Operações & Saúde",
      en: "Health Operations API",
    },
    year: "2024",
    description: {
      pt: "Sistema back-end que integra dados públicos e a Google Maps Platform para disponibilizar informações geolocalizadas sobre saúde, cultura e educação.",
      en: "Back-end system integrating public data and Google Maps Platform to deliver geolocated information on health, culture, and education.",
    },
    tags: ["Node.js", "Express", "MongoDB", "Google Maps Platform"],
    githubLink: "https://github.com/Coelho-G-Dev/Desafio-05-Back-End",
    apiDocsLink: "https://github.com/Coelho-G-Dev/Desafio-05-Back-End#documenta%C3%A7%C3%A3o-dos-endpoints",
    apiDocsLabel: {
      pt: "Docs da API",
      en: "API Docs",
    },
    shapeColors: ["lime", "blue"],
    metrics: [
      {
        label: { pt: "Consultas Espaciais", en: "Spatial Queries" },
        value: "Busca geoespacial por raio de proximidade de postos",
      },
    ],
    architecture: {
      title: {
        pt: "Mapeamento Espacial e Roteamento de Unidades Públicas",
        en: "Spatial Mapping & Public Health Unit Routing",
      },
      diagram: `[Client] ──> [Node.js / Express API] ──> [MongoDB Geo Index (2dsphere)]
                        │
                        └──> [Google Maps Platform (Rotas & Geocoding)]`,
      highlights: [
        {
          pt: "Indexação geoespacial 2dsphere para cálculo veloz de distâncias euclidianas e rotas até a unidade de saúde mais próxima.",
          en: "MongoDB 2dsphere geospatial indexing for fast calculation of distance and routing to nearest health facilities.",
        },
      ],
    },
  },
];

