import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HASH_INPUT_BOOTSTRAP } from "@/lib/hashArrivalBootstrap";

describe("input anterior à hidratação", () => {
  beforeEach(() => { history.replaceState(null, "", "/#contato"); delete window.__portfolioHashInput; });
  afterEach(() => {
    // O primeiro input limpa os quatro ouvintes do bootstrap.
    window.dispatchEvent(new Event("pointerdown"));
    delete window.__portfolioHashInput;
    history.replaceState(null, "", "/");
  });
  it.each(["wheel", "touchstart", "keydown", "pointerdown"])("registra %s antes de o React montar", event => {
    window.eval(HASH_INPUT_BOOTSTRAP);
    expect(window.__portfolioHashInput).toBeUndefined();
    window.dispatchEvent(new Event(event));
    expect(window.__portfolioHashInput).toBe(true);
    delete window.__portfolioHashInput;
    window.dispatchEvent(new Event(event));
    expect(window.__portfolioHashInput).toBeUndefined();
  });
  it.each(["/", "/#porta-backend"])("não monitora chegada em %s", path => {
    history.replaceState(null, "", path);
    window.eval(HASH_INPUT_BOOTSTRAP);
    window.dispatchEvent(new Event("wheel"));
    expect(window.__portfolioHashInput).toBeUndefined();
  });
});
