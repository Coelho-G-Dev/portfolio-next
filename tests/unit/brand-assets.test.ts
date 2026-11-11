import { existsSync, readFileSync, statSync } from "node:fs";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { siteCopy } from "../../lib/i18n/site";

describe("arquivos de marca", () => {
  it("o ícone é o rei ébano no marfim, desenhado como forma", () => {
    const svg = readFileSync("app/icon.svg", "utf8");
    expect(svg).toContain('viewBox="0 0 512 512"');
    for (const color of ["#F4EEE3", "#0E0F13", "#8A6A4A"]) expect(svg).toContain(color);
    expect(svg).toMatch(/<path\b/);
    expect(svg).not.toMatch(/<text\b/i);
    expect(svg).not.toMatch(/#12222D|#EAF35B/i);
  });

  it("apple-icon tem 180 px e nenhum alfa", async () => {
    const metadata = await sharp("app/apple-icon.png").metadata();
    expect(metadata.width).toBe(180); expect(metadata.height).toBe(180);
    expect(metadata.hasAlpha).toBe(false);
    const { data, info } = await sharp("app/apple-icon.png").raw().toBuffer({ resolveWithObject: true });
    for (const [x, y] of [[0, 0], [179, 0], [0, 179], [179, 179]]) {
      const start = (y * info.width + x) * info.channels;
      expect([...data.subarray(start, start + 3)]).toEqual([244, 238, 227]);
    }
  });

  it("favicon.ico traz 16, 32 e 48 px", async () => {
    const ico = readFileSync("app/favicon.ico");
    expect(ico.readUInt16LE(0)).toBe(0); expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    expect([ico[6], ico[22], ico[38]]).toEqual([16, 32, 48]);
    for (const [index, size] of [16, 32, 48].entries()) {
      const entry = 6 + 16 * index;
      expect(ico[entry + 1]).toBe(size);
      const length = ico.readUInt32LE(entry + 8), offset = ico.readUInt32LE(entry + 12);
      expect(offset + length).toBeLessThanOrEqual(ico.length);
      const metadata = await sharp(ico.subarray(offset, offset + length)).metadata();
      expect(metadata.format).toBe("png"); expect(metadata.width).toBe(size); expect(metadata.height).toBe(size);
    }
  });

  it("packIco monta um ICO válido", async () => {
    const { packIco } = await import("../../tools/brand-assets.mjs");
    const pngs = [];
    for (const size of [16, 32]) {
      const data = await sharp({ create: { width: size, height: size, channels: 4, background: "#F4EEE3" } }).png().toBuffer();
      pngs.push({ size, data });
    }
    const ico = packIco(pngs);
    expect(ico.readUInt16LE(0)).toBe(0); expect(ico.readUInt16LE(2)).toBe(1); expect(ico.readUInt16LE(4)).toBe(2);
    let nextOffset = 6 + 16 * 2;
    for (const [index, png] of pngs.entries()) {
      const entry = 6 + 16 * index;
      expect(ico[entry]).toBe(png.size); expect(ico[entry + 1]).toBe(png.size);
      expect(ico.readUInt32LE(entry + 8)).toBe(png.data.length);
      expect(ico.readUInt32LE(entry + 12)).toBe(nextOffset);
      expect(ico.subarray(nextOffset, nextOffset + png.data.length)).toEqual(png.data);
      nextOffset += png.data.length;
    }
    expect(ico.length).toBe(nextOffset);
  });

  it("o cartão usa o texto do hero em português", async () => {
    const { cardModel } = await import("../../tools/brand-assets.mjs");
    expect(cardModel()).toEqual({
      label: siteCopy.pt.hero.label,
      name: "Gabriel Coelho",
      line: "Da tela ao banco, com back-ends que não perdem mensagem.",
      alt: "Gabriel Coelho, desenvolvedor full-stack em São Luís, MA, ao lado do personagem 3D dele.",
    });
  });

  it("o cartão tem 1200×630 e até 300 KB", async () => {
    const { cardModel } = await import("../../tools/brand-assets.mjs");
    const path = "app/opengraph-image.png";
    const metadata = await sharp(path).metadata();
    expect(metadata.format).toBe("png"); expect(metadata.width).toBe(1200); expect(metadata.height).toBe(630);
    expect(statSync(path).size).toBeLessThanOrEqual(300 * 1024);
    expect(readFileSync("app/opengraph-image.alt.txt", "utf8")).toBe(cardModel().alt);
    expect(existsSync("app/opengraph-image.tsx")).toBe(false);
  });

  it("o cartão tem o rótulo em uma linha e nenhuma emenda onde o poster começa", async () => {
    const { data, info } = await sharp("app/opengraph-image.png").removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const pixel = (x: number, y: number) => [...data.subarray((y * info.width + x) * 3, (y * info.width + x) * 3 + 3)];
    // Faixa onde ficaria a segunda linha do rótulo: nenhum pixel de texto.
    let dark = 0;
    for (let y = 138; y < 168; y++) for (let x = 60; x < 130; x++) if (pixel(x, y)[0] < 120) dark++;
    expect(dark).toBe(0);
    // Colunas vizinhas em volta de x=184 não dão degrau visível (linhas abaixo do texto).
    for (const y of [560, 600]) {
      for (let x = 150; x < 300; x++) {
        const a = pixel(x, y), b = pixel(x + 1, y);
        const step = Math.max(...a.map((value, channel) => Math.abs(value - b[channel])));
        expect(step, `x=${x} y=${y}`).toBeLessThanOrEqual(5);
      }
    }
  });
});
