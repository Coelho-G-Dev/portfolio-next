import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { arriveAtHash, flowTops, followAnchors } from "@/components/site/flowTop";

describe("arriveAtHash", () => {
  beforeEach(() => {
    document.body.innerHTML = '<section id="contato"><h2>Contato</h2></section>';
    history.replaceState(null, "", "/#contato");
    vi.stubGlobal("scrollTo", vi.fn());
  });
  afterEach(() => { vi.unstubAllGlobals(); history.replaceState(null, "", "/"); });
  it("chega ao título sem criar nova entrada no histórico", () => {
    const length = history.length;
    expect(arriveAtHash("#contato")).toBe(true);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
    expect(document.activeElement).toBe(document.querySelector("h2"));
    expect(history.length).toBe(length);
  });
  it.each(["", "#", "#porta-ia", "#nada", "#%E0"])("ignora %s sem rolar", hash => {
    expect(arriveAtHash(hash)).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
  });
});

// jsdom não tem layout (offsetTop é 0): aqui só a escolha de quais cliques a
// página trata e o que ela faz com eles. A posição é coberta no e2e.
describe("followAnchors", () => {
  let root: HTMLElement;
  let stop: () => void;
  let scrollTo: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    history.replaceState(null, "", "/");
    document.body.innerHTML = `
      <div id="root">
        <div data-chapter="projetos"><section id="projetos"><h2>Projetos</h2></section></div>
        <a id="up" href="#projetos"><span>prova</span></a>
        <a id="nowhere" href="#nao-existe">x</a>
        <a id="ext" href="https://example.com/#projetos">x</a>
      </div>
      <a id="outside" href="#projetos">fora</a>`;
    root = document.getElementById("root")!;
    scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    stop = followAnchors(root);
  });

  afterEach(() => {
    stop();
    vi.unstubAllGlobals();
  });

  const click = (el: Element, init: MouseEventInit = {}) => {
    const e = new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, ...init });
    el.dispatchEvent(e);
    return e;
  };

  it("leva ao destino, cria a entrada no histórico e foca o título", () => {
    const e = click(document.querySelector("#up span")!);
    expect(e.defaultPrevented).toBe(true);
    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(location.hash).toBe("#projetos");
    const h2 = document.querySelector("#projetos h2")!;
    expect(h2.getAttribute("tabindex")).toBe("-1");
    expect(document.activeElement).toBe(h2);
  });

  it("a mesma âncora de novo não cria outra entrada", () => {
    click(document.getElementById("up")!);
    const length = history.length;
    click(document.getElementById("up")!);
    expect(history.length).toBe(length);
  });

  it.each([
    ["Ctrl", { ctrlKey: true }],
    ["Meta", { metaKey: true }],
    ["Shift", { shiftKey: true }],
    ["Alt", { altKey: true }],
    ["botão do meio", { button: 1 }],
  ])("clique com %s segue normal", (_, init) => {
    const e = click(document.getElementById("up")!, init);
    expect(e.defaultPrevented).toBe(false);
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("clique já tratado por outro (defaultPrevented) fica com quem tratou", () => {
    const link = document.getElementById("up")!;
    link.addEventListener("click", (e) => e.preventDefault());
    click(link);
    expect(scrollTo).not.toHaveBeenCalled();
    expect(location.hash).toBe("");
  });

  it("ignora destino inexistente, link para outra página e link fora da raiz", () => {
    for (const id of ["nowhere", "ext", "outside"]) {
      const e = click(document.getElementById(id)!);
      if (id !== "nowhere") expect(e.defaultPrevented).toBe(false);
    }
    expect(scrollTo).not.toHaveBeenCalled();
  });

  it("parar remove o ouvinte", () => {
    stop();
    const e = click(document.getElementById("up")!);
    expect(e.defaultPrevented).toBe(false);
  });
});

describe("flowTops", () => {
  it("devolve o capítulo grudado ao position de antes", () => {
    document.body.innerHTML = `<div data-chapter="a" data-stick style="position: sticky"><p id="a1"></p><p id="a2"></p></div>`;
    const chapter = document.querySelector<HTMLElement>("[data-chapter]")!;
    expect(flowTops([document.getElementById("a1")!, document.getElementById("a2")!])).toEqual([0, 0]);
    expect(chapter.style.position).toBe("sticky");
  });
});
