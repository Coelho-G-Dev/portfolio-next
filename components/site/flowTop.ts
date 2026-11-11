// Topo do elemento no documento pela cadeia de offsetTop. offsetTop ignora
// transformações (a escala da Cortina, o y do foco ao chegar); um capítulo
// grudado, porém, entra pela posição grudada: para a posição em fluxo, use
// flowTop/flowTops.
export function docTop(el: HTMLElement): number {
  let y = 0;
  for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
  return y;
}

// Topos em fluxo de vários elementos de uma vez. O capítulo de cada um pode
// estar grudado (o refresh de um gatilho vem a qualquer momento, inclusive no
// cortina:relayout, que sai com os capítulos já grudados): tira o sticky dos
// capítulos grudados por um instante, sem pintura no meio, e mede todos numa
// passada só (um layout, não um por elemento). static, e não relative:
// relative ainda deslocaria o capítulo pelo top (--stick-top).
export function flowTops(els: readonly HTMLElement[]): number[] {
  const stuck = new Map<HTMLElement, string>();
  for (const el of els) {
    const chapter = el.closest<HTMLElement>("[data-chapter]");
    if (chapter?.hasAttribute("data-stick") && !stuck.has(chapter)) stuck.set(chapter, chapter.style.position);
  }
  for (const chapter of stuck.keys()) chapter.style.position = "static";
  const ys = els.map(docTop);
  for (const [chapter, prev] of stuck) chapter.style.position = prev;
  return ys;
}

export function flowTop(el: HTMLElement): number {
  return flowTops([el])[0];
}

// Chegada inicial: a URL já contém o destino; não cria histórico nem anima.
// As portas cuidam do próprio hash e de sua animação de entrada.
export function arriveAtHash(hash: string): boolean {
  if (!hash.startsWith("#")) return false;
  let id: string;
  try { id = decodeURIComponent(hash.slice(1)); } catch { return false; }
  if (!id || id.startsWith("porta-")) return false;
  const target = document.getElementById(id);
  if (!target) return false;
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  window.scrollTo({ top: Math.max(0, flowTop(target) - margin), behavior: "instant" });
  const focus = target.querySelector<HTMLElement>("h1, h2") ?? target;
  if (!focus.hasAttribute("tabindex")) focus.setAttribute("tabindex", "-1");
  focus.focus({ preventScroll: true });
  return true;
}

// Âncora para cima até um capítulo grudado: o navegador mede o destino onde
// ele está grudado agora (por baixo das folhas seguintes) e para no meio do
// caminho. Rola até a posição em fluxo, respeitando o scroll-margin-top, e faz
// o resto do que a âncora faria: uma entrada no histórico (estado null, como a
// do navegador; a mesma âncora de novo não duplica a entrada) e o foco no
// destino, para o próximo Tab seguir dali. O foco vai para o título
// (`focusEl`), não para a seção inteira: a guarda da Cortina centralizaria uma
// seção mais alta que a tela. "auto" segue o scroll-behavior do CSS (suave, ou
// instantâneo com movimento reduzido).
export function scrollToFlow(target: HTMLElement, focusEl: HTMLElement = target): void {
  const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
  window.scrollTo({ top: Math.max(0, flowTop(target) - margin), behavior: "auto" });
  if (target.id) {
    const hash = "#" + target.id;
    if (location.hash === hash) history.replaceState(null, "", hash);
    else history.pushState(null, "", hash);
  }
  if (!focusEl.hasAttribute("tabindex")) focusEl.setAttribute("tabindex", "-1");
  focusEl.focus({ preventScroll: true });
}

// Todas as âncoras da página (#algo) dentro de `root` passam por scrollToFlow:
// para baixo dá no mesmo que a do navegador, para cima chega de fato ao
// destino. Um ouvinte só, na janela: roda depois dos onClick do React (que
// ficam no document), então quem já tratou o clique (defaultPrevented) fica
// com ele. Clique com modificador ou outro botão segue normal (nova aba,
// janela). O foco vai ao título do destino. Devolve a limpeza.
export function followAnchors(root: HTMLElement): () => void {
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const link = e.target instanceof Element ? e.target.closest<HTMLAnchorElement>('a[href^="#"]') : null;
    if (!link || !root.contains(link)) return;
    let id: string;
    try {
      id = decodeURIComponent(link.getAttribute("href")!.slice(1));
    } catch {
      return;
    }
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    scrollToFlow(target, target.querySelector<HTMLElement>("h1, h2") ?? target);
  };
  window.addEventListener("click", onClick);
  return () => window.removeEventListener("click", onClick);
}
