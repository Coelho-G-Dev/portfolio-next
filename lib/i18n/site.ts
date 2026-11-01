import type { Locale } from "./translations";
import type { MailCopy } from "@/lib/contact";
import { redesignCopy } from "./redesign";

// Textos do site novo (/novo). A estrutura PT e EN precisa ser idêntica:
// tests/unit/i18n.test.ts confere chaves, tipos e tamanhos de lista.

type NavLink = { href: string; label: string };

type SectionCopy = { title: string; soon: string };

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
  },
  contact: {
    subject: redesignCopy.pt.contact.subject,
    body: redesignCopy.pt.contact.body,
  } as MailCopy,
  // Capítulos provisórios: cada um ganha conteúdo nos planos 2 a 4.
  sections: {
    derrube: { title: redesignCopy.pt.breakService.title, soon: "Em construção." },
    projetos: { title: redesignCopy.pt.work.title, soon: "Em construção." },
    comoTrabalho: { title: redesignCopy.pt.how.title, soon: "Em construção." },
    oQueResolvo: { title: redesignCopy.pt.services.title, soon: "Em construção." },
    sobre: { title: redesignCopy.pt.about.title, soon: "Em construção." },
    contato: { title: redesignCopy.pt.contact.title, soon: "Em construção." },
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
  },
  contact: {
    subject: redesignCopy.en.contact.subject,
    body: redesignCopy.en.contact.body,
  },
  sections: {
    derrube: { title: redesignCopy.en.breakService.title, soon: "Coming soon." },
    projetos: { title: redesignCopy.en.work.title, soon: "Coming soon." },
    comoTrabalho: { title: redesignCopy.en.how.title, soon: "Coming soon." },
    oQueResolvo: { title: redesignCopy.en.services.title, soon: "Coming soon." },
    sobre: { title: redesignCopy.en.about.title, soon: "Coming soon." },
    contato: { title: redesignCopy.en.contact.title, soon: "Coming soon." },
  },
  footer: {
    title: "Footer",
  },
};

export const siteCopy: Record<Locale, typeof pt> = { pt, en };
export type SiteCopy = typeof pt;
