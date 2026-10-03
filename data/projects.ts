export type TileColor = "lime" | "blue" | "orange" | "lavender";

export type LocalizedString = {
  pt: string;
  en: string;
};

export type ProjectMetric = {
  label: LocalizedString;
  value: LocalizedString;
};

export type ProjectArchitecture = {
  title: LocalizedString;
  diagram: LocalizedString;
  mermaid?: LocalizedString;
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
        value: {
          pt: "94 testes · >90% cobertura (Jest)",
          en: "94 tests · >90% coverage (Jest)",
        },
      },
      {
        label: { pt: "Throughput & Carga", en: "Throughput & Load" },
        value: {
          pt: "1.400 req/s · latência p99 < 35ms",
          en: "1,400 req/s · p99 latency < 35ms",
        },
      },
      {
        label: { pt: "Resiliência Assíncrona", en: "Async Resilience" },
        value: {
          pt: "RabbitMQ Exchange + Dead-Letter Queue (DLQ)",
          en: "RabbitMQ Exchange + Dead-Letter Queue (DLQ)",
        },
      },
    ],
    architecture: {
      title: {
        pt: "Arquitetura Distribuída & Fluxo de Autenticação",
        en: "Distributed Architecture & Auth Flow",
      },
      diagram: {
        pt: `[Client / HTTP] ──> [API Gateway / Express] ──> [Redis Token Bucket / Rate Limit]
                              │
                              ├──> [Auth Service] ──> [PostgreSQL (Usuários & Roles)]
                              │           │
                              │           └──> [Redis Blacklist (Tokens Revogados)]
                              │
                              └──> [RabbitMQ Exchange] ──> [Fila / DLQ] ──> [Audit Consumer]`,
        en: `[Client / HTTP] ──> [API Gateway / Express] ──> [Redis Token Bucket / Rate Limit]
                              │
                              ├──> [Auth Service] ──> [PostgreSQL (Users & Roles)]
                              │           │
                              │           └──> [Redis Blacklist (Revoked Tokens)]
                              │
                              └──> [RabbitMQ Exchange] ──> [Queue / DLQ] ──> [Audit Consumer]`,
      },
      mermaid: {
        pt: `flowchart TD
    Client["Client / HTTP\\n(Apps Web & Mobile)"] --> Gateway["API Gateway (Express)\\n(Rate Limiter Token Bucket)"]
    Gateway -->|"Desacoplamento Assíncrono"| Auth["Auth Service\\n(MFA / TOTP & JWT RS256)"]
    Gateway -.->|"Eventos de Auditoria"| Broker["RabbitMQ Exchange\\n(Fanout / Direct)"]
    Auth --> PG[("PostgreSQL\\n(Usuários & Roles ACID)")]
    Auth --> Redis[("Redis Blacklist\\n(O(1) Revogação de Tokens)")]
    Broker --> DLQ["DLQ Queue\\n(Zero Perda de Eventos)"]
    Broker --> Audit["Audit Consumer\\n(Logging Assíncrono)"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class Gateway,Auth lime;
    class PG blue;
    class Redis,Broker,DLQ orange;
    class Audit lavender;
    class Client cream;`,
        en: `flowchart TD
    Client["Client / HTTP\\n(Web & Mobile Apps)"] --> Gateway["API Gateway (Express)\\n(Token Bucket Rate Limiter)"]
    Gateway -->|"Async Decoupling"| Auth["Auth Service\\n(MFA / TOTP & JWT RS256)"]
    Gateway -.->|"Audit Events"| Broker["RabbitMQ Exchange\\n(Fanout / Direct)"]
    Auth --> PG[("PostgreSQL\\n(Users & Roles ACID)")]
    Auth --> Redis[("Redis Blacklist\\n(O(1) Token Revocation)")]
    Broker --> DLQ["DLQ Queue\\n(Zero Event Loss)"]
    Broker --> Audit["Audit Consumer\\n(Async Logging)"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class Gateway,Auth lime;
    class PG blue;
    class Redis,Broker,DLQ orange;
    class Audit lavender;
    class Client cream;`,
      },
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
        value: {
          pt: "Latência sub-15ms · Similaridade de Cosseno",
          en: "Sub-15ms latency · Cosine Similarity",
        },
      },
      {
        label: { pt: "Embeddings Locais", en: "Local Embeddings" },
        value: {
          pt: "Modelo 384d · Chunking semântico estruturado",
          en: "384d model · Structured semantic chunking",
        },
      },
      {
        label: { pt: "Grounding Estrito", en: "Strict Grounding" },
        value: {
          pt: "Geração ancorada em contexto (Zero Alucinações)",
          en: "Context-grounded generation (Zero Hallucinations)",
        },
      },
    ],
    architecture: {
      title: {
        pt: "Pipeline RAG com Microsserviços e Busca Vetorial HNSW",
        en: "RAG Pipeline with Microservices & HNSW Vector Search",
      },
      diagram: {
        pt: `[User Query] ──> [FastAPI Gateway] ────────────────> [Semantic Router]
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
        en: `[User Query] ──> [FastAPI Gateway] ────────────────> [Semantic Router]
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
      },
      mermaid: {
        pt: `flowchart TD
    Query["User Query\\n(Busca em Linguagem Natural)"] --> Gateway["FastAPI Gateway\\n(Orquestrador Assíncrono)"]
    Gateway --> Router{"Semantic Router\\n(Classificação de Intenção)"}

    subgraph VectorBranch ["Ramo Vetorial (Semântico)"]
        Router -->|"Vetorização"| Embed["Local Embeddings (384d)\\n(FastEmbed / Zero Custo API)"]
        Embed --> PGVector[("PostgreSQL + pgvector\\n(Índice HNSW <15ms)")]
    end

    subgraph MetaBranch ["Ramo de Metadados & Filtros"]
        Router -->|"Filtros Estruturados"| NodeSearch["Node.js Search Service\\n(Tags & Órgãos)"]
        NodeSearch --> DocMeta[("Document Metadata\\n(Store JSONB)")]
    end

    PGVector --> Assembly["Context Assembly\\n(RRF Rerank & Deduplicação)"]
    DocMeta --> Assembly
    Assembly --> Gemini["Google Gemini AI Engine\\n(Geração Restrita / Grounding)"]
    Gemini --> Output["Resposta Fundamentada + Fontes Oficiais"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class Gateway,Embed,Output lime;
    class PGVector blue;
    class DocMeta orange;
    class Router,NodeSearch,Gemini lavender;
    class Query,Assembly cream;`,
        en: `flowchart TD
    Query["User Query\\n(Natural Language Query)"] --> Gateway["FastAPI Gateway\\n(Async Orchestrator)"]
    Gateway --> Router{"Semantic Router\\n(Intent Classification)"}

    subgraph VectorBranch ["Vector Branch (Semantic)"]
        Router -->|"Vector Path"| Embed["Local Embeddings (384d)\\n(FastEmbed / Zero API Cost)"]
        Embed --> PGVector[("PostgreSQL + pgvector\\n(HNSW Index <15ms)")]
    end

    subgraph MetaBranch ["Metadata & Filters Branch"]
        Router -->|"Filter Path"| NodeSearch["Node.js Search Service\\n(Tags & Agencies)"]
        NodeSearch --> DocMeta[("Document Metadata\\n(JSONB Store)")]
    end

    PGVector --> Assembly["Context Assembly\\n(RRF Rerank & Deduplication)"]
    DocMeta --> Assembly
    Assembly --> Gemini["Google Gemini AI Engine\\n(Constrained Generation / Grounding)"]
    Gemini --> Output["Grounded Response + Official Sources"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class Gateway,Embed,Output lime;
    class PGVector blue;
    class DocMeta orange;
    class Router,NodeSearch,Gemini lavender;
    class Query,Assembly cream;`,
      },
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
        value: {
          pt: "Transações ACID em PostgreSQL com ledger seguro",
          en: "ACID transactions in PostgreSQL with secure ledger",
        },
      },
      {
        label: { pt: "Auditoria com IA", en: "AI Auditing" },
        value: {
          pt: "Classificação preditiva e detecção de anomalias",
          en: "Predictive classification and anomaly detection",
        },
      },
    ],
    architecture: {
      title: {
        pt: "Fluxo Transacional ACID e Auditoria Assistida por IA",
        en: "ACID Transaction Flow & AI-Assisted Audit",
      },
      diagram: {
        pt: `[Client / HTTP] ──> [Express REST API] ──> [Validação Zod / JWT]
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
   [PostgreSQL (ACID Ledger)]       [Gemini AI Engine]
     (Balanços e Extratos)       (Auditoria e Anomalias)
                │                           │
                └─────────────┬─────────────┘
                              ▼
                 [Relatórios e Recomendações]`,
        en: `[Client / HTTP] ──> [Express REST API] ──> [Zod / JWT Validation]
                              │
                ┌─────────────┴─────────────┐
                ▼                           ▼
   [PostgreSQL (ACID Ledger)]       [Gemini AI Engine]
 (Balance Sheets & Statements)    (Auditing & Anomalies)
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    [Reports & Insights]`,
      },
      mermaid: {
        pt: `flowchart TD
    Client["Client / HTTP\\n(Requisições Financeiras)"] --> API["Express REST API\\n(Validação Zod + JWT)"]
    API --> Ledger[("PostgreSQL (ACID Ledger)\\n(Partidas Dobradas)")]
    API -.->|"Alimentação Assíncrona"| AI["Gemini AI Engine\\n(Detecção Preditiva de Anomalias)"]
    Ledger --> Reports["Relatórios & Recomendações\\n(Painel de Decisão Estratégica)"]
    AI --> Reports

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class API,Reports lime;
    class Ledger blue;
    class AI lavender;
    class Client cream;`,
        en: `flowchart TD
    Client["Client / HTTP\\n(Financial Requests)"] --> API["Express REST API\\n(Zod Schema & JWT)"]
    API --> Ledger[("PostgreSQL (ACID Ledger)\\n(Double-Entry Bookkeeping)")]
    API -.->|"Async Feed"| AI["Gemini AI Engine\\n(Predictive Anomaly Detection)"]
    Ledger --> Reports["Reports & Recommendations\\n(Strategic Decision Dashboard)"]
    AI --> Reports

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class API,Reports lime;
    class Ledger blue;
    class AI lavender;
    class Client cream;`,
      },
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
        value: {
          pt: "Consumo e normalização de dados do IBGE e Maps",
          en: "Consumption and normalization of IBGE & Maps data",
        },
      },
      {
        label: { pt: "Segurança de Acesso", en: "Access Security" },
        value: {
          pt: "Autenticação baseada em tokens JWT",
          en: "JWT token-based authentication",
        },
      },
    ],
    architecture: {
      title: {
        pt: "Agregação de Fontes Governamentais e Geolocalização",
        en: "Government Data Aggregation & Geolocation",
      },
      diagram: {
        pt: `[Client App] ───> [Express REST API] ───> [MongoDB / Mongoose]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
  [Google Maps Platform]        [IBGE Open Data API]
   (Geocoding & Places)       (Dados & Estatísticas)`,
        en: `[Client App] ───> [Express REST API] ───> [MongoDB / Mongoose]
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
  [Google Maps Platform]        [IBGE Open Data API]
   (Geocoding & Places)        (Data & Statistics)`,
      },
      mermaid: {
        pt: `flowchart TD
    Client["Client App\\n(Interface do Cidadão)"] --> API["Express REST API\\n(Controle & Autenticação JWT)"]
    API --> Mongo[("MongoDB / Mongoose\\n(Catálogo Centralizado)")]
    API -.-> Maps["Google Maps Platform\\n(Geocoding & Places API)"]
    API -.-> IBGE["IBGE Open Data API\\n(Dados Demográficos e Censitários)"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class API lime;
    class Mongo blue;
    class Maps orange;
    class IBGE lavender;
    class Client cream;`,
        en: `flowchart TD
    Client["Client App\\n(Citizen Interface)"] --> API["Express REST API\\n(Access Control & JWT Auth)"]
    API --> Mongo[("MongoDB / Mongoose\\n(Centralized Catalog)")]
    API -.-> Maps["Google Maps Platform\\n(Geocoding & Places API)"]
    API -.-> IBGE["IBGE Open Data API\\n(Demographic Data & Municipalities)"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class API lime;
    class Mongo blue;
    class Maps orange;
    class IBGE lavender;
    class Client cream;`,
      },
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
        value: {
          pt: "Busca geoespacial por raio de proximidade de postos",
          en: "Geospatial search by health unit proximity radius",
        },
      },
    ],
    architecture: {
      title: {
        pt: "Mapeamento Espacial e Roteamento de Unidades Públicas",
        en: "Spatial Mapping & Public Health Unit Routing",
      },
      diagram: {
        pt: `[Client] ──> [Node.js / Express API] ──> [MongoDB Geo Index (2dsphere)]
                        │
                        └──> [Google Maps Platform (Rotas & Geocoding)]`,
        en: `[Client] ──> [Node.js / Express API] ──> [MongoDB Geo Index (2dsphere)]
                        │
                        └──> [Google Maps Platform (Routing & Geocoding)]`,
      },
      mermaid: {
        pt: `flowchart TD
    Mobile["Client / Mobile\\n(Busca de Postos de Saúde)"] --> API["Node.js / Express API\\n(Processamento Geoespacial)"]
    API --> Mongo[("MongoDB (2dsphere)\\n(Cálculo de Distâncias Euclidianas)")]
    API -.-> Maps["Google Maps Platform\\n(Rotas até o Posto Mais Próximo)"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class API lime;
    class Mongo blue;
    class Maps orange;
    class Mobile cream;`,
        en: `flowchart TD
    Mobile["Client / Mobile\\n(Health Unit Search)"] --> API["Node.js / Express API\\n(Geospatial Processing)"]
    API --> Mongo[("MongoDB (2dsphere)\\n(Euclidean Distance Calculation)")]
    API -.-> Maps["Google Maps Platform\\n(Routes to Nearest Health Center)"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class API lime;
    class Mongo blue;
    class Maps orange;
    class Mobile cream;`,
      },
      highlights: [
        {
          pt: "Indexação geoespacial 2dsphere para cálculo veloz de distâncias euclidianas e rotas até a unidade de saúde mais próxima.",
          en: "MongoDB 2dsphere geospatial indexing for fast calculation of distance and routing to nearest health facilities.",
        },
      ],
    },
  },
];

