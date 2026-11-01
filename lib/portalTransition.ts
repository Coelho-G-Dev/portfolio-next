// Transição "portal" das portas de projetos: a moldura da porta aberta e o
// painel compartilham um view-transition-name, e o navegador interpola um no
// outro num movimento só (sem o quadro vazio entre "portas" e "painel").

type ViewTransitionDoc = {
  startViewTransition?: (update: () => void) => unknown;
};

// Roda `update` dentro de uma View Transition quando o navegador oferece e o
// movimento não é reduzido; senão, troca na hora. `update` sempre roda uma vez.
export function runPortal(
  update: () => void,
  opts: { reduced: boolean; doc?: ViewTransitionDoc },
): "view-transition" | "instant" {
  const doc =
    opts.doc ?? (typeof document !== "undefined" ? (document as ViewTransitionDoc) : {});
  if (!opts.reduced && typeof doc.startViewTransition === "function") {
    let ran = false;
    try {
      doc.startViewTransition(() => {
        ran = true;
        update();
      });
      return "view-transition";
    } catch {
      if (!ran) update();
      return "instant";
    }
  }
  update();
  return "instant";
}

// Quanto rolar (scrollBy) para o topo do elemento novo ficar onde o antigo
// estava, sem nunca subir acima de `minTop` na janela.
export function alignDelta(before: number, after: number, minTop: number): number {
  return after - Math.max(before, minTop);
}
