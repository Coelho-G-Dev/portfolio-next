import { describe, expect, it } from "vitest";
import { cameraTarget, type DOMRectLike } from "@/lib/doorCamera";

// A abertura chega ampliada k vezes em torno do centro do palco. Ela tem arco no
// topo: semicírculo de raio largura/2 (border-radius 999px 999px 0 0). O retângulo
// do palco ampliado em `m` cabe nela inteiro?
function covers(k: number, stage: DOMRectLike, reveal: DOMRectLike, m = 1) {
  const a = (m * stage.width) / 2;
  const b = (m * stage.height) / 2;
  const r = (k * reveal.width) / 2;
  const h = (k * reveal.height) / 2;
  const cy = -(h - r); // centro do arco, acima do centro (y para baixo)
  const eps = 1e-6;
  if (a > r + eps || b > h + eps) return false;
  const cornerY = -b;
  if (cornerY >= cy) return true; // canto na parte reta da abertura
  return Math.hypot(a, cornerY - cy) <= r + eps;
}

describe("câmera da porta", () => {
  it("centraliza a abertura e para quando a miniatura chega à escala 1", () => {
    const t = cameraTarget(
      { left: 0, top: 60, width: 1440, height: 840 },
      { left: 600, top: 200, width: 180, height: 300 },
      1200,
    );
    expect(t.x).toBe(720 - 690);
    expect(t.y).toBe(480 - 350);
    // a abertura passa um pouco do palco: o batente fica fora da tela na chegada
    expect(t.k).toBeCloseTo((1.05 * 1440) / 180, 5);
    expect(t.z).toBeCloseTo(1200 * (1 - 1 / t.k), 5);
    expect(1200 / (1200 - t.z)).toBeCloseTo(t.k, 5); // escala de perspectiva no fim = k
  });

  it("k nunca fica abaixo de 3 (abertura larga demais para o palco)", () => {
    expect(
      cameraTarget({ left: 0, top: 0, width: 390, height: 700 }, { left: 0, top: 0, width: 300, height: 500 }, 1200).k,
    ).toBe(3);
  });

  it("celular alto (palco 358×844, abertura 167×321): o arco cobre os cantos de cima do palco", () => {
    const stage = { left: 16, top: 0, width: 358, height: 844 };
    const reveal = { left: 111.5, top: 300, width: 167, height: 321 };
    // Só a regra da largura dava 3, e o arco deixava cunhas de madeira nos cantos.
    expect(covers(3, stage, reveal)).toBe(false);
    const { k } = cameraTarget(stage, reveal, 1200);
    expect(covers(k, stage, reveal, 1.05)).toBe(true); // com a folga de 5%
    expect(covers(k * 0.99, stage, reveal, 1.05)).toBe(false); // e não mais que isso
  });

  it("abertura mais alta que duas larguras num palco estreito e alto também fica coberta", () => {
    // Altura da abertura > 2 × largura: o centro do arco sobe mais rápido que o raio cresce.
    const stage = { left: 0, top: 0, width: 200, height: 900 };
    const reveal = { left: 0, top: 0, width: 40, height: 100 };
    const { k } = cameraTarget(stage, reveal, 1200);
    expect(covers(k, stage, reveal, 1.05)).toBe(true);
    expect(covers(k * 0.99, stage, reveal, 1.05)).toBe(false);
  });

  it("palco baixo e largo: a largura manda e o arco já cobre", () => {
    const stage = { left: 0, top: 0, width: 1440, height: 400 };
    const reveal = { left: 0, top: 0, width: 180, height: 300 };
    expect(cameraTarget(stage, reveal, 1200).k).toBeCloseTo((1.05 * 1440) / 180, 5);
  });
});
