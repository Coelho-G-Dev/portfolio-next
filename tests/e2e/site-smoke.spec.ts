import { expect, test } from "@playwright/test";
import { siteCopy } from "../../lib/i18n/site";

const pt = siteCopy.pt;
const en = siteCopy.en;

test.beforeEach(async ({ page }) => {
  // Analytics e Speed Insights só existem na Vercel; localmente dariam 404.
  await page.route("**/_vercel/**", (r) => r.fulfill({ status: 200, contentType: "application/javascript", body: "" }));
  // Só na primeira visita: o teste de idioma recarrega e precisa manter a escolha.
  await page.addInitScript(() => localStorage.getItem("preferred-language") || localStorage.setItem("preferred-language", "pt"));
  await page.goto("/");
});

test("abre sem erros no console", async ({ page }) => {
  const errors: string[] = [];
  const foreign = /kaspersky-labs\.com/;
  page.on("console", (m) => m.type() === "error" && !foreign.test(m.text()) && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Gabriel Coelho");
  await page.waitForTimeout(1500);
  expect(errors).toEqual([]);
});

test("os links do menu levam à seção certa", async ({ page }, info) => {
  for (const [label, id] of [
    [pt.nav.links[0].label, "projetos"],
    [pt.nav.links[3].label, "contato"],
  ] as const) {
    if (info.project.name === "phone-390") {
      await page.getByRole("button", { name: pt.nav.menu }).click();
    }
    await page.locator("#s-nav-links").getByRole("link", { name: label, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.locator(`#${id} h2`).first()).toBeInViewport();
  }
});

test('"Ver projetos" leva aos projetos', async ({ page }) => {
  const cta = page.locator("#inicio").getByRole("link", { name: pt.hero.seeWork });
  // Rola como uma pessoa: até a base da abertura encostar no pé da tela, onde o
  // botão aparece inteiro e nada o cobre. scrollIntoView não serve aqui: dentro
  // de um capítulo grudado (sticky), o navegador rola além e a Cortina cobre o botão.
  // O botão está inteiro na tela e nada o cobre (é o elemento no ponto central).
  await expect
    .poll(() =>
      cta.evaluate((el) => {
        const opening = document.querySelector<HTMLElement>('[data-chapter="abertura"]')!;
        window.scrollTo({ top: Math.max(0, opening.offsetHeight - window.innerHeight), behavior: "instant" });
        const r = el.getBoundingClientRect();
        return r.bottom <= innerHeight && el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2));
      }),
    )
    .toBe(true);
  // Clique direto no elemento: a rolagem automática do Playwright antes do clique
  // erra dentro de capítulos grudados e levaria a Cortina para cima do botão.
  await cta.evaluate((el) => (el as HTMLElement).click());
  await expect(page.locator("#projetos h2").first()).toBeInViewport();
});

test("troca PT ↔ EN e guarda a escolha", async ({ page }) => {
  await page.getByRole("button", { name: pt.nav.langSwitchAria }).click();
  await expect(page.locator("#inicio .sr-only").first()).toHaveText(en.hero.intro);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.reload();
  await expect(page.locator("#inicio .sr-only").first()).toHaveText(en.hero.intro);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Gabriel Coelho");
});

test("o link antigo /novo redireciona para a raiz", async ({ page }) => {
  const response = await page.goto("/novo");
  expect(new URL(page.url()).pathname).toBe("/");
  expect(response?.request().redirectedFrom()?.url()).toMatch(/\/novo$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Gabriel Coelho");
});

test("a raiz / abre com sucesso e é indexada", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveAccessibleName("Gabriel Coelho");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /index,\s*follow/);
});
