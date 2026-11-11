// Captura duas telas de um demo (390×844) e converte para WebP (480px de
// largura, qualidade 80) em public/projects/<nome>-<n>.webp.
// Uso: node tools/capture-demo.mjs [--url <url> --name <slug> [--url2 <url>]]
// --url2: endereço da segunda tela (sem ele, tenta clicar num link de navegação).
// Sem argumentos, captura o demo público do Cidade Energia.
// Se o demo estiver inacessível (ex.: sem rede), encerra sem erro fatal.
import { chromium } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdirSync, unlinkSync } from "node:fs";

const OUT_DIR = "public/projects";

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}
const DEMO_URL = arg("--url", "https://cidade-energia.vercel.app");
const URL2 = arg("--url2", "");
const NAME = arg("--name", "cidade-energia");

let browser;
try {
  mkdirSync(OUT_DIR, { recursive: true });
  browser = await chromium.launch({ channel: "chrome" });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  await page.goto(DEMO_URL, { waitUntil: "load", timeout: 30000 });
  await page.waitForTimeout(2500);

  const png1 = `${OUT_DIR}/${NAME}-1.png`;
  const webp1 = `${OUT_DIR}/${NAME}-1.webp`;
  await page.screenshot({ path: png1 });
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", png1, "-vf", "scale=480:-1", "-quality", "80", webp1]);
  unlinkSync(png1);

  // Segunda tela: endereço dado em --url2, ou um link de navegação.
  if (URL2) {
    await page.goto(URL2, { waitUntil: "load", timeout: 30000 });
    await page.waitForTimeout(1500);
  } else {
    const simLink = page.locator("a, button").filter({ hasText: /simulador|trilha|começar|entrar/i }).first();
    if ((await simLink.count()) > 0) {
      await simLink.click().catch(() => {});
      await page.waitForTimeout(1000);
    }
  }
  // Listas que o back-end preenche devagar (ex.: os bairros de São Luís): espera
  // sumir o texto "Carregando" da página e das opções dos selects. Se nunca
  // carregar, segue com a tela como estiver.
  await page
    .waitForFunction(
      () => {
        const loading = /carregando|loading/i;
        if (loading.test(document.body.innerText)) return false;
        return Array.from(document.querySelectorAll("select")).every(
          (s) => s.options.length > 1 && !Array.from(s.options).some((o) => loading.test(o.text)),
        );
      },
      null,
      { timeout: 45000, polling: 500 },
    )
    .then(() => page.waitForTimeout(500))
    .catch(() => console.warn("A segunda tela ainda estava carregando; capturando assim mesmo."));
  // Verificação do Cloudflare (Turnstile), se houver: espera ela concluir, sem insistir.
  await page
    .waitForFunction(
      () => {
        const token = document.querySelector('input[name="cf-turnstile-response"]');
        return !token || token.value !== "";
      },
      null,
      { timeout: 15000, polling: 500 },
    )
    .then(() => page.waitForTimeout(1000))
    .catch(() => console.warn("A verificação do Cloudflare não concluiu; capturando assim mesmo."));
  const png2 = `${OUT_DIR}/${NAME}-2.png`;
  const webp2 = `${OUT_DIR}/${NAME}-2.webp`;
  await page.screenshot({ path: png2 });
  execFileSync("ffmpeg", ["-loglevel", "error", "-y", "-i", png2, "-vf", "scale=480:-1", "-quality", "80", webp2]);
  unlinkSync(png2);

  console.log("Telas capturadas em", OUT_DIR);
} catch (err) {
  console.warn("Demo inacessível, seguindo sem capturas:", err?.message ?? err);
} finally {
  await browser?.close();
}
