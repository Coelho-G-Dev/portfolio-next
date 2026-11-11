import { uncoverScroll } from "@/lib/cortina";

// Foco nunca fica sob a folha seguinte (WCAG 2.4.11). O navegador traz o
// elemento focado à tela supondo que ele anda junto com a rolagem; num
// capítulo grudado ele não anda: a rolagem passa do ponto e o capítulo
// seguinte o cobre (ou o navegador nem rola, porque o vê "na tela"). Quando a
// rolagem do foco assenta, confere e, se preciso, rola até o trecho livre.
//
// `tops` são os topos dos capítulos em fluxo (medidos pela Cortina); `paused`
// suspende a correção (as portas cuidam da própria rolagem). Devolve a limpeza.
export function watchFocus(
  root: HTMLElement,
  chapters: HTMLElement[],
  tops: () => number[],
  paused: () => boolean,
): () => void {
  // Folhas que sobem por cima do capítulo i: os seguintes e o rodapé.
  const sheetsAbove = (i: number) =>
    [...chapters.slice(i + 1), root.querySelector<HTMLElement>(".s-footer")].filter((s): s is HTMLElement => !!s);

  const uncover = (target: HTMLElement) => {
    const i = chapters.findIndex((c) => c.contains(target));
    if (i < 0 || paused() || target.closest(OWN_FOCUS_SCROLL)) return;
    const vh = window.innerHeight;
    const r = target.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    let cover = vh;
    for (const sheet of sheetsAbove(i)) {
      const s = sheet.getBoundingClientRect();
      if (s.bottom > 0) cover = Math.min(cover, s.top);
    }
    if (r.top >= 0 && r.bottom <= cover + 1) return;
    // Posição do elemento no capítulo, em fluxo (offsetTop ignora a escala).
    // Um ancestral fixo (sem offsetParent) não tem posição em fluxo: desiste.
    const chapter = chapters[i];
    let offset = 0;
    let n: HTMLElement | null = target;
    for (; n && n !== chapter; n = n.offsetParent as HTMLElement | null) offset += n.offsetTop;
    if (n !== chapter) return;
    const chapterTop = tops()[i];
    const top = uncoverScroll(
      { top: chapterTop + offset, height: target.offsetHeight },
      { top: chapterTop, height: chapter.offsetHeight },
      vh,
      i === chapters.length - 1,
    );
    // "auto" segue o scroll-behavior do CSS: suave, ou instantâneo com
    // movimento reduzido.
    window.scrollTo({ top, behavior: "auto" });
  };

  // Só o foco que veio do teclado (:focus-visible): um clique ou toque deixa
  // o foco no controle e a pessoa rola para longe dele de propósito. Espera a
  // rolagem do próprio foco parar (120 ms sem scroll) antes de medir, e
  // desiste se a pessoa mesma rolar ou navegar nesse meio-tempo.
  let focused: HTMLElement | null = null;
  let idle = 0;
  const cancel = () => {
    window.clearTimeout(idle);
    window.removeEventListener("scroll", settle);
    focused = null;
  };
  const settle = () => {
    window.clearTimeout(idle);
    idle = window.setTimeout(() => {
      const target = focused;
      cancel();
      if (target && document.activeElement === target) uncover(target);
    }, 120);
  };
  const onFocusIn = (e: FocusEvent) => {
    const target = e.target;
    if (!(target instanceof HTMLElement) || !fromKeyboard(target)) return;
    focused = target;
    window.addEventListener("scroll", settle, { passive: true });
    settle();
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (focused && SCROLL_KEYS.has(e.key)) cancel();
  };
  const onClick = (e: MouseEvent) => {
    if (focused && e.target instanceof Element && e.target.closest('a[href^="#"]')) cancel();
  };
  const onUserScroll = () => {
    if (focused) cancel();
  };

  root.addEventListener("focusin", onFocusIn);
  window.addEventListener("wheel", onUserScroll, { passive: true });
  window.addEventListener("touchstart", onUserScroll, { passive: true });
  window.addEventListener("hashchange", onUserScroll);
  window.addEventListener("keydown", onKeyDown, true);
  document.addEventListener("click", onClick, true);

  return () => {
    cancel();
    root.removeEventListener("focusin", onFocusIn);
    window.removeEventListener("wheel", onUserScroll);
    window.removeEventListener("touchstart", onUserScroll);
    window.removeEventListener("hashchange", onUserScroll);
    window.removeEventListener("keydown", onKeyDown, true);
    document.removeEventListener("click", onClick, true);
  };
}

// Trechos presos que levam o próprio foco à tela marcam-se com
// data-own-focus enquanto estão ativos (o palco grudado deles não anda com a
// rolagem). Medir aqui a posição em fluxo de algo dentro desse palco daria
// outro destino, e as duas rolagens brigariam.
const OWN_FOCUS_SCROLL = "[data-own-focus]";

// Teclas que rolam a página (o Tab, que move o foco, não está aqui).
const SCROLL_KEYS = new Set(["PageUp", "PageDown", "Home", "End", "ArrowUp", "ArrowDown", " "]);

export function fromKeyboard(el: HTMLElement): boolean {
  try {
    return el.matches(":focus-visible");
  } catch {
    return false; // navegador sem :focus-visible: não arrisca puxar a página
  }
}
