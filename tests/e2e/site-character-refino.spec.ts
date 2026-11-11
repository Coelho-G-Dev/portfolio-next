import { expect, test } from "@playwright/test";
import hero from "../../public/hero/manifest.json";

test.beforeEach(async ({ page }) => {
  await page.route(/kaspersky-labs\.com/, r => r.abort());
  await page.route("**/_vercel/**", r => r.fulfill({ status: 200, body: "" }));
});

test("clique e toque passam pela neutra e preservam o gesto durante novos cliques", async ({ page }, info) => {
  await page.goto("/");
  const char = page.locator(".s-char");
  await expect(char).toHaveAttribute("data-mode", info.project.name === "desktop-1440" ? "desktop" : "touch");
  const desktop = await char.getAttribute("data-mode") === "desktop";
  const source = char.locator(desktop ? 'video[data-clip="olhar"]' : 'video[data-clip="loop"]');
  if (desktop) {
    await page.mouse.move(20, 20);
    await expect(source).toHaveAttribute("data-active", "true");
    await expect.poll(() => source.evaluate((v: HTMLVideoElement) => v.currentTime / v.duration)).toBeLessThan(0.15);
  } else {
    await expect(source).toHaveAttribute("data-active", "true", { timeout: 10000 });
    await expect.poll(() => source.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.6);
  }
  await page.evaluate(() => {
    const root = document.querySelector(".s-char")!;
    const audit = { transitions: [] as { clip: string; sourceTime: number; duration: number; seeking: boolean; ready: number }[] };
    (window as typeof window & { refino: typeof audit }).refino = audit;
    new MutationObserver(() => {
      const active = root.querySelector<HTMLVideoElement>("video[data-active]");
      if (!active?.dataset.clip?.startsWith("clique")) return;
      const source = root.querySelector<HTMLVideoElement>('video[data-clip="olhar"],video[data-clip="loop"]')!;
      audit.transitions.push({ clip: active.dataset.clip, sourceTime: source.currentTime, duration: source.duration, seeking: source.seeking, ready: source.readyState });
    }).observe(root, { attributes: true, subtree: true, attributeFilter: ["data-active"] });
  });
  // Teclado no desktop evita disparar hover antes do clique sob teste.
  if (desktop) await char.press("Enter"); else await char.tap();
  const reaction = char.locator('video[data-active][data-clip^="clique"]');
  await expect(reaction).toHaveCount(1);
  const key = await reaction.getAttribute("data-clip");
  await expect.poll(() => reaction.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThan(0.3);
  const before = await reaction.evaluate((v: HTMLVideoElement) => v.currentTime);
  const quote = await char.locator('[role="status"]').textContent();
  if (desktop) await char.press("Enter"); else await char.tap();
  await expect(reaction).toHaveAttribute("data-clip", key!);
  expect(await reaction.evaluate((v: HTMLVideoElement) => v.currentTime)).toBeGreaterThanOrEqual(before);
  await expect(char.locator('[role="status"]')).not.toHaveText(quote!);
  const transitions = await page.evaluate(() => (window as typeof window & { refino: { transitions: { clip: string; sourceTime: number; duration: number; seeking: boolean; ready: number }[] } }).refino.transitions);
  expect(transitions.length).toBeGreaterThan(0);
  for (const t of transitions) {
    expect(t.seeking).toBe(false); expect(t.ready).toBeGreaterThanOrEqual(2);
    const k = Math.floor(t.sourceTime * 24);
    if (desktop) expect(k).toBe(hero.olharNeutral);
    else expect([0, Math.floor(Math.round(t.duration * 24) / 2), Math.round(t.duration * 24) - 1]).toContain(k);
  }
  await expect(source).toHaveAttribute("data-active", "true", { timeout: 8000 });
  if (!desktop) {
    const k = Math.floor(transitions[0].sourceTime * 24);
    const seconds = await source.evaluate((v: HTMLVideoElement) => v.currentTime);
    const duration = transitions[0].duration;
    const elapsed = (seconds - (k + 0.5) / 24 + duration) % duration;
    expect(elapsed).toBeLessThan(0.8);
  }
});
