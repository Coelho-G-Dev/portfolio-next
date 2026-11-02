import type { Locale } from "./translations";
import type { FlowEvent, ServiceId } from "@/lib/messageFlow";

type ProjectCopy = { disciplines: string; line: string };

const pt = {
  nav: {
    work: "Projetos",
    contact: "Contato",
    langSwitch: "EN",
    langSwitchAria: "Mudar idioma para inglês",
    layersAria: "Camadas da página",
  },
  layers: { surface: "Superfície", api: "API", queue: "Fila", db: "Banco" },
  hero: {
    titleSr: "Gabriel Coelho, desenvolvedor back-end",
    sentence: "Desenvolvedor back-end. Construo APIs e filas que não perdem uma mensagem.",
    fact: "Campeão do Hackathon Equatorial 2026 · 435 testes no projeto vencedor",
    status: "São Luís, MA · disponível para vagas e projetos freelance",
    cta: "Ver projetos",
    photoAlt: "Gabriel Coelho diante de uma parede de azulejos azuis e brancos",
  },
  breakService: {
    title: "Derrube um serviço",
    sentence:
      "Uma mensagem desce da interface até o banco. Desligue qualquer peça no caminho e veja o que acontece com ela.",
    send: "Enviar mensagem",
    replay: "Reprocessar DLQ",
    reset: "Recomeçar",
    up: "no ar",
    down: "fora do ar",
    toggleAria: (name: string, up: boolean) => `${name}: ${up ? "no ar, desligar" : "fora do ar, religar"}`,
    interface: "Interface",
    services: { api: "API", queue: "Fila", worker: "Worker", db: "Banco" } as Record<ServiceId, string>,
    dlq: "DLQ",
    sent: "Enviadas",
    delivered: "Entregues",
    lost: "Perdidas",
    logTitle: "O que aconteceu",
    emptyLog: "Envie uma mensagem para começar.",
    note: "Simulação do fluxo do AuthGuard (RabbitMQ + Dead-Letter Queue).",
    noteLink: "Ver o código",
    event: (e: FlowEvent): string => {
      switch (e.kind) {
        case "sent": return `Mensagem #${e.id} enviada.`;
        case "waitingApi": return `API fora do ar. Mensagem #${e.id} aguardando para reenviar.`;
        case "outbox": return `Fila fora do ar. Mensagem #${e.id} guardada no outbox da API.`;
        case "waitingWorker": return `Worker fora do ar. Mensagem #${e.id} aguardando na fila.`;
        case "retry": return `Banco fora do ar. Tentativa ${e.attempt} de ${e.max} para a mensagem #${e.id}.`;
        case "toDlq": return `Tentativas esgotadas. Mensagem #${e.id} movida para a DLQ.`;
        case "replayed": return `Mensagem #${e.id} reprocessada da DLQ.`;
        case "delivered": return `Mensagem #${e.id} gravada no banco.`;
      }
    },
  },
  work: {
    title: "Sistemas que construí",
    code: "Código",
    frontend: "Front-end",
    demo: "Demo",
    docs: "Documentação da API",
    winner: "Campeão · Hackathon Equatorial 2026",
    photoAlt: "Premiação do Desafio 9, Cidade Energia, no Hackathon Equatorial",
    diagramLabel: (title: string) => `Diagrama de arquitetura do ${title}`,
    projects: {
      "Cidade Energia": {
        disciplines: "RAG · PWA · Supabase",
        line: "Campeão do Hackathon Equatorial: a conta de luz vira a primeira aula de energia em escolas públicas de São Luís.",
      },
      AuthGuard: {
        disciplines: "Autenticação · RabbitMQ",
        line: "Identidade e permissões com 1.400 req/s, p99 abaixo de 35ms e nenhuma mensagem perdida.",
      },
      "RAG Serviços Públicos": {
        disciplines: "RAG · FastAPI · pgvector",
        line: "Respostas sobre serviços públicos que citam a fonte, com busca vetorial HNSW.",
      },
      "API Financeira Inteligente": {
        disciplines: "ACID · IA · Auditoria",
        line: "Transações ACID num ledger seguro, com auditoria assistida por IA.",
      },
      "Guia Maranhão": {
        disciplines: "Dados públicos · Geo",
        line: "Junta fontes do governo num só lugar, com geolocalização.",
      },
      BuscaSUS: {
        disciplines: "Geoespacial · Saúde",
        line: "Encontra a unidade de saúde pública mais próxima e traça a rota.",
      },
    } as Record<string, ProjectCopy>,
  },
  how: {
    title: "Como eu trabalho",
    steps: [
      {
        lead: "Antes do código,",
        body: "entendo o domínio, o negócio e o que precisa continuar funcionando quando der errado.",
        evidence: "contract",
      },
      {
        lead: "No desenho,",
        body: "transformo regras em contratos de API, dados bem modelados e serviços fáceis de evoluir.",
        evidence: "diagram",
      },
      {
        lead: "Durante a construção,",
        body: "teste vem junto: 435 no Cidade Energia, 94 com mais de 90% de cobertura no AuthGuard.",
        evidence: "tests",
      },
      {
        lead: "Depois da entrega,",
        body: "fica a documentação: Swagger publicado e decisões escritas para quem vier depois.",
        evidence: "docs",
      },
    ],
    tests: [
      { value: "435", label: "testes Vitest no Cidade Energia" },
      { value: "94", label: "testes Jest no AuthGuard" },
      { value: ">90%", label: "de cobertura no AuthGuard" },
    ],
    docsLink: "Abrir o Swagger do Cidade Energia",
    contractCaption: "Trecho do contrato OpenAPI 3.1 do Cidade Energia, uma das 21 rotas documentadas.",
    diagramCaption: "Arquitetura do AuthGuard: autenticação, fila e Dead-Letter Queue.",
    docsCaption: "Documentação pública da API do Cidade Energia, no ar desde a entrega.",
  },
  services: {
    title: "O que eu resolvo",
    head: { problem: "Problema", delivery: "O que entrego", stack: "Stack", proof: "Prova" },
    rows: [
      { problem: "Sua API fica lenta ou cai no pico", delivery: "Filas, cache e limite de taxa", stack: "Node, Redis, RabbitMQ", proof: "AuthGuard" },
      { problem: "Quero uma IA que responda com os meus documentos", delivery: "RAG com fontes citadas", stack: "Python, FastAPI, pgvector", proof: "RAG Serviços Públicos" },
      { problem: "Preciso de um MVP que aguente crescer", delivery: "API documentada, auth, banco e testes", stack: "Next.js, Supabase, Postgres", proof: "Cidade Energia" },
      { problem: "Login e permissões feitos direito", delivery: "Autenticação, RBAC e auditoria", stack: "Node, JWT, Postgres", proof: "AuthGuard" },
      { problem: "Meus sistemas não conversam", delivery: "Integrações, webhooks e filas", stack: "Node, RabbitMQ", proof: "Guia Maranhão" },
    ],
    roles: "Para vagas: aberto a posições júnior e pleno, remoto ou em São Luís.",
  },
  about: {
    title: "Sobre mim",
    portraits: [
      {
        src: "/photos/web/retrato-espelho.webp",
        alt: "Gabriel Coelho de camisa branca, diante de azulejos azuis",
        name: "Gabriel Coelho",
        role: "Back-end · Ciência e Tecnologia, UFMA",
        text: "Vim da logística, onde aprendi que pacote perdido é cliente perdido. Hoje construo sistemas com a mesma regra.",
      },
      {
        src: "/photos/web/palco-cidade-energia.webp",
        alt: "Gabriel no palco do Hackathon Equatorial, diante da tela do Desafio 9, Cidade Energia",
        name: "Hackathon Equatorial 2026",
        role: "Campeão do Desafio 9",
        text: "Transformamos a conta de luz na primeira aula de energia de escolas públicas de São Luís.",
      },
      {
        src: "/photos/web/equipe-hackathon.webp",
        alt: "Gabriel com duas pessoas da equipe diante do painel do hackathon",
        name: "Equipe Cidade Energia",
        role: "API, RAG e PWA",
        text: "Trabalho bem em time: contratos claros entre front e back deixam todo mundo andar ao mesmo tempo.",
      },
      {
        src: "/photos/web/retrato-fora-da-tela.webp",
        alt: "Gabriel Coelho em retrato no espelho",
        name: "Fora da tela",
        role: "Powerlifting e xadrez",
        text: "Carga se aumenta aos poucos, com técnica. E pensar jogadas à frente é o mesmo exercício de desenhar um sistema que vai crescer.",
      },
    ],
    stackTitle: "Bancada de trabalho & Stack",
    stackLead: "As ferramentas que uso para construir sistemas que não caem e não perdem mensagens.",
    stackCategories: [
      {
        name: "Back-end & Arquitetura",
        items: [
          { name: "Node.js", note: "APIs assíncronas de alta concorrência" },
          { name: "TypeScript", note: "Tipagem estrita e contratos de ponta a ponta" },
          { name: "Python / FastAPI", note: "RAG, IA e microsserviços assíncronos" },
          { name: "Java / Spring Boot", note: "Arquitetura empresarial em camadas" },
        ],
      },
      {
        name: "Mensageria & Resiliência",
        items: [
          { name: "RabbitMQ", note: "Filas duráveis, DLQ e tolerância a falhas" },
          { name: "Redis", note: "Cache distribuído e rate limiting" },
          { name: "Outbox Pattern", note: "Garantia de entrega sem perdas" },
        ],
      },
      {
        name: "Bancos & Vetores (IA)",
        items: [
          { name: "PostgreSQL", note: "Modelagem relacional e integridade ACID" },
          { name: "pgvector", note: "Busca semântica e embeddings para RAG" },
          { name: "Supabase", note: "BaaS, Auth e Row Level Security (RLS)" },
          { name: "Prisma", note: "ORM tipado e migrações seguras" },
        ],
      },
      {
        name: "DevOps & Testes",
        items: [
          { name: "Docker & Compose", note: "Ambientes isolados e reprodutíveis" },
          { name: "Vitest & Playwright", note: "TDD, testes unitários e validação E2E" },
          { name: "Linux & CI/CD", note: "Pipelines automatizados e deploy contínuo" },
        ],
      },
    ],
    tilesTitle: "Meu ano em azulejos",
    tilesText: (total: number) =>
      `Cada azulejo é uma semana de commits no GitHub: quanto mais cheio, mais código. ${total} contribuições nos últimos doze meses.`,
    tilesAria: (week: string, count: number) => `Semana de ${week}: ${count} contribuições`,
    tilesFallback: "O painel aparece quando o GitHub responde.",
  },
  contact: {
    title: "Vamos conversar",
    location: "São Luís, MA · UTC−3",
    reply: "Respondo em até 2 dias úteis",
    kindLegend: "Sobre o que você quer falar?",
    kinds: { role: "É uma vaga", project: "É um projeto" },
    write: "Escrever",
    subject: { role: "Vaga: ", project: "Projeto freelance: " },
    body: {
      role: "Olá, Gabriel.\n\nSobre a vaga:\nEmpresa:\nModelo (remoto/presencial):\n",
      project: "Olá, Gabriel.\n\nO que preciso construir:\nPrazo:\nOrçamento aproximado:\n",
    },
  },
  footer: {
    title: "Tem um sistema para construir?",
    cta: "Escrever para mim",
    rights: "© 2026 Gabriel Coelho",
    built: "Feito com Next.js",
    preview: "Prévia do redesign · não indexada",
  },
};

const en: typeof pt = {
  nav: {
    work: "Work",
    contact: "Contact",
    langSwitch: "PT",
    langSwitchAria: "Switch language to Portuguese",
    layersAria: "Page layers",
  },
  layers: { surface: "Surface", api: "API", queue: "Queue", db: "Database" },
  hero: {
    titleSr: "Gabriel Coelho, back-end developer",
    sentence: "Back-end developer. I build APIs and queues that never drop a message.",
    fact: "Winner, Equatorial Hackathon 2026 · 435 tests in the winning project",
    status: "São Luís, Brazil · open to roles and freelance projects",
    cta: "See the work",
    photoAlt: "Gabriel Coelho in front of a wall of blue and white tiles",
  },
  breakService: {
    title: "Take a service down",
    sentence:
      "A message travels from the interface down to the database. Switch off any piece on the way and watch what happens to it.",
    send: "Send a message",
    replay: "Replay DLQ",
    reset: "Start over",
    up: "up",
    down: "down",
    toggleAria: (name: string, up: boolean) => `${name}: ${up ? "up, switch off" : "down, switch on"}`,
    interface: "Interface",
    services: { api: "API", queue: "Queue", worker: "Worker", db: "Database" },
    dlq: "DLQ",
    sent: "Sent",
    delivered: "Delivered",
    lost: "Lost",
    logTitle: "What happened",
    emptyLog: "Send a message to begin.",
    note: "A simulation of AuthGuard's flow (RabbitMQ + Dead-Letter Queue).",
    noteLink: "See the code",
    event: (e: FlowEvent): string => {
      switch (e.kind) {
        case "sent": return `Message #${e.id} sent.`;
        case "waitingApi": return `API down. Message #${e.id} waiting to resend.`;
        case "outbox": return `Queue down. Message #${e.id} kept in the API outbox.`;
        case "waitingWorker": return `Worker down. Message #${e.id} waiting in the queue.`;
        case "retry": return `Database down. Attempt ${e.attempt} of ${e.max} for message #${e.id}.`;
        case "toDlq": return `Attempts exhausted. Message #${e.id} moved to the DLQ.`;
        case "replayed": return `Message #${e.id} replayed from the DLQ.`;
        case "delivered": return `Message #${e.id} written to the database.`;
      }
    },
  },
  work: {
    title: "Systems I built",
    code: "Code",
    frontend: "Front-end",
    demo: "Demo",
    docs: "API docs",
    winner: "Winner · Equatorial Hackathon 2026",
    photoAlt: "Award for Challenge 9, Cidade Energia, at the Equatorial Hackathon",
    diagramLabel: (title: string) => `Architecture diagram of ${title}`,
    projects: {
      "Cidade Energia": {
        disciplines: "RAG · PWA · Supabase",
        line: "Equatorial Hackathon winner: the electricity bill becomes the first energy lesson in São Luís public schools.",
      },
      AuthGuard: {
        disciplines: "Auth · RabbitMQ",
        line: "Identity and permissions at 1,400 req/s, p99 under 35ms, and no message lost.",
      },
      "RAG Serviços Públicos": {
        disciplines: "RAG · FastAPI · pgvector",
        line: "Answers about public services that cite their source, with HNSW vector search.",
      },
      "API Financeira Inteligente": {
        disciplines: "ACID · AI · Audit",
        line: "ACID transactions on a secure ledger, with AI-assisted auditing.",
      },
      "Guia Maranhão": {
        disciplines: "Public data · Geo",
        line: "Brings government sources into one place, with geolocation.",
      },
      BuscaSUS: {
        disciplines: "Geospatial · Health",
        line: "Finds the nearest public health unit and maps the route.",
      },
    },
  },
  how: {
    title: "How I work",
    steps: [
      {
        lead: "Before any code,",
        body: "I learn the domain, the business, and what must keep working when things go wrong.",
        evidence: "contract",
      },
      {
        lead: "In the design,",
        body: "I turn rules into API contracts, well-modelled data and services that are easy to change.",
        evidence: "diagram",
      },
      {
        lead: "While building,",
        body: "tests come along: 435 in Cidade Energia, 94 with over 90% coverage in AuthGuard.",
        evidence: "tests",
      },
      {
        lead: "After delivery,",
        body: "the documentation stays: published Swagger and written decisions for whoever comes next.",
        evidence: "docs",
      },
    ],
    tests: [
      { value: "435", label: "Vitest tests in Cidade Energia" },
      { value: "94", label: "Jest tests in AuthGuard" },
      { value: ">90%", label: "coverage in AuthGuard" },
    ],
    docsLink: "Open the Cidade Energia Swagger",
    contractCaption: "Excerpt from the Cidade Energia OpenAPI 3.1 contract, one of 21 documented routes.",
    diagramCaption: "AuthGuard's architecture: authentication, queue and Dead-Letter Queue.",
    docsCaption: "Public API documentation for Cidade Energia, live since delivery.",
  },
  services: {
    title: "What I can fix for you",
    head: { problem: "Problem", delivery: "What I deliver", stack: "Stack", proof: "Proof" },
    rows: [
      { problem: "Your API slows down or falls over at peak", delivery: "Queues, caching and rate limits", stack: "Node, Redis, RabbitMQ", proof: "AuthGuard" },
      { problem: "I want an AI that answers from my documents", delivery: "RAG with cited sources", stack: "Python, FastAPI, pgvector", proof: "RAG Serviços Públicos" },
      { problem: "I need an MVP that can grow", delivery: "Documented API, auth, database and tests", stack: "Next.js, Supabase, Postgres", proof: "Cidade Energia" },
      { problem: "Login and permissions done right", delivery: "Authentication, RBAC and auditing", stack: "Node, JWT, Postgres", proof: "AuthGuard" },
      { problem: "My systems don't talk to each other", delivery: "Integrations, webhooks and queues", stack: "Node, RabbitMQ", proof: "Guia Maranhão" },
    ],
    roles: "For roles: open to junior and mid-level positions, remote or in São Luís.",
  },
  about: {
    title: "About me",
    portraits: [
      {
        src: "/photos/web/retrato-espelho.webp",
        alt: "Gabriel Coelho in a white shirt, in front of blue tiles",
        name: "Gabriel Coelho",
        role: "Back-end · Science and Technology, UFMA",
        text: "I came from logistics, where a lost parcel is a lost customer. I build systems by the same rule.",
      },
      {
        src: "/photos/web/palco-cidade-energia.webp",
        alt: "Gabriel on stage at the Equatorial Hackathon, in front of the Challenge 9 Cidade Energia screen",
        name: "Equatorial Hackathon 2026",
        role: "Winner of Challenge 9",
        text: "We turned the electricity bill into the first energy lesson for São Luís public schools.",
      },
      {
        src: "/photos/web/equipe-hackathon.webp",
        alt: "Gabriel with two teammates in front of the hackathon backdrop",
        name: "Team Cidade Energia",
        role: "API, RAG and PWA",
        text: "I work well in a team: clear contracts between front and back let everyone move at once.",
      },
      {
        src: "/photos/web/retrato-fora-da-tela.webp",
        alt: "Gabriel Coelho in a mirror portrait",
        name: "Off screen",
        role: "Powerlifting and chess",
        text: "Load goes up gradually, with technique. And thinking moves ahead is the same exercise as designing a system that will grow.",
      },
    ],
    stackTitle: "Tech Stack & Workbench",
    stackLead: "The tools I use to build systems that stay up and never lose messages.",
    stackCategories: [
      {
        name: "Back-end & Architecture",
        items: [
          { name: "Node.js", note: "High-throughput asynchronous APIs" },
          { name: "TypeScript", note: "Strict typing and end-to-end contracts" },
          { name: "Python / FastAPI", note: "RAG, AI pipelines and async services" },
          { name: "Java / Spring Boot", note: "Layered enterprise microservices" },
        ],
      },
      {
        name: "Messaging & Resilience",
        items: [
          { name: "RabbitMQ", note: "Durable queues, DLQ and fault tolerance" },
          { name: "Redis", note: "Distributed caching and rate limiting" },
          { name: "Outbox Pattern", note: "Guaranteed at-least-once delivery" },
        ],
      },
      {
        name: "Data & Vectors (AI)",
        items: [
          { name: "PostgreSQL", note: "Relational modeling and ACID compliance" },
          { name: "pgvector", note: "Vector search and embeddings for RAG" },
          { name: "Supabase", note: "BaaS, Auth and Row Level Security (RLS)" },
          { name: "Prisma", note: "Type-safe ORM and structured migrations" },
        ],
      },
      {
        name: "DevOps & Testing",
        items: [
          { name: "Docker & Compose", note: "Isolated, reproducible environments" },
          { name: "Vitest & Playwright", note: "TDD, unit suites and E2E validation" },
          { name: "Linux & CI/CD", note: "Automated pipelines and continuous deploy" },
        ],
      },
    ],
    tilesTitle: "My year in tiles",
    tilesText: (total: number) =>
      `Each tile is a week of commits on GitHub: the fuller it is, the more code. ${total} contributions in the last twelve months.`,
    tilesAria: (week: string, count: number) => `Week of ${week}: ${count} contributions`,
    tilesFallback: "The panel appears when GitHub responds.",
  },
  contact: {
    title: "Let's talk",
    location: "São Luís, Brazil · UTC−3",
    reply: "I reply within 2 working days",
    kindLegend: "What would you like to talk about?",
    kinds: { role: "It's a role", project: "It's a project" },
    write: "Write",
    subject: { role: "Role: ", project: "Freelance project: " },
    body: {
      role: "Hi Gabriel,\n\nAbout the role:\nCompany:\nRemote or on-site:\n",
      project: "Hi Gabriel,\n\nWhat I need built:\nTimeline:\nRough budget:\n",
    },
  },
  footer: {
    title: "Got a system to build?",
    cta: "Write to me",
    rights: "© 2026 Gabriel Coelho",
    built: "Built with Next.js",
    preview: "Redesign preview · not indexed",
  },
};

export const redesignCopy: Record<Locale, typeof pt> = { pt, en };
export type RedesignCopy = typeof pt;
