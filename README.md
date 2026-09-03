# Gabriel Coelho — Portfólio

Refatoração completa do portfólio em **Next.js 15 + TypeScript + Tailwind**, seguindo o mockup de referência (identidade "color cuts" com 5 seções em blocos de cor sólida).

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`. O build de produção (`npm run build`) precisa de acesso à internet pra baixar as fontes do Google Fonts (Archivo, Fraunces, JetBrains Mono) na primeira vez — depois disso elas ficam em cache local.

## ⚠️ Antes do próximo deploy

- [x] Link do GitHub da "API Financeira Inteligente" confirmado.
- [x] Domínio configurado: `https://portfolio-next-flax-seven.vercel.app`.
- [ ] Se trocar pra um domínio próprio depois, atualizar `metadataBase` e o JSON-LD `url` em `app/layout.tsx`.
- [ ] Rodar `npm run build` localmente uma vez (baixa as fontes do Google e valida tudo).
- [ ] Rodar `npm run lint`.

## O que foi adaptado do mockup de referência

- Conteúdo trocado pro seu real: nome, bio, os 4 projetos (BuscaSUS, Guia Maranhão, API Financeira Inteligente, AuthGuard), stack.
- Localização ajustada pra São Luís/MA.
- Os tiles de projeto usam formas geométricas abstratas nas cores da marca (não são screenshots) — se quiser, dá pra trocar por prints reais dos projetos depois.
- "Fora da tela" (seção Sobre) preenchido com hobbies reais (powerlifting, xadrez).
- Textos "Corte limpo"/badge do Hero, e as frases-chave ("Código com presença", "A arquitetura é o meio", "Tem uma boa ideia?") foram mantidos/adaptados porque encaixam bem na sua área também — mas são fáceis de trocar se quiser algo 100% autoral.
- Header com fundo sólido fixo (não usa mais blend de cor com o conteúdo por trás).
- Hover animado nos nomes de projeto e nos passos do Método, seguindo o mesmo motivo visual dos "cortes" entre seções.

## Estrutura

```
app/
  layout.tsx           # fontes, metadata, JSON-LD de pessoa (SEO)
  page.tsx             # monta as 5 seções
  opengraph-image.tsx  # imagem gerada automaticamente pro compartilhamento (WhatsApp/LinkedIn)
  favicon.ico / icon.svg / apple-icon.png
  globals.css
components/
  Header.tsx      # nav fixa (fundo sólido), menu mobile, seção ativa destacada
  Hero.tsx        # seção 1/5 — navy
  Projects.tsx    # seção 2/5 — laranja, filtro por categoria, hover animado
  Method.tsx      # seção 3/5 — azul, hover animado nos passos
  About.tsx       # seção 4/5 — lima
  Contact.tsx     # seção 5/5 — lavanda
  SectionCut.tsx  # losango + rótulo decorativo nas costuras entre seções
data/
  projects.ts     # conteúdo dos projetos — edite aqui pra adicionar/mudar projetos
lib/
  useReveal.ts    # hook de scroll-reveal (respeita prefers-reduced-motion)
```

## Deploy

Sendo Next.js, o caminho mais direto é a [Vercel](https://vercel.com) (mesmos criadores do framework, zero configuração): conecta o repositório Git e o deploy acontece automaticamente a cada push. Alternativas: Netlify ou Railway também suportam Next.js nativamente.

