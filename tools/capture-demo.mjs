// Captura duas telas do demo público do Cidade Energia (390×844) e converte
// para WebP (480px de largura, qualidade 80) em public/projects/.
// Se o demo estiver inacessível (ex.: sem rede), encerra sem erro fatal.
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, unlinkSync } from "node:fs";

const OUT_DIR = "public/projects";
const DEMO_URL = "https://cidade-energia.vercel.app";

let browser;
try {
  mkdirSync(OUT_DIR, { recursive: true });
  browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(DEMO_URL, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(1000);

  const png1 = `${OUT_DIR}/cidade-energia-1.png`;
  const webp1 = `${OUT_DIR}/cidade-energia-1.webp`;
  await page.screenshot({ path: png1 });
  execFileSync("ffmpeg", ["-y", "-i", png1, "-vf", "scale=480:-1", "-quality", "80", webp1]);
  unlinkSync(png1);

  // Tenta abrir o simulador ou uma trilha para a segunda tela.
  const simLink = page.locator("a, button").filter({ hasText: /simulador|trilha|começar|entrar/i }).first();
  if ((await simLink.count()) > 0) {
    await simLink.click().catch(() => {});
    await page.waitForTimeout(1000);
  }
  const png2 = `${OUT_DIR}/cidade-energia-2.png`;
  const webp2 = `${OUT_DIR}/cidade-energia-2.webp`;
  await page.screenshot({ path: png2 });
  execFileSync("ffmpeg", ["-y", "-i", png2, "-vf", "scale=480:-1", "-quality", "80", webp2]);
  unlinkSync(png2);

  console.log("Telas capturadas em", OUT_DIR);
} catch (err) {
  console.warn("Demo inacessível, seguindo sem capturas:", err?.message ?? err);
} finally {
  await browser?.close();
}
