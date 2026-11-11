import type { Dia600Stage } from "@/data/dia600";
import type { Door } from "@/data/doors";
import type { FacetLink } from "@/data/projects";
import type { Locale } from "./translations";
import type { AppStatus } from "@/lib/derrubeApp";
import type { DirectEvent, DirectService } from "@/lib/directFlow";
import type { FlowEvent, ServiceId } from "@/lib/messageFlow";

// Textos do site. A estrutura PT e EN precisa ser idêntica:
// tests/unit/i18n.test.ts confere chaves, tipos e tamanhos de lista.

type NavLink = { href: string; label: string };


type NodeId = "interface" | ServiceId;

type DoorCopy = { name: string; teaser: string };

// Segundos até a próxima tentativa: cada tick da simulação dura 0,75 s.
const seconds = (delay: number, locale: string) =>
  (delay * 0.75).toLocaleString(locale, { maximumFractionDigits: 2 });

const pt = {
  sharing: {
    line: "Da tela ao banco, com back-ends que não perdem mensagem.",
    alt: "Gabriel Coelho, desenvolvedor full-stack em São Luís, MA, ao lado do personagem 3D dele.",
  },
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
    label: "Full-stack com foco em back-end · São Luís, MA",
    name: "Gabriel Coelho",
    characterAria: "Gabriel Coelho (clique para interagir)",
    intro: "Olá! Construo produtos da tela ao banco, com back-ends que não perdem mensagem. O que vamos construir?",
    seeWork: "Ver projetos",
    project: "Tenho um projeto",
    role: "Tenho uma vaga",
    copyEmail: "Copiar e-mail",
    copied: "E-mail copiado",
    copyFailed: "Não deu para copiar. Use o endereço ao lado.",
    quotes: [
      "E aí! Este site também é código meu, com testes e tudo.",
      "Curtiu o AuthGuard lá embaixo? Tenta derrubar outro nó pra testar a fila!",
      "Tem um projeto ou uma vaga? O contato fica no fim da página.",
    ],
  },
  contact: {
    whatsapp: "WhatsApp",
    whatsappNumber: "(98) 98825-5626",
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
    roomLabel: (index: number, name: string) => `Porta ${String(index + 1).padStart(2, "0")} · ${name}`,
    alsoIn: (name: string) => `Também na porta ${name}`,
    carousel: {
      prev: "Porta anterior",
      next: "Próxima porta",
      // Lido só pelo leitor de tela, antes da posição: "Porta 2 de 3".
      positionPrefix: "Porta",
      position: (i: number, n: number) => `${i} de ${n}`,
    },
    panel: {
      footerText: "Quer ver as outras portas?",
      closeAndBack: (name: string) => `Fechar ${name} e voltar às portas`,
      scrollTop: "Voltar ao topo da seção",
      scrollTopShort: "Topo",
      scrollTopTitle: "Rolar para o topo",
      closeTitle: "Fechar e voltar às portas (Esc)",
      navAria: "Navegação rápida do projeto",
    },
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
        body: "descubro o que precisa continuar funcionando quando uma peça cair.",
        evidence: "contract",
      },
      {
        lead: "Na arquitetura,",
        body: "escrevo o contrato da API e o modelo de dados antes da primeira tela.",
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
    contractCaption: "Trecho do contrato OpenAPI 3.1 do Cidade Energia, uma das 22 rotas documentadas.",
    diagramCaption: "Arquitetura do AuthGuard: autenticação, fila e Dead-Letter Queue.",
    docsCaption: "Documentação pública da API do Cidade Energia, no ar desde a entrega.",
  },
  services: {
    title: "O que eu resolvo",
    head: { problem: "Problema", delivery: "O que entrego", stack: "Stack", proof: "Prova" },
    rows: [
      { problem: "Sua API fica lenta ou cai no pico", delivery: "Fila para o trabalho pesado e limite de taxa na entrada", stack: "Node, Redis, RabbitMQ", proof: "AuthGuard" },
      { problem: "Quero uma IA que responda com os meus documentos", delivery: "RAG que cita a fonte de cada resposta", stack: "Python, FastAPI, pgvector", proof: "RAG Serviços Públicos" },
      { problem: "Preciso de um MVP que aguente crescer", delivery: "Interface e uma API documentada, com testes desde o início", stack: "Next.js, Supabase, Postgres", proof: "Cidade Energia" },
      { problem: "Preciso controlar quem acessa o quê", delivery: "Autenticação com MFA e permissões por papel (RBAC)", stack: "Node, JWT, Postgres", proof: "AuthGuard" },
      { problem: "Meus dados estão espalhados em várias fontes", delivery: "API que reúne fontes públicas num lugar só, com geolocalização", stack: "Node, Express, MongoDB", proof: "Guia Maranhão" },
    ],
    roles: "Para vagas: procuro posições full-stack júnior ou pleno, remotas ou em São Luís.",
    talk: "Vamos conversar",
  },
  about: {
    title: "Sobre mim",
    intro: "Encarregado de logística numa rede nacional de mercados e desenvolvedor full-stack com foco em back-end.",
    dia600: {
      label: "O dia de maior pressão",
      title: "600 toneladas, um fluxo só",
      counters: { shipped: "expedidas", trucks: "caminhões carregados", lost: "perdidos" },
      summary: "Naquele dia: 600 toneladas expedidas, 40 caminhões carregados e nenhuma carga perdida.",
      stages: {
        pedido: "Pedido das lojas",
        separacao: "Separação",
        conferencia: "Conferência",
        carregamento: "Carregamento",
        lojas: "Lojas da rede",
      } as Record<Dia600Stage["id"], string>,
      // Pedido, separação, conferência e lojas reaproveitam derrube.up ("no ar").
      states: { carregamento: "40+ caminhões" } as Partial<
        Record<Dia600Stage["id"], string>
      >,
      inCode: (log: string, code: string) => `${log}, no código: ${code}`,
      chip: (n: string) => `cam. ${n}`,
      lines: [
        "Na média, 300 toneladas por dia saem para as lojas da rede.",
        "No pico, 600 toneladas e mais de 40 caminhões para carregar no mesmo dia.",
        "Todos no mesmo padrão de separação e conferência, caminhão por caminhão.",
        "O fluxo não rompeu.",
        "No código, é o mesmo desenho: a fila segura o pico e nada se perde.",
      ],
      bridgeLink: "É o AuthGuard que você pode derrubar lá em cima",
    },
    portraits: [
      {
        src: "/photos/web/retrato-espelho.webp",
        alt: "Gabriel Coelho de camisa branca, diante de azulejos azuis",
        name: "Gabriel Coelho",
        role: "Full-stack · Ciência e Tecnologia, UFMA",
        text: "Na logística, aprendi que pacote perdido é cliente perdido. No código, sigo a mesma regra.",
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
        text: "Com o contrato da API escrito antes, front e back avançam em paralelo.",
      },
      {
        src: "/photos/web/retrato-fora-da-tela.webp",
        alt: "Gabriel Coelho em retrato no espelho",
        name: "Fora da tela",
        role: "Powerlifting e xadrez",
        text: "Carga se aumenta aos poucos, com técnica. E pensar jogadas à frente é o mesmo exercício de desenhar um sistema que vai crescer.",
      },
    ],
    stackTitle: "Skills",
    stackLead: "O que uso no dia a dia e onde cada coisa aparece nos meus projetos.",
    stackCategories: [
      {
        name: "Back-end",
        items: [
          { name: "Node.js", note: "APIs do AuthGuard e do Guia Maranhão" },
          { name: "TypeScript", note: "Em quase todo projeto, da interface à API" },
          { name: "Python e FastAPI", note: "Serviço de busca do RAG Serviços Públicos" },
        ],
      },
      {
        name: "Front-end",
        items: [
          { name: "Next.js 16 e React 19", note: "PWA do Cidade Energia: simulador solar, trilhas com quiz e 133 testes" },
          { name: "React e mapas", note: "BuscaSUS: unidade de saúde mais próxima e a rota, com o Google Maps" },
          { name: "Acessibilidade", note: "Este portfólio: conferido com axe nos testes Playwright" },
          { name: "Modo simulado", note: "O PWA do Cidade Energia roda inteiro sem back-end na demo" },
        ],
      },
      {
        name: "Mensageria e cache",
        items: [
          { name: "RabbitMQ", note: "Filas duráveis com DLQ no AuthGuard" },
          { name: "Redis", note: "Limite de taxa e lista de tokens revogados no AuthGuard" },
        ],
      },
      {
        name: "Bancos e busca vetorial",
        items: [
          { name: "PostgreSQL", note: "Ledger ACID da API Financeira e dados do AuthGuard" },
          { name: "pgvector", note: "Busca semântica com índice HNSW no RAG" },
          { name: "Supabase", note: "Login anônimo, banco e RLS do Cidade Energia" },
          { name: "Prisma", note: "ORM tipado, com migrações, na API Financeira" },
        ],
      },
      {
        name: "Testes e entrega",
        items: [
          { name: "Vitest e Jest", note: "435 testes no Cidade Energia, 94 no AuthGuard" },
          { name: "Playwright", note: "Testes de ponta a ponta e de acessibilidade deste portfólio" },
          { name: "Docker e Compose", note: "AuthGuard, RAG e API Financeira rodam em contêiner" },
          { name: "GitHub Actions", note: "No RAG Serviços Públicos, build e testes (Node e pytest) a cada push e PR" },
        ],
      },
    ],
    tilesTitle: "Meu ano em azulejos",
    tilesText: (total: number) =>
      `Cada azulejo é uma semana de commits no GitHub: quanto mais cheio, mais código. ${total} contribuições nos últimos doze meses.`,
    tilesAria: (week: string, count: number) => `Semana de ${week}: ${count} contribuições`,
    tilesFallback: "O painel aparece quando o GitHub responde.",
  },
  footer: {
    title: "Tem um produto para construir?",
    cta: "Escrever para mim",
    rights: "© 2026 Gabriel Coelho",
    built: "Feito com Next.js",
  },
};

const en: typeof pt = {
  sharing: {
    line: "From the screen to the database, with back-ends that never drop a message.",
    alt: "Gabriel Coelho, a full-stack developer in São Luís, Brazil, alongside his 3D character.",
  },
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
    label: "Full-stack, back-end focused · São Luís, Brazil",
    name: "Gabriel Coelho",
    characterAria: "Gabriel Coelho (click to interact)",
    intro: "Hi! I build products from the screen to the database, with back-ends that never drop a message. What do you want to build?",
    seeWork: "See my work",
    project: "I have a project",
    role: "I'm hiring",
    copyEmail: "Copy email",
    copied: "Email copied",
    copyFailed: "Couldn't copy. Use the address next to it.",
    quotes: [
      "Hey! This site is my code too, tests included.",
      "Checked out AuthGuard below? Go ahead and take down another node!",
      "Got a project or a role? My contact info is at the bottom of the page.",
    ],
  },
  contact: {
    whatsapp: "WhatsApp",
    whatsappNumber: "(98) 98825-5626",
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
    roomLabel: (index: number, name: string) => `Door ${String(index + 1).padStart(2, "0")} · ${name}`,
    alsoIn: (name: string) => `Also behind the ${name} door`,
    carousel: {
      prev: "Previous door",
      next: "Next door",
      positionPrefix: "Door",
      position: (i: number, n: number) => `${i} of ${n}`,
    },
    panel: {
      footerText: "Want to see the other doors?",
      closeAndBack: (name: string) => `Close ${name} and go back to the doors`,
      scrollTop: "Back to the top of the section",
      scrollTopShort: "Top",
      scrollTopTitle: "Scroll to the top",
      closeTitle: "Close and go back to the doors (Esc)",
      navAria: "Quick project navigation",
    },
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
        lead: "Before writing code,",
        body: "I find out what has to keep working when a service fails.",
        evidence: "contract",
      },
      {
        lead: "During system design,",
        body: "I write the API contract and the data model before the first screen.",
        evidence: "diagram",
      },
      {
        lead: "While building,",
        body: "tests are built in: 435 in Cidade Energia, 94 with over 90% coverage in AuthGuard.",
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
    contractCaption: "Excerpt from the Cidade Energia OpenAPI 3.1 contract, one of 22 documented routes.",
    diagramCaption: "AuthGuard's architecture: authentication, queue and Dead-Letter Queue.",
    docsCaption: "Public API documentation for Cidade Energia, live since delivery.",
  },
  services: {
    title: "Problems I solve",
    head: { problem: "Problem", delivery: "What I deliver", stack: "Stack", proof: "Proof" },
    rows: [
      { problem: "Your API slows down or crashes under peak load", delivery: "A queue for heavy workloads and rate limiting at the entry point", stack: "Node, Redis, RabbitMQ", proof: "AuthGuard" },
      { problem: "I want an AI that answers from my documents", delivery: "RAG that cites the source of every answer", stack: "Python, FastAPI, pgvector", proof: "RAG Serviços Públicos" },
      { problem: "I need an MVP that can grow", delivery: "An interface and a documented API, tested from the start", stack: "Next.js, Supabase, Postgres", proof: "Cidade Energia" },
      { problem: "I need to control who can access what", delivery: "Authentication with MFA and role-based permissions (RBAC)", stack: "Node, JWT, Postgres", proof: "AuthGuard" },
      { problem: "My data is scattered across sources", delivery: "One API that brings public sources together, with geolocation", stack: "Node, Express, MongoDB", proof: "Guia Maranhão" },
    ],
    roles: "For roles: looking for junior or mid-level full-stack positions, remote or in São Luís.",
    talk: "Let's talk",
  },
  about: {
    title: "About me",
    intro: "Logistics supervisor at a national supermarket chain and full-stack developer focused on the back end.",
    dia600: {
      label: "The highest-pressure day",
      title: "600 tonnes, one flow",
      counters: { shipped: "shipped", trucks: "trucks loaded", lost: "lost" },
      summary: "That day: 600 tonnes shipped, 40 trucks loaded and no load lost.",
      stages: {
        pedido: "Store orders",
        separacao: "Picking",
        conferencia: "Checking",
        carregamento: "Loading",
        lojas: "The chain's stores",
      },
      states: { carregamento: "40+ trucks" },
      inCode: (log: string, code: string) => `${log}, in code: ${code}`,
      chip: (n: string) => `truck ${n}`,
      lines: [
        "On average, 300 tonnes a day leave for the chain's stores.",
        "At the peak, 600 tonnes and more than 40 trucks to load in a single day.",
        "Everyone on the same picking and checking standard, truck after truck.",
        "The flow never broke.",
        "In code it's the same design: the queue absorbs the peak and nothing gets lost.",
      ],
      bridgeLink: "That's AuthGuard, the one you can take down above",
    },
    portraits: [
      {
        src: "/photos/web/retrato-espelho.webp",
        alt: "Gabriel Coelho in a white shirt, in front of blue tiles",
        name: "Gabriel Coelho",
        role: "Full-stack · Science and Technology, UFMA",
        text: "In logistics I learned that a lost package is a lost customer. In code, I follow the same rule.",
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
        text: "With the API contract written first, front end and back end can be built in parallel.",
      },
      {
        src: "/photos/web/retrato-fora-da-tela.webp",
        alt: "Gabriel Coelho in a mirror portrait",
        name: "Off-screen",
        role: "Powerlifting and chess",
        text: "Load goes up gradually, with technique. And thinking several moves ahead is the same exercise as designing a system that will grow.",
      },
    ],
    stackTitle: "Skills",
    stackLead: "What I work with day to day, and where each one shows up in my projects.",
    stackCategories: [
      {
        name: "Back-end",
        items: [
          { name: "Node.js", note: "APIs for AuthGuard and Guia Maranhão" },
          { name: "TypeScript", note: "In nearly every project, from the interface to the API" },
          { name: "Python and FastAPI", note: "Search service in RAG Serviços Públicos" },
        ],
      },
      {
        name: "Front-end",
        items: [
          { name: "Next.js 16 and React 19", note: "Cidade Energia PWA: solar simulator, quiz tracks and 133 tests" },
          { name: "React and maps", note: "BuscaSUS: nearest public clinic and the route, with Google Maps" },
          { name: "Accessibility", note: "This portfolio: checked with axe in Playwright tests" },
          { name: "Mock mode", note: "The Cidade Energia PWA runs fully without a back end for the demo" },
        ],
      },
      {
        name: "Messaging and caching",
        items: [
          { name: "RabbitMQ", note: "Durable queues with a DLQ in AuthGuard" },
          { name: "Redis", note: "Rate limiting and a revoked-token list in AuthGuard" },
        ],
      },
      {
        name: "Databases and vector search",
        items: [
          { name: "PostgreSQL", note: "ACID ledger in API Financeira and AuthGuard's data" },
          { name: "pgvector", note: "Semantic search with an HNSW index in the RAG project" },
          { name: "Supabase", note: "Anonymous login, database and RLS in Cidade Energia" },
          { name: "Prisma", note: "Typed ORM with migrations, in API Financeira" },
        ],
      },
      {
        name: "Testing and delivery",
        items: [
          { name: "Vitest and Jest", note: "435 tests in Cidade Energia, 94 in AuthGuard" },
          { name: "Playwright", note: "End-to-end and accessibility tests for this portfolio" },
          { name: "Docker and Compose", note: "AuthGuard, RAG and API Financeira run in containers" },
          { name: "GitHub Actions", note: "In RAG Serviços Públicos, build and tests (Node and pytest) on every push and PR" },
        ],
      },
    ],
    tilesTitle: "My year in tiles",
    tilesText: (total: number) =>
      `Each tile is a week of commits on GitHub: the fuller it is, the more code. ${total} contributions in the last twelve months.`,
    tilesAria: (week: string, count: number) => `Week of ${week}: ${count} contributions`,
    tilesFallback: "The panel appears when GitHub responds.",
  },
  footer: {
    title: "Got a product to build?",
    cta: "Get in touch",
    rights: "© 2026 Gabriel Coelho",
    built: "Built with Next.js",
  },
};

export const siteCopy: Record<Locale, typeof pt> = { pt, en };
export type SiteCopy = typeof pt;
