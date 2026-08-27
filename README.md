# Gabriel Coelho — Portfólio

Refatoração completa do portfólio em **Next.js 15 + TypeScript + Tailwind**, seguindo o mockup de referência (identidade "color cuts" com 5 seções em blocos de cor sólida).

## Rodar localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`. O build de produção (`npm run build`) precisa de acesso à internet pra baixar as fontes do Google Fonts (Archivo, Fraunces, JetBrains Mono) na primeira vez — depois disso elas ficam em cache local.

## O que foi adaptado do mockup de referência

- Conteúdo trocado pro seu real: nome, bio, os 3 projetos (BuscaSUS, Guia Maranhão, API Financeira Inteligente), stack.
- Localização ajustada pra São Luís/MA.
- Os tiles de projeto usam formas geométricas abstratas nas cores da marca (não são screenshots) — se quiser, dá pra trocar por prints reais dos projetos depois.
- A seção "Fora da tela" (Sobre mim) ficou com um placeholder — não inventei hobbies que você não me contou. É só substituir o texto em `components/About.tsx`.
- Textos "Corte limpo"/badge do Hero, e as frases-chave ("Código com presença", "A arquitetura é o meio", "Tem uma boa ideia?") foram mantidos/adaptados porque encaixam bem na sua área também — mas são fáceis de trocar se quiser algo 100% autoral.

## Estrutura

```
app/
  layout.tsx      # fontes (Archivo, Fraunces, JetBrains Mono) + metadata
  page.tsx        # monta as 5 seções
  globals.css
components/
  Header.tsx      # nav fixa com mix-blend-difference
  Hero.tsx        # seção 1/5 — navy
  Projects.tsx    # seção 2/5 — laranja, com filtro por categoria
  Method.tsx      # seção 3/5 — azul
  About.tsx       # seção 4/5 — lima
  Contact.tsx     # seção 5/5 — lavanda
data/
  projects.ts     # conteúdo dos projetos — edite aqui pra adicionar/mudar projetos
lib/
  useReveal.ts    # hook de scroll-reveal (respeita prefers-reduced-motion)
```

## Próximos passos sugeridos

- Preencher "Fora da tela" com hobbies reais.
- Trocar os tiles geométricos por screenshots reais dos projetos (opcional).
- Ajustar `data/projects.ts` conforme os projetos evoluem.
- Rodar `npm run lint` antes de commitar.
