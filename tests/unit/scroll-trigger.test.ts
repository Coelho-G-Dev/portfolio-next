import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const fake = { name: "ScrollTrigger" };
let imports = 0;

// Módulos novos a cada teste: o cache de lib/scrollTrigger e o gsap que ele
// importa são os desta rodada.
async function load() {
  const gsap = (await import("gsap")).default;
  const register = vi.spyOn(gsap, "registerPlugin").mockImplementation(() => {});
  const mod = await import("@/lib/scrollTrigger");
  return { ...mod, register };
}

describe("loadScrollTrigger", () => {
  beforeEach(() => {
    vi.resetModules();
    imports = 0;
  });
  afterEach(() => {
    vi.doUnmock("gsap/ScrollTrigger");
    vi.restoreAllMocks();
  });

  it("se o import falhar, a próxima chamada tenta de novo; depois fica em cache e registra uma vez só", async () => {
    vi.doMock("gsap/ScrollTrigger", () => {
      imports++;
      if (imports === 1) throw new Error("rede caiu");
      return { ScrollTrigger: fake };
    });
    const { loadScrollTrigger, register } = await load();

    await expect(loadScrollTrigger()).rejects.toThrow();
    await expect(loadScrollTrigger()).resolves.toBe(fake);
    await expect(loadScrollTrigger()).resolves.toBe(fake);
    expect(imports).toBe(2);
    expect(register).toHaveBeenCalledTimes(1);
    expect(register).toHaveBeenCalledWith(fake);
  });

  it("o nome do evento de nova medição é fixo", async () => {
    const { CORTINA_RELAYOUT } = await load();
    expect(CORTINA_RELAYOUT).toBe("cortina:relayout");
  });
});
