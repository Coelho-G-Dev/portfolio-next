import type { ElementType } from "react";
import {
  Bot,
  Cpu,
  Database,
  Globe,
  Layers,
  MapPin,
  Network,
  Search,
  Server,
  Shield,
  Sparkles,
  Sun,
  Trophy,
  Workflow,
} from "lucide-react";

// Papel, protocolo e trade-off de cada nó das arquiteturas. Usado pelo
// ArchitectureVisualizer (site atual) e pelo tabuleiro do site novo.
export type NodeColor = "lime" | "blue" | "orange" | "lavender" | "cream";

export interface NodeSpec {
  icon: ElementType;
  color: NodeColor;
  protocol: string;
  badge?: string;
  role: { pt: string; en: string };
  tradeoff: { pt: string; en: string };
}

export const nodeSpecs: Record<string, NodeSpec> = {
  // Project 1 - Cidade Energia
  "PWA Next.js": {
    icon: Globe,
    color: "cream",
    protocol: "Next.js 16 · React 19 · PWA",
    badge: "Student App",
    role: {
      pt: "PWA usado pelos estudantes: simulador, trilhas com quiz, missões, mapa e o tutor Energinho.",
      en: "PWA used by students: simulator, lesson tracks with quizzes, missions, map, and the Energinho tutor.",
    },
    tradeoff: {
      pt: "Cliente único com um modo simulado que usa a mesma interface: o app inteiro roda sem backend, ideal para a demo do hackathon.",
      en: "Single client with a same-interface mock mode: the whole app runs without a backend, ideal for the hackathon demo.",
    },
  },
  "Supabase Auth": {
    icon: Shield,
    color: "lime",
    protocol: "Supabase Auth · JWT",
    badge: "Anonymous Login",
    role: {
      pt: "Login anônimo sem e-mail, telefone ou documento; o front envia o access_token como Bearer em cada chamada.",
      en: "Anonymous login with no email, phone, or ID; the front end sends the access_token as Bearer on every call.",
    },
    tradeoff: {
      pt: "Estudantes podem ser menores de idade: coletar só o primeiro nome reduz o risco de LGPD a quase zero.",
      en: "Students may be minors: collecting only the first name brings LGPD exposure close to zero.",
    },
  },
  "proxy.ts": {
    icon: Network,
    color: "lime",
    protocol: "Next.js Proxy · CORS",
    badge: "Edge Guard",
    role: {
      pt: "Camada única de CORS por lista de origens e respostas 404/405 padronizadas para todas as rotas /api.",
      en: "Single layer for allow-listed CORS and standardized 404/405 responses across every /api route.",
    },
    tradeoff: {
      pt: "Centralizar a borda evita que cada rota repita CORS e mantém o formato { erro: { codigo, mensagem } } em tudo.",
      en: "Centralizing the edge keeps routes free of CORS boilerplate and enforces the { erro: { codigo, mensagem } } shape everywhere.",
    },
  },
  "API Routes + Zod": {
    icon: Server,
    color: "lime",
    protocol: "Next.js App Router · Zod 4",
    badge: "REST API",
    role: {
      pt: "22 rotas que só validam com Zod, chamam regras puras em src/lib e respondem, documentadas em OpenAPI 3.1.",
      en: "22 routes that only validate with Zod, call pure rules in src/lib, and respond, documented with OpenAPI 3.1.",
    },
    tradeoff: {
      pt: "Regra de negócio em funções puras permite 302 testes rápidos, sem banco e sem APIs externas.",
      en: "Business rules as pure functions enable 302 fast tests with no database or external APIs.",
    },
  },
  "Supabase Postgres": {
    icon: Database,
    color: "blue",
    protocol: "PostgreSQL · Row Level Security",
    badge: "RLS",
    role: {
      pt: "Perfis, simulações, progresso e pontos com RLS ativada; funções SQL atômicas para pontos, trocas e limites.",
      en: "Profiles, simulations, progress, and points with RLS enabled; atomic SQL functions for points, swaps, and limits.",
    },
    tradeoff: {
      pt: "Limite de requisições no banco (hash do IP), pois cada chamada serverless pode cair numa instância diferente.",
      en: "Rate limiting lives in the database (hashed IP), since each serverless call may hit a different instance.",
    },
  },
  "Tutor Energinho": {
    icon: Bot,
    color: "lavender",
    protocol: "RAG · Similaridade ≥ 0,64",
    badge: "AI Tutor",
    role: {
      pt: "Responde só sobre energia e conta de luz, com base nas lições do app e na última simulação do estudante.",
      en: "Answers only about energy and electricity bills, grounded in the app's lessons and the student's last simulation.",
    },
    tradeoff: {
      pt: "Limiar calibrado com perguntas reais: puxa a lição certa sem trazer contexto para perguntas fora do tema.",
      en: "Threshold calibrated on real questions: retrieves the right lesson without pulling context for off-topic questions.",
    },
  },
  pgvector: {
    icon: Database,
    color: "blue",
    protocol: "pgvector · HNSW · 768d",
    badge: "Vector Store",
    role: {
      pt: "Trechos das lições indexados com gemini-embedding-2 (768 dimensões) e busca por similaridade de cosseno.",
      en: "Lesson chunks indexed with gemini-embedding-2 (768 dimensions) and cosine similarity search.",
    },
    tradeoff: {
      pt: "Vetores no mesmo Postgres do app: sem cluster vetorial dedicado e com RLS valendo também para o RAG.",
      en: "Vectors in the app's own Postgres: no dedicated vector cluster, with RLS covering RAG too.",
    },
  },
  "Gemini API": {
    icon: Sparkles,
    color: "lavender",
    protocol: "REST · Sem SDK",
    badge: "LLM",
    role: {
      pt: "Gera a resposta do tutor a partir dos trechos recuperados, com limite de 20 mensagens por hora por estudante.",
      en: "Generates the tutor's answer from retrieved chunks, capped at 20 messages per hour per student.",
    },
    tradeoff: {
      pt: "O nome do estudante nunca vai ao modelo e o texto das conversas não é gravado em banco nem em logs.",
      en: "The student's name never reaches the model, and conversation text is never stored in the database or logs.",
    },
  },
  "NASA POWER": {
    icon: Sun,
    color: "orange",
    protocol: "HTTPS · ALLSKY_SFC_SW_DWN",
    badge: "Open Data",
    role: {
      pt: "Irradiação solar diária e climatológica de São Luís para o simulador e o módulo Sol de hoje.",
      en: "Daily and climatological solar irradiance for São Luís, feeding the simulator and the Sun Today module.",
    },
    tradeoff: {
      pt: "Cache de 6 h (diário) e 30 dias (média anual), com valor de reserva se a NASA e o cache falharem.",
      en: "6h (daily) and 30-day (annual average) caching, with a fallback value if both NASA and cache fail.",
    },
  },
  "Pontos & Rankings": {
    icon: Trophy,
    color: "lime",
    protocol: "SQL Views · pontos_eventos",
    badge: "Gamification",
    role: {
      pt: "Pontos, conquistas e rankings de bairros e escolas calculados só no servidor, sem duplicidade.",
      en: "Points, achievements, and neighborhood and school rankings computed server-side only, with no duplicates.",
    },
    tradeoff: {
      pt: "Só quem entra pelo código da turma soma para a escola, impedindo que contas em massa inflem o ranking.",
      en: "Only students who join via class code count toward their school, preventing mass accounts from inflating rankings.",
    },
  },

  // Project 2 - AuthGuard
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
      en: "Reverse routing, TLS termination, and quota validation using the Token Bucket algorithm.",
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
      en: "Asymmetric RS256 keys enable microservices to validate tokens locally without hitting the central DB.",
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
      pt: "Exchanges Fanout e Direct separam quem publica de quem consome: um pico de tráfego vira fila, não erro.",
      en: "Fanout and Direct exchanges separate publishers from consumers: a traffic spike becomes a queue, not an error.",
    },
  },
  "DLQ Queue": {
    icon: Layers,
    color: "orange",
    protocol: "Dead Letter Exchange",
    badge: "Failed Messages",
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

  // Project 3 - RAG Serviços Públicos
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
      en: "Input sanitization against prompt injection before dispatching into the pipeline.",
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
      pt: "Asyncio com Starlette faz as chamadas de embeddings em paralelo, sem travar no I/O.",
      en: "Asyncio with Starlette runs embedding calls in parallel without blocking on I/O.",
    },
  },
  "Semantic Router": {
    icon: Workflow,
    color: "lavender",
    protocol: "Cosine Similarity Router",
    badge: "AI Routing",
    role: {
      pt: "Classificação prévia da intenção do usuário para rotear entre busca vetorial ou metadados diretos.",
      en: "Pre-classification of user intent to choose between vector search and direct metadata lookup.",
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
      pt: "Latência abaixo de 10 ms e nenhuma API externa de embeddings, portanto sem custo por chamada nesta etapa.",
      en: "Under 10 ms latency and no third-party embeddings API, so no per-call cost at this step.",
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
      pt: "Campos indexados em GIN no PostgreSQL viabilizam buscas por atributos arbitrários em menos de 1 ms.",
      en: "PostgreSQL GIN indexed fields enable arbitrary attribute queries in under 1ms.",
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
      en: "Caps prompt context to the top 5 relevant passages, minimizing token consumption and time-to-first-token.",
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
      pt: "System prompt com temperatura 0.1 e diretivas de grounding para responder só com o contexto recuperado.",
      en: "System prompt with 0.1 temperature and grounding directives to answer only from the retrieved context.",
    },
  },
  "Grounded Answer + Sources": {
    icon: Sparkles,
    color: "lime",
    protocol: "Streaming JSON",
    badge: "Output Ingress",
    role: {
      pt: "Entrega da resposta com citações e hyperlinks diretos para as fontes oficiais dos editais.",
      en: "Delivery of the synthesized response with inline citations and direct hyperlinks to official gazettes.",
    },
    tradeoff: {
      pt: "O cidadão pode abrir cada fonte citada e conferir a resposta no edital original.",
      en: "Citizens can open each cited source and check the answer against the original gazette.",
    },
  },

  // Project 4 - API Financeira Inteligente
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
      en: "Mathematically guarantees that the sum of debits and credits of any posting is always zero.",
    },
  },
  "Gemini AI Engine": {
    icon: Bot,
    color: "lavender",
    protocol: "Gemini API",
    badge: "Anomaly Engine",
    role: {
      pt: "Análise preditiva de fluxo de caixa e detecção de desvios fora do padrão em contas a pagar/receber.",
      en: "Predictive cash flow analysis and standard deviation anomaly detection in payables/receivables.",
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
      pt: "Geração automatizada de DRE, índices de liquidez e recomendações táticas de capital de giro.",
      en: "Automated P&L generation, liquidity ratios, and tactical working capital suggestions.",
    },
    tradeoff: {
      pt: "Cálculo baseado em visões materializadas atualizadas incrementalmente.",
      en: "Calculations derived from incrementally refreshed materialized views.",
    },
  },

  // Project 5 - Guia Maranhão
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

  // Project 6 - BuscaSUS
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
