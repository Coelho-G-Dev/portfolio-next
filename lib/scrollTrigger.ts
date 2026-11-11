import gsap from "gsap";
import type { ScrollTrigger } from "gsap/ScrollTrigger";

// Disparado na janela depois de a Cortina medir de novo os capítulos (altura
// mudou, fontes carregaram). Os trechos presos ouvem e refazem os próprios
// gatilhos.
export const CORTINA_RELAYOUT = "cortina:relayout";

let pending: Promise<typeof ScrollTrigger> | null = null;

// O ScrollTrigger sob demanda, fora do First Load: um import dinâmico só,
// registrado no gsap uma vez e só no cliente (no servidor não há janela para
// medir). Se o import falhar, a próxima chamada tenta de novo.
export function loadScrollTrigger(): Promise<typeof ScrollTrigger> {
  if (typeof window === "undefined") return Promise.reject(new Error("ScrollTrigger só roda no cliente"));
  pending ??= import("gsap/ScrollTrigger").then(
    (mod) => {
      gsap.registerPlugin(mod.ScrollTrigger);
      return mod.ScrollTrigger;
    },
    (err: unknown) => {
      pending = null;
      throw err;
    },
  );
  return pending;
}
