import { expect, test } from "@playwright/test";
import { redesignCopy } from "../../lib/i18n/redesign";

const pt = redesignCopy.pt;
const en = redesignCopy.en;

test.beforeEach(async ({ page }) => {
  // Só na primeira visita: o teste de idioma recarrega e precisa manter a escolha.
  await page.addInitScript(() => localStorage.getItem("preferred-language") || localStorage.setItem("preferred-language", "pt"));
  await page.goto("/redesign");
});

test("abre sem erros no console", async ({ page }) => {
  const errors: string[] = [];
  // Antivírus que injetam scripts no navegador (o Kaspersky desta máquina) não são erro do site.
  const foreign = /kaspersky-labs\.com/;
  page.on("console", (m) => m.type() === "error" && !foreign.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(pt.hero.titleSr);
  expect(errors).toEqual([]);
});

test("os links do topo levam à seção certa", async ({ page }) => {
  for (const [name, id] of [
    [pt.nav.work, "projetos"],
    [pt.nav.contact, "contato"],
  ] as const) {
    await page.locator(".rd-nav").getByRole("link", { name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id} h2`).first()).toBeInViewport();
  }
});

test("o CTA do hero leva aos projetos", async ({ page }) => {
  await page.locator(".rd-hero__foot").getByRole("link", { name: pt.hero.cta }).click();
  await expect(page.locator("#projetos h2").first()).toBeInViewport();
});

test("troca PT ↔ EN e guarda a escolha", async ({ page }) => {
  await page.getByRole("button", { name: pt.nav.langSwitchAria }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(en.hero.titleSr);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName(en.hero.titleSr);
});

test("nenhuma rolagem horizontal", async ({ page }) => {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});

test("a página não é indexada", async ({ page }) => {
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});
