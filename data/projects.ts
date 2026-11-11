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

// Portas do capítulo de projetos do site novo (spec §5.5). Um projeto pode
// estar em mais de uma porta e mostra, em cada uma, a faceta daquela área.
import type { Door } from "./doors";

export type FacetLink = "github" | "frontend" | "demo" | "docs";

export type FacetScreen = {
  src: string;
  alt: LocalizedString;
};

export type Facet = {
  line: LocalizedString;
  stack: string[];
  metrics?: ProjectMetric[];
  links: FacetLink[];
  screens?: FacetScreen[];
};

export type Project = {
  id: number;
  title: string;
  doors?: Door[];
  facets?: Partial<Record<Door, Facet>>;
  type: LocalizedString;
  year: string;
  description: LocalizedString;
  tags: string[];
  githubLink: string;
  frontendLink?: string;
  award?: LocalizedString;
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
    title: "Cidade Energia",
    doors: ["backend", "frontend", "ia"],
    facets: {
      frontend: {
        line: {
          pt: "PWA em Next.js 16 e React 19: simulador solar, trilhas com quiz, missões, mapa e o tutor Energinho. Um modo simulado com a mesma interface roda o app inteiro sem back-end.",
          en: "Next.js 16 and React 19 PWA: solar simulator, quiz tracks, missions, map and the Energinho tutor. A mock mode with the same interface runs the whole app without a back-end.",
        },
        stack: ["Next.js 16", "React 19", "TypeScript", "PWA", "Vitest"],
        metrics: [
          {
            label: { pt: "Testes", en: "Tests" },
            value: { pt: "133 testes no PWA", en: "133 tests in the PWA" },
          },
          {
            label: { pt: "Cliente e modo simulado", en: "Client and mock mode" },
            value: {
              pt: "Next.js 16 · React 19 · modo simulado sem back-end",
              en: "Next.js 16 · React 19 · backend-free mock mode",
            },
          },
          {
            label: { pt: "Jornada completa", en: "Full journey" },
            value: {
              pt: "Simulador solar · trilhas com quiz · mapa · tutor",
              en: "Solar simulator · quiz tracks · map · tutor",
            },
          },
        ],
        links: ["frontend", "demo"],
        screens: [
          {
            src: "/projects/cidade-energia-1.webp",
            alt: {
              pt: "Tela inicial do Cidade Energia no celular: título, três benefícios e o botão Começar.",
              en: "Cidade Energia home screen on a phone: title, three benefits and the Começar (Start) button.",
            },
          },
          {
            src: "/projects/cidade-energia-2.webp",
            alt: {
              pt: "Tela de entrada com os campos de nome, bairro e código da turma.",
              en: "Sign-in screen with fields for name, neighborhood and class code.",
            },
          },
        ],
      },
      backend: {
        line: {
          pt: "API serverless em Next.js e Supabase: 22 rotas validadas com Zod, regras em funções puras, RLS em todas as tabelas e pontos calculados só no servidor.",
          en: "Serverless API on Next.js and Supabase: 22 routes validated with Zod, rules as pure functions, RLS on every table and points computed server-side only.",
        },
        stack: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "Zod", "Vitest", "OpenAPI 3.1"],
        metrics: [
          {
            label: { pt: "Testes da API", en: "API tests" },
            value: { pt: "302 testes Vitest", en: "302 Vitest tests" },
          },
          {
            label: { pt: "Segurança de dados", en: "Data security" },
            value: {
              pt: "RLS em 100% das tabelas · pontos só no servidor",
              en: "RLS on 100% of tables · server-only scoring",
            },
          },
        ],
        links: ["github", "docs"],
      },
      ia: {
        line: {
          pt: "Tutor Energinho: RAG com Gemini e pgvector, limiar calibrado com perguntas reais e respostas só sobre energia e conta de luz.",
          en: "Energinho tutor: RAG with Gemini and pgvector, a threshold calibrated on real questions and answers only about energy and the power bill.",
        },
        stack: ["Gemini", "pgvector", "PostgreSQL", "TypeScript"],
        metrics: [
          {
            label: { pt: "Tutor RAG", en: "RAG tutor" },
            value: {
              pt: "Embeddings 768d · HNSW · limiar calibrado",
              en: "768d embeddings · HNSW · calibrated threshold",
            },
          },
        ],
        links: ["github"],
      },
    },
    type: {
      pt: "App Educacional Full-Stack & Tutor RAG",
      en: "Full-Stack Educational App & RAG Tutor",
    },
    year: "2026",
    award: {
      pt: "Campeão · Hackathon Equatorial 2026",
      en: "Winner · Equatorial Hackathon 2026",
    },
    description: {
      pt: "Projeto campeão do Hackathon Equatorial (Desafio 9): transforma a conta de luz na primeira aula de energia de estudantes de escolas públicas de São Luís. API em Next.js + Supabase com RLS, simulador solar com dados da NASA POWER, pontuação calculada só no servidor e tutor com RAG (Gemini + pgvector), consumida por um PWA.",
      en: "Winning project of the Equatorial Hackathon (Challenge 9): turns the electricity bill into the first energy lesson for public school students in São Luís. Next.js + Supabase API with RLS, solar simulator fed by NASA POWER data, server-side scoring, and a RAG tutor (Gemini + pgvector), consumed by a PWA.",
    },
    tags: ["Next.js", "TypeScript", "Supabase", "PostgreSQL", "pgvector", "Gemini AI", "Zod", "Vitest", "PWA"],
    githubLink: "https://github.com/Coelho-G-Dev/Cidade-Energia-Back-End",
    frontendLink: "https://github.com/Coelho-G-Dev/Cidade-Energia-Front-End",
    demoLink: "https://cidade-energia.vercel.app",
    apiDocsLink: "https://cidade-energia-back-end.vercel.app/api/docs",
    apiDocsLabel: {
      pt: "Swagger Docs",
      en: "Swagger Docs",
    },
    shapeColors: ["lime", "lavender"],
    metrics: [
      {
        label: { pt: "Cobertura & Testes", en: "Coverage & Tests" },
        value: {
          pt: "435 testes Vitest (302 API · 133 PWA)",
          en: "435 Vitest tests (302 API · 133 PWA)",
        },
      },
      {
        label: { pt: "Tutor RAG", en: "RAG Tutor" },
        value: {
          pt: "Embeddings 768d · HNSW · limiar calibrado",
          en: "768d embeddings · HNSW · calibrated threshold",
        },
      },
      {
        label: { pt: "Segurança de Dados", en: "Data Security" },
        value: {
          pt: "RLS em 100% das tabelas · pontos só no servidor",
          en: "RLS on 100% of tables · server-only scoring",
        },
      },
    ],
    architecture: {
      title: {
        pt: "API Serverless com RLS, Gamificação e Tutor RAG",
        en: "Serverless API with RLS, Gamification & RAG Tutor",
      },
      diagram: {
        pt: `[PWA Next.js (Estudante)] ──> [Supabase Auth (Login Anônimo)]
              │
              └── Bearer token ──> [proxy.ts (CORS · 404 · 405)] ──> [API Routes + Zod]
                                                                         │
                     ┌───────────────────────────┬───────────────────────┤
                     ▼                           ▼                       ▼
     [Supabase Postgres (RLS)]        [Tutor Energinho (RAG)]      [NASA POWER]
      (Pontos · Rankings · Views)       │                         (Irradiação · Cache 6h)
                     │                  ├──> [pgvector (HNSW 768d)]
                     │                  └──> [Gemini API]
                     ▼
     [Pontos & Rankings (Views Agregadas)]`,
        en: `[PWA Next.js (Student)] ──> [Supabase Auth (Anonymous Login)]
              │
              └── Bearer token ──> [proxy.ts (CORS · 404 · 405)] ──> [API Routes + Zod]
                                                                         │
                     ┌───────────────────────────┬───────────────────────┤
                     ▼                           ▼                       ▼
     [Supabase Postgres (RLS)]        [Energinho Tutor (RAG)]      [NASA POWER]
      (Points · Rankings · Views)       │                         (Irradiance · 6h Cache)
                     │                  ├──> [pgvector (HNSW 768d)]
                     │                  └──> [Gemini API]
                     ▼
     [Points & Rankings (Aggregated Views)]`,
      },
      mermaid: {
        pt: `flowchart TD
    PWA["PWA Next.js\\n(Estudante · Login Anônimo)"] -.->|"signInAnonymously"| Auth["Supabase Auth\\n(Sem e-mail · Só primeiro nome)"]
    PWA -->|"Bearer token"| Proxy["proxy.ts\\n(CORS · 404 · 405)"]
    Proxy --> Routes["API Routes + Zod\\n(Next.js App Router)"]
    Routes --> PG[("Supabase Postgres\\n(RLS em todas as tabelas)")]
    Routes --> Tutor["Tutor Energinho\\n(RAG · Limiar 0,64)"]
    Routes -.->|"Cache 6h / 30 dias"| NASA["NASA POWER\\n(Irradiação de São Luís)"]
    Tutor --> Vector[("pgvector\\n(HNSW · 768d)")]
    Tutor --> Gemini["Gemini API\\n(Resposta ancorada nas lições)"]
    PG --> Ranking["Pontos & Rankings\\n(Views agregadas · Sem dados individuais)"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class Proxy,Routes,Auth,Ranking lime;
    class PG,Vector blue;
    class NASA orange;
    class Tutor,Gemini lavender;
    class PWA cream;`,
        en: `flowchart TD
    PWA["PWA Next.js\\n(Student · Anonymous Login)"] -.->|"signInAnonymously"| Auth["Supabase Auth\\n(No email · First name only)"]
    PWA -->|"Bearer token"| Proxy["proxy.ts\\n(CORS · 404 · 405)"]
    Proxy --> Routes["API Routes + Zod\\n(Next.js App Router)"]
    Routes --> PG[("Supabase Postgres\\n(RLS on every table)")]
    Routes --> Tutor["Energinho Tutor\\n(RAG · 0.64 Threshold)"]
    Routes -.->|"6h / 30-day cache"| NASA["NASA POWER\\n(São Luís Irradiance)"]
    Tutor --> Vector[("pgvector\\n(HNSW · 768d)")]
    Tutor --> Gemini["Gemini API\\n(Lesson-grounded answers)"]
    PG --> Ranking["Points & Rankings\\n(Aggregated views · No individual data)"]

    classDef lime fill:#1a2e1f,stroke:#EAF35B,stroke-width:1.5px,color:#EAF35B;
    classDef blue fill:#101d36,stroke:#2E53E5,stroke-width:1.5px,color:#93c5fd;
    classDef orange fill:#2e1815,stroke:#E97C67,stroke-width:1.5px,color:#E97C67;
    classDef lavender fill:#221533,stroke:#B997FF,stroke-width:1.5px,color:#B997FF;
    classDef cream fill:#242220,stroke:#F2EADC,stroke-width:1.5px,color:#F2EADC;

    class Proxy,Routes,Auth,Ranking lime;
    class PG,Vector blue;
    class NASA orange;
    class Tutor,Gemini lavender;
    class PWA cream;`,
      },
      highlights: [
        {
          pt: "Privacidade de menores por design: login anônimo, só o primeiro nome, RLS em todas as tabelas e rankings saídos de views agregadas com mínimo de 3 participantes.",
          en: "Privacy-by-design for minors: anonymous login, first name only, RLS on every table, and rankings from aggregated views with a 3-participant minimum.",
        },
        {
          pt: "Pontos só no servidor: cálculo no back-end, tabela pontos_eventos única por (perfil, origem, referência) e lições concluídas na ordem.",
          en: "Points on the server only: computed in the back end, a pontos_eventos table unique per (profile, source, reference), and lessons completed in order.",
        },
        {
          pt: "Tutor Energinho com RAG (Gemini + pgvector HNSW), limiar de similaridade calibrado com perguntas reais e, se a NASA POWER cair, cache e um valor de reserva.",
          en: "Energinho tutor with RAG (Gemini + pgvector HNSW), similarity threshold calibrated on real questions, and a cache plus a default value when NASA POWER is down.",
        },
      ],
    },
  },
  {
    id: 2,
    title: "AuthGuard",
    doors: ["backend"],
    facets: {
      backend: {
        line: {
          pt: "Identidade e permissões com 1.400 req/s, p99 abaixo de 35ms e nenhuma mensagem perdida.",
          en: "Identity and permissions at 1,400 req/s, p99 under 35ms, and no message lost.",
        },
        stack: ["Node.js", "TypeScript", "RabbitMQ", "Redis", "PostgreSQL", "Docker", "Jest"],
        links: ["github", "docs"],
      },
    },
    type: {
      pt: "Microsserviço de Identidade & RBAC",
      en: "Identity & RBAC Microservice",
    },
    year: "2026",
    description: {
      pt: "Microsserviço de autenticação e RBAC com MFA/TOTP, mensageria RabbitMQ com DLQ, limite de taxa em Redis e observabilidade.",
      en: "Authentication and RBAC microservice with MFA/TOTP, RabbitMQ messaging with a DLQ, Redis rate limiting and observability.",
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
        label: { pt: "Mensageria assíncrona", en: "Async messaging" },
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
    Auth --> Redis[("Redis Blacklist\\n(Revogação de Tokens em O(1))")]
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
    id: 3,
    title: "RAG Serviços Públicos",
    doors: ["ia", "backend"],
    facets: {
      ia: {
        line: {
          pt: "Respostas sobre serviços públicos que citam a fonte, com busca vetorial HNSW.",
          en: "Answers about public services that cite their source, with HNSW vector search.",
        },
        stack: ["Python", "FastAPI", "pgvector", "Gemini AI"],
        links: ["github", "docs"],
      },
      backend: {
        line: {
          pt: "Microsserviços desacoplados: FastAPI orquestra o RAG e um serviço Node.js filtra metadados, com os vetores no mesmo PostgreSQL.",
          en: "Decoupled microservices: FastAPI orchestrates the RAG and a Node.js service filters metadata, with the vectors in the same PostgreSQL.",
        },
        stack: ["FastAPI", "Node.js", "TypeScript", "PostgreSQL", "pgvector", "Docker"],
        links: ["github", "docs"],
      },
    },
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
          pt: "Resposta só com o contexto recuperado, com as fontes citadas",
          en: "Answers from the retrieved context only, with sources cited",
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
          pt: "Geração com Google Gemini restrita ao contexto recuperado, com checagem das fontes citadas.",
          en: "Generation with Google Gemini restricted to the retrieved context, with a check of the cited sources.",
        },
      ],
    },
  },
  {
    id: 4,
    title: "API Financeira Inteligente",
    doors: ["ia", "backend"],
    facets: {
      ia: {
        line: {
          pt: "Auditoria assistida por IA: o Gemini aponta anomalias fora do caminho do lançamento, sem atrasar nenhuma transação.",
          en: "AI-assisted auditing: Gemini flags anomalies off the posting path, without delaying any transaction.",
        },
        stack: ["Gemini AI", "Node.js", "TypeScript"],
        links: ["github", "docs"],
      },
      backend: {
        line: {
          pt: "Transações ACID num ledger seguro, com auditoria assistida por IA.",
          en: "ACID transactions on a secure ledger, with AI-assisted auditing.",
        },
        stack: ["Node.js", "TypeScript", "PostgreSQL", "Docker", "Jest"],
        links: ["github", "docs"],
      },
    },
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
    id: 5,
    title: "Guia Maranhão",
    doors: ["backend"],
    facets: {
      backend: {
        line: {
          pt: "Junta fontes do governo num só lugar, com geolocalização.",
          en: "Brings government sources into one place, with geolocation.",
        },
        stack: ["Node.js", "Express", "MongoDB", "Mongoose", "JWT"],
        links: ["github", "docs"],
      },
    },
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
          en: "Normalization of heterogeneous government data into a unified, consistent RESTful API.",
        },
      ],
    },
  },
  {
    id: 6,
    title: "BuscaSUS",
    doors: ["backend", "frontend"],
    facets: {
      frontend: {
        line: {
          pt: "Interface geoespacial mobile-first: busca de postos de saúde por raio de proximidade, cálculo de rotas em tempo real com o Google Maps e estimativa de tempo até o atendimento.",
          en: "Mobile-first geospatial interface: public health facility search by proximity radius, real-time routing with Google Maps, and estimated transit times.",
        },
        stack: ["React", "TypeScript", "Google Maps Platform"],
        metrics: [
          {
            label: { pt: "Busca por Raio", en: "Radius Search" },
            value: {
              pt: "Geolocalização instantânea do usuário com cálculo de rotas",
              en: "Instant user geolocation with turn-by-turn routing",
            },
          },
          {
            label: { pt: "Interface Mobile-First", en: "Mobile-First UI" },
            value: {
              pt: "Navegação tátil acessível para emergências e postos de saúde",
              en: "Accessible touch navigation for public health clinics",
            },
          },
        ],
        links: ["frontend", "github"],
        screens: [
          {
            src: "/projects/buscasus-1.webp",
            alt: {
              pt: "Página inicial do BuscaSUS no celular: título, texto de apresentação e os botões Consultar unidades e Jogar agora.",
              en: "BuscaSUS home page on a phone: title, intro text and the Consultar unidades (Search units) and Jogar agora (Play now) buttons.",
            },
          },
          {
            src: "/projects/buscasus-2.webp",
            alt: {
              pt: "Janela de login com campos de e-mail e senha e botões para entrar com Google ou GitHub.",
              en: "Login window with email and password fields and buttons to sign in with Google or GitHub.",
            },
          },
        ],
      },
      backend: {
        line: {
          pt: "Encontra a unidade de saúde pública mais próxima e traça a rota.",
          en: "Finds the nearest public health unit and maps the route.",
        },
        stack: ["Node.js", "Express", "MongoDB", "Google Maps Platform"],
        links: ["github", "docs"],
      },
    },
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
    frontendLink: "https://github.com/Coelho-G-Dev/Busca-Sus/tree/main/frontend",
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
          pt: "Indexação geoespacial 2dsphere para cálculo rápido de distâncias geodésicas e rotas até a unidade de saúde mais próxima.",
          en: "MongoDB 2dsphere geospatial indexing for fast distance calculation and routing to the nearest health facilities.",
        },
      ],
    },
  },
];

