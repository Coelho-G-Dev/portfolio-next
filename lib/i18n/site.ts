import type { Door, FacetLink } from "@/data/projects";
import type { Locale } from "./translations";
import type { MailCopy } from "@/lib/contact";
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
    subject: { role: "Vaga: ", project: "Projeto freelance: " },
    body: {
      role: "Olá, Gabriel.\n\nSobre a vaga:\nEmpresa:\nModelo (remoto/presencial):\n",
      project: "Olá, Gabriel.\n\nO que preciso construir:\nPrazo:\nOrçamento aproximado:\n",
    },
  } as MailCopy,
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
  sections: {
    comoTrabalho: { title: "Como eu trabalho", soon: "Em construção." },
    oQueResolvo: { title: "O que eu resolvo", soon: "Em construção." },
    sobre: { title: "Sobre mim", soon: "Em construção." },
    contato: { title: "Vamos conversar", soon: "Em construção." },
  } as Record<string, SectionCopy>,
  footer: {
    title: "Rodapé",
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
  sections: {
    comoTrabalho: { title: "How I work", soon: "Coming soon." },
    oQueResolvo: { title: "What I can fix for you", soon: "Coming soon." },
    sobre: { title: "About me", soon: "Coming soon." },
    contato: { title: "Let's talk", soon: "Coming soon." },
  },
  footer: {
    title: "Footer",
  },
};

export const siteCopy: Record<Locale, typeof pt> = { pt, en };
export type SiteCopy = typeof pt;
