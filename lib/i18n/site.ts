import type { Door, FacetLink } from "@/data/projects";
import type { Locale } from "./translations";
import type { AppStatus } from "@/lib/derrubeApp";
import type { DirectEvent, DirectService } from "@/lib/directFlow";
import type { FlowEvent, ServiceId } from "@/lib/messageFlow";

// Textos do site. A estrutura PT e EN precisa ser idêntica:
// tests/unit/i18n.test.ts confere chaves, tipos e tamanhos de lista.

type NavLink = { href: string; label: string };

type SectionCopy = { title: string; soon: string };

type NodeId = "interface" | ServiceId;

type DoorCopy = { name: string; teaser: string };

// Segundos até a próxima tentativa: cada tick da simulação dura 0,75 s.
const seconds = (delay: number, locale: string) =>
  (delay * 0.75).toLocaleString(locale, { maximumFractionDigits: 2 });

const pt = {
  nav: {
    brand: "Gabriel Coelho",
    homeAria: "Gabriel Coelho, início",
    links: [
      { href: "#projetos", label: "Projetos" },
      { href: "#como-trabalho", label: "Como trabalho" },
      { href: "#sobre", label: "Sobre" },
      { href: "#contato", label: "Contato" },
    ] as NavLink[],
    navAria: "Principal",
    status: "Disponível",
    langSwitch: "EN",
    langSwitchAria: "Mudar idioma para inglês",
    menu: "Menu",
  },
  hero: {
    label: "Back-end · Full-stack · São Luís, MA",
    name: "Gabriel Coelho",
    intro: "Olá! Eu construo back-ends que não perdem uma mensagem: APIs, filas e IA com fontes. O que vamos construir?",
    seeWork: "Ver projetos",
    project: "Tenho um projeto",
    role: "É uma vaga",
    copyEmail: "Copiar e-mail",
    copied: "E-mail copiado",
    copyFailed: "Não deu para copiar. Use o endereço ao lado.",
    quotes: [
      "E aí! APIs no ar, filas rodando e zero mensagens perdidas.",
      "Curtiu o AuthGuard lá embaixo? Tenta derrubar outro nó pra testar a fila!",
      "Bora construir um back-end sólido juntos? Me dá um alô no contato!",
    ],
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
  derrube: {
    title: "Derrube um serviço",
    sentence:
      "Crie uma conta no AuthGuard e derrube qualquer peça do caminho. Veja o que acontece com o e-mail de boas-vindas.",
    modeLegend: "Arquitetura",
    modes: { queue: "Com fila (AuthGuard)", direct: "Sem fila" },
    modeNote: {
      queue: "Com fila: o que cai espera, tenta de novo e, no pior caso, vai para a DLQ. Nada se perde.",
      direct: "Sem fila: o que cai no meio do caminho se perde.",
    },
    nodes: { interface: "Interface", api: "API", queue: "Fila (RabbitMQ)", worker: "Worker", db: "Banco" } as Record<
      NodeId,
      string
    >,
    toggleAria: (name: string, up: boolean) => `${name}: ${up ? "no ar, desligar" : "fora do ar, religar"}`,
    up: "no ar",
    down: "fora do ar",
    send: "Criar conta",
    replay: "Reprocessar DLQ",
    reset: "Recomeçar",
    dlq: "DLQ",
    score: { sent: "Enviadas", delivered: "Entregues", lost: "Perdidas" },
    logTitle: "O que aconteceu",
    emptyLog: "Crie uma conta para começar.",
    event: (e: FlowEvent | DirectEvent): string => {
      const peca: Record<DirectService, string> = { api: "API", worker: "Worker", db: "Banco" };
      switch (e.kind) {
        case "sent": return `E-mail #${e.id} enviado.`;
        case "waitingApi": return `API fora do ar. E-mail #${e.id} aguardando para reenviar.`;
        case "outbox": return `Fila fora do ar. E-mail #${e.id} guardado no outbox da API.`;
        case "waitingWorker": return `Worker fora do ar. E-mail #${e.id} aguardando na fila.`;
        case "retry":
          return `Banco fora do ar. Tentativa ${e.attempt} de ${e.max} para o e-mail #${e.id}. Nova tentativa em ${seconds(e.delay, "pt-BR")} s.`;
        case "toDlq": return `Tentativas esgotadas. E-mail #${e.id} movido para a DLQ.`;
        case "replayed": return `E-mail #${e.id} reprocessado da DLQ.`;
        case "delivered": return `E-mail #${e.id} entregue.`;
        case "lost": return `${peca[e.service]} fora do ar. E-mail #${e.id} perdido.`;
      }
    },
    app: {
      title: "AuthGuard",
      heading: "Criar conta",
      nameLabel: "Nome",
      emailLabel: "E-mail",
      person: { name: "Ana Souza", email: "ana.souza@exemplo.com" },
      fake: "Dados fictícios. Nada é enviado.",
      status: {
        idle: "Preencha e crie a conta.",
        connecting: "Conectando ao servidor…",
        processing: "Conta criada. E-mail de boas-vindas: processando…",
        delivered: "Conta criada. E-mail de boas-vindas: entregue.",
        error: "Algo deu errado. Tente de novo mais tarde.",
      } as Record<AppStatus, string>,
    },
    note: "Simulação do fluxo do AuthGuard (RabbitMQ + Dead-Letter Queue).",
    noteLink: "Ver o código",
    noJs:
      "Com fila, quando uma peça cai, o e-mail espera, tenta de novo com espera crescente e, depois de três falhas, vai para a DLQ, de onde é reprocessado. Sem fila, a mesma queda perde o e-mail.",
  },
  projetos: {
    title: "Sistemas que construí",
    featured: {
      badge: "Campeão · Hackathon Equatorial 2026",
      line: "Campeão do Hackathon Equatorial: a conta de luz vira a primeira aula de energia em escolas públicas de São Luís.",
      fullStack: "Front e back feitos por mim",
    },
    doorsTitle: "Escolha uma porta",
    doors: {
      backend: {
        name: "Back-end",
        teaser: "APIs, filas e dados que não se perdem.",
      },
      frontend: {
        name: "Front-end",
        teaser: "Interfaces e PWAs que conversam bem com a API.",
      },
      ia: {
        name: "IA",
        teaser: "RAG que responde com fontes.",
      },
    } as Record<Door, DoorCopy>,
    open: (name: string) => `Abrir a porta ${name}`,
    back: "Voltar às portas",
    links: {
      github: "Código",
      frontend: "Front-end",
      demo: "Demo",
      docs: "Documentação da API",
    } as Record<FacetLink, string>,
    board: {
      legendTitle: "Peça e papel",
      notationTitle: "Fluxo da partida",
      copyMermaid: "Copiar Mermaid",
      copied: "Mermaid copiado",
      copyFailed: "Não deu para copiar",
      downloadSvg: "Baixar SVG",
      fullscreen: "Tela cheia",
      close: "Fechar",
      swipe: "Deslize o tabuleiro para o lado",
      lost: "Peças perdidas: 0",
    },
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
        name: "Front-end & Aplicações Modernas (PWA)",
        items: [
          { name: "Next.js 16 & React 19", note: "PWA do Cidade Energia: simulador solar, quiz e 133 testes" },
          { name: "React & Mapas Geoespaciais", note: "Interface do BuscaSUS: cálculo de rotas com Google Maps & Leaflet" },
          { name: "TypeScript & Design Systems", note: "Interfaces táteis, tipagem estrita e acessibilidade WCAG AA" },
          { name: "PWA & Modo Offline/Simulado", note: "Service workers, cache resiliente e execução cliente sem back-end" },
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
  sections: {
    comoTrabalho: { title: "Como eu trabalho", soon: "Em construção." },
    oQueResolvo: { title: "O que eu resolvo", soon: "Em construção." },
    sobre: { title: "Sobre mim", soon: "Em construção." },
    contato: { title: "Vamos conversar", soon: "Em construção." },
  } as Record<string, SectionCopy>,
  footer: {
    title: "Tem um sistema para construir?",
    cta: "Escrever para mim",
    rights: "© 2026 Gabriel Coelho",
    built: "Feito com Next.js",
  },
};

const en: typeof pt = {
  nav: {
    brand: "Gabriel Coelho",
    homeAria: "Gabriel Coelho, home",
    links: [
      { href: "#projetos", label: "Work" },
      { href: "#como-trabalho", label: "How I work" },
      { href: "#sobre", label: "About" },
      { href: "#contato", label: "Contact" },
    ],
    navAria: "Main",
    status: "Available",
    langSwitch: "PT",
    langSwitchAria: "Switch language to Portuguese",
    menu: "Menu",
  },
  hero: {
    label: "Back-end · Full-stack · São Luís, Brazil",
    name: "Gabriel Coelho",
    intro: "Hi! I build back-ends that never drop a message: APIs, queues and AI that cites its sources. What shall we build?",
    seeWork: "See the work",
    project: "I have a project",
    role: "It's a role",
    copyEmail: "Copy email",
    copied: "Email copied",
    copyFailed: "Couldn't copy. Use the address next to it.",
    quotes: [
      "Hey! APIs up, queues humming, zero dropped messages.",
      "Checked out AuthGuard below? Go ahead and knock down another node!",
      "Looking to build something resilient together? Say hi down in contact!",
    ],
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
  derrube: {
    title: "Take down a service",
    sentence:
      "Create an account on AuthGuard and take down any piece on the way. Watch what happens to the welcome email.",
    modeLegend: "Architecture",
    modes: { queue: "With a queue (AuthGuard)", direct: "No queue" },
    modeNote: {
      queue: "With a queue: whatever goes down waits, retries and, at worst, goes to the DLQ. Nothing is lost.",
      direct: "No queue: whatever goes down on the way is lost.",
    },
    nodes: { interface: "Interface", api: "API", queue: "Queue (RabbitMQ)", worker: "Worker", db: "Database" },
    toggleAria: (name: string, up: boolean) => `${name}: ${up ? "up, switch off" : "down, switch on"}`,
    up: "up",
    down: "down",
    send: "Create account",
    replay: "Replay DLQ",
    reset: "Reset",
    dlq: "DLQ",
    score: { sent: "Sent", delivered: "Delivered", lost: "Lost" },
    logTitle: "What happened",
    emptyLog: "Create an account to begin.",
    event: (e: FlowEvent | DirectEvent): string => {
      const piece: Record<DirectService, string> = { api: "API", worker: "Worker", db: "Database" };
      switch (e.kind) {
        case "sent": return `Email #${e.id} sent.`;
        case "waitingApi": return `API down. Email #${e.id} waiting to resend.`;
        case "outbox": return `Queue down. Email #${e.id} kept in the API outbox.`;
        case "waitingWorker": return `Worker down. Email #${e.id} waiting in the queue.`;
        case "retry":
          return `Database down. Attempt ${e.attempt} of ${e.max} for email #${e.id}. Next try in ${seconds(e.delay, "en")} s.`;
        case "toDlq": return `Attempts exhausted. Email #${e.id} moved to the DLQ.`;
        case "replayed": return `Email #${e.id} replayed from the DLQ.`;
        case "delivered": return `Email #${e.id} delivered.`;
        case "lost": return `${piece[e.service]} down. Email #${e.id} lost.`;
      }
    },
    app: {
      title: "AuthGuard",
      heading: "Create account",
      nameLabel: "Name",
      emailLabel: "Email",
      person: { name: "Ana Souza", email: "ana.souza@example.com" },
      fake: "Fictitious data. Nothing is sent.",
      status: {
        idle: "Fill in and create the account.",
        connecting: "Connecting to the server…",
        processing: "Account created. Welcome email: processing…",
        delivered: "Account created. Welcome email: delivered.",
        error: "Something went wrong. Please try again later.",
      },
    },
    note: "A simulation of AuthGuard's flow (RabbitMQ + Dead-Letter Queue).",
    noteLink: "See the code",
    noJs:
      "With a queue, when a piece goes down the email waits, retries with growing delays and, after three failures, goes to the DLQ, from where it is replayed. Without a queue, the same failure loses the email.",
  },
  projetos: {
    title: "Systems I built",
    featured: {
      badge: "Winner · Equatorial Hackathon 2026",
      line: "Equatorial Hackathon winner: the electricity bill becomes the first energy lesson in São Luís public schools.",
      fullStack: "Front and back built by me",
    },
    doorsTitle: "Pick a door",
    doors: {
      backend: {
        name: "Back-end",
        teaser: "APIs, queues and data that never get lost.",
      },
      frontend: {
        name: "Front-end",
        teaser: "Interfaces and PWAs that talk cleanly to the API.",
      },
      ia: {
        name: "AI",
        teaser: "RAG that answers with sources.",
      },
    },
    open: (name: string) => `Open the ${name} door`,
    back: "Back to doors",
    links: {
      github: "Code",
      frontend: "Front-end",
      demo: "Demo",
      docs: "API docs",
    },
    board: {
      legendTitle: "Piece and role",
      notationTitle: "Move notation",
      copyMermaid: "Copy Mermaid",
      copied: "Mermaid copied",
      copyFailed: "Couldn't copy",
      downloadSvg: "Download SVG",
      fullscreen: "Fullscreen",
      close: "Close",
      swipe: "Swipe the board sideways",
      lost: "Pieces lost: 0",
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
        name: "Front-end & Modern Apps (PWA)",
        items: [
          { name: "Next.js 16 & React 19", note: "Cidade Energia PWA: solar simulator, quiz tracks and 133 tests" },
          { name: "React & Geospatial Maps", note: "BuscaSUS interface: real-time routing with Google Maps & Leaflet" },
          { name: "TypeScript & Design Systems", note: "Tactile UI, strict typing, responsive design and WCAG AA accessibility" },
          { name: "PWA & Offline-First Mode", note: "Service workers, resilient caching and mock client mode without back-end" },
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
  sections: {
    comoTrabalho: { title: "How I work", soon: "Coming soon." },
    oQueResolvo: { title: "What I can fix for you", soon: "Coming soon." },
    sobre: { title: "About me", soon: "Coming soon." },
    contato: { title: "Let's talk", soon: "Coming soon." },
  },
  footer: {
    title: "Got a system to build?",
    cta: "Write to me",
    rights: "© 2026 Gabriel Coelho",
    built: "Built with Next.js",
  },
};

export const siteCopy: Record<Locale, typeof pt> = { pt, en };
export type SiteCopy = typeof pt;
