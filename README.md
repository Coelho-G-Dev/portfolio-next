<div align="center">

# ⚡ Gabriel Coelho — Portfólio

<p align="center">
  <strong>Meu portfólio interativo desenvolvido com Next.js 15, TypeScript e Tailwind CSS.</strong><br>
  Uma experiência editorial e moderna inspirada no conceito <em>"Color Cuts"</em>, combinando alta performance, acessibilidade e engenharia back-end com presença.
</p>

<p align="center">
  <a href="https://portfolio-next-flax-seven.vercel.app" target="_blank">
    <img src="https://img.shields.io/badge/Demo_Online-Visitar_Portfólio-00DF81?style=for-the-badge&logo=vercel&logoColor=black" alt="Demo Online" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_15-black?style=flat-square&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React_18-14232C?style=flat-square&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript_5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white" alt="Deploy" />
  <img src="https://img.shields.io/badge/Licença-MIT-blue?style=flat-square" alt="Licença" />
</p>

[Visão Geral](#-visão-geral) •
[Destaques de Engenharia](#-destaques-de-engenharia--ux) •
[Projetos Destacados](#-meus-projetos-em-destaque) •
[Stack Tecnológica](#-stack-tecnológica) •
[Estrutura do Código](#-estrutura-do-projeto) •
[Instalação](#-como-rodar-localmente) •
[Contato](#-vamos-conversar)

---

</div>

## 🎯 Visão Geral

Olá! Sou **Gabriel Coelho**, desenvolvedor focado em **Back-End**, arquitetura de software e construção de sistemas escaláveis e resilientes.

Este repositório contém o código-fonte da aplicação web do meu portfólio pessoal. Desenvolvi esta interface com o objetivo de quebrar o padrão genérico de portfólios tech: adotei uma estética editorial fundamentada em **cortes de cor sólida (*color cuts*)**, tipografia expressiva e microinterações dinâmicas, mantendo um código limpo, semântico e com pontuação máxima em métricas vitais de web e acessibilidade.

---

## ✨ Destaques de Engenharia & UX

No desenvolvimento deste projeto, priorizei padrões modernos de engenharia web e experiência do usuário:

- **Arquitetura Next.js 15 (App Router):** Renderização otimizada combinando Server Components e divisão inteligente de bundles.
- **Tipografia Editorial Harmoniosa:** Curadoria entre *Archivo* (sans-serif display de impacto), *Fraunces* (serif itálica elegante) e *JetBrains Mono* (monoespaçada técnica).
- **Acessibilidade Prioritária (A11y):**
  - Implementei skip link (`Pular para o conteúdo principal`) para navegação facilitada por teclado.
  - Desenvolvi um verificador de contraste em runtime com logging de conformidade WCAG AA (`ContrastChecker`).
  - Suporte completo a `prefers-reduced-motion` no hook customizado de animação de scroll (`useReveal`).
  - Estrutura semântica rigorosa com atributos ARIA e marcações acessíveis.
- **SEO & Otimização de Compartilhamento:**
  - Metadados canônicos, robots e tags Open Graph completas.
  - Geração dinâmica de imagem de compartilhamento (`opengraph-image.tsx`) para prévias no LinkedIn e WhatsApp.
  - Rich Snippets com schema `Person` do Schema.org em formato JSON-LD.
- **Observabilidade em Tempo Real:** Monitoramento nativo com `@vercel/analytics` e `@vercel/speed-insights`.

---

## 🚀 Meus Projetos em Destaque

Selecionei para o portfólio projetos que refletem meu foco em solidez no back-end, segurança e resolução de problemas práticos:

| Projeto | Categoria | Stack Principal | Repositório |
| :--- | :--- | :--- | :--- |
| **AuthGuard** | Microsserviço de Identidade | TypeScript, Node.js, RabbitMQ, Redis, Docker | [GitHub](https://github.com/Coelho-G-Dev/auhthguard) |
| **API Financeira Inteligente** | IA & Auditoria Financeira | Node.js, PostgreSQL, Google Gemini AI, Jest | [GitHub](https://github.com/Coelho-G-Dev/api-financeira-inteligente) |
| **BuscaSUS** | Integração & Geolocalização | Node.js, Express, MongoDB, Google Maps Platform | [GitHub](https://github.com/Coelho-G-Dev/Desafio-05-Back-End) |
| **Guia Maranhão** | Serviços Públicos & Dados Abertos | Node.js, Mongoose, JWT, APIs IBGE & Google Maps | [GitHub](https://github.com/Coelho-G-Dev/Guia-Maranhao) |

---

## 🛠️ Stack Tecnológica

| Camada | Ferramenta / Biblioteca |
| :--- | :--- |
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Turbopack ready) |
| **Linguagem** | [TypeScript](https://www.typescriptlang.org/) com tipagem estrita |
| **Estilização** | [Tailwind CSS 3](https://tailwindcss.com/) com paleta de tokens customizada |
| **Tipografia** | [Google Fonts](https://fonts.google.com/) via `next/font` (*Archivo*, *Fraunces*, *JetBrains Mono*) |
| **Ícones** | [Lucide React](https://lucide.dev/) |
| **Métricas & Analytics** | `@vercel/analytics` & `@vercel/speed-insights` |
| **Deploy & Hosting** | [Vercel](https://vercel.com/) |

---

## 📂 Estrutura do Projeto

```text
portfolio-next/
├── app/
│   ├── favicon.ico / icon.svg / apple-icon.png
│   ├── globals.css          # Configurações globais, design tokens e utilitários
│   ├── layout.tsx           # Fontes, metadados globais, JSON-LD (Schema.org) e Analytics
│   ├── opengraph-image.tsx  # Geração dinâmica da imagem OpenGraph
│   └── page.tsx             # Composição das 5 seções principais
├── components/
│   ├── Header.tsx           # Navegação fixa, indicador de seção ativa e menu responsivo
│   ├── Hero.tsx             # Seção 01: Apresentação de impacto (Navy / Lime)
│   ├── Projects.tsx         # Seção 02: Catálogo interativo com filtros e cards geométricos
│   ├── Method.tsx           # Seção 03: Processo de engenharia e arquitetura
│   ├── About.tsx            # Seção 04: Trajetória profissional, stack e hobbies
│   ├── Contact.tsx          # Seção 05: Ação direta com cópia de e-mail e canais
│   ├── SectionCut.tsx       # Detalhe visual de corte geométrico entre seções
│   ├── ContrastChecker.tsx  # Utilitário de checagem e monitoramento de contraste (A11y)
│   └── ScrollRestore.tsx    # Restauração e gestão suave de rolagem
├── data/
│   └── projects.ts          # Definição e catálogo tipado dos projetos
├── lib/
│   ├── site.ts              # Constantes de ambiente e URL base
│   └── useReveal.ts         # Hook customizado de scroll reveal com detecção de redução de movimento
├── public/                  # Ativos estáticos e manifestos
└── package.json             # Dependências e scripts de desenvolvimento
```

---

## 💻 Como Rodar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão 18.18+ ou superior recomendada)
- Gerenciador de pacotes `npm`, `yarn` ou `pnpm`

### Passo a passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/Coelho-G-Dev/portfolio-next.git
   cd portfolio-next
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

4. Acesse no navegador:
   ```text
   http://localhost:3000
   ```

### Scripts disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor local de desenvolvimento |
| `npm run build` | Compila e otimiza a aplicação para produção |
| `npm run start` | Inicia a aplicação após o build de produção |
| `npm run lint` | Executa a verificação estática de código com ESLint/Next Lint |

---

## 🌐 Deploy

O projeto está configurado para deploy contínuo na **[Vercel](https://vercel.com/)**. Cada push realizado na branch principal dispara automaticamente uma nova compilação com prévias de build e testes de regressão.

Link de produção ativo:  
👉 **[portfolio-next-flax-seven.vercel.app](https://portfolio-next-flax-seven.vercel.app)**

---

## 📬 Vamos Conversar?

Estou sempre aberto a novos desafios, trocas técnicas e oportunidades na área de desenvolvimento back-end.

📍 **São Luís, MA · Brasil 🇧🇷**

<p align="left">
  <a href="mailto:gabrielbiellosousa@gmail.com">
    <img src="https://img.shields.io/badge/E--mail-gabrielbiellosousa%40gmail.com-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email" />
  </a>&nbsp;
  <a href="https://www.linkedin.com/in/gabriel-coelho-7184a32a3/" target="_blank">
    <img src="https://img.shields.io/badge/LinkedIn-Gabriel_Coelho-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn" />
  </a>&nbsp;
  <a href="https://github.com/Coelho-G-Dev" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-Coelho--G--Dev-181717?style=for-the-badge&logo=github&logoColor=white" alt="GitHub" />
  </a>
</p>

---

<p align="center">
  <sub>Licenciado sob a <a href="LICENSE">Licença MIT</a>. Sinta-se à vontade para se inspirar neste projeto para criar o seu próprio portfólio!</sub>
</p>

