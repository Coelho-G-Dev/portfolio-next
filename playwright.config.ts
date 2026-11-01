import { defineConfig, devices } from "@playwright/test";

const PORT = 3124;

// Usa o Chrome instalado na máquina; nada de baixar navegadores.
const chrome = { ...devices["Desktop Chrome"], channel: "chrome" as const };

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop-1440", use: { ...chrome, viewport: { width: 1440, height: 900 } } },
    { name: "tablet-768", use: { ...chrome, viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: "phone-390", use: { ...chrome, viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } },
  ],
  // Build de produção: é o que vai para a Vercel.
  webServer: {
    command: `npm run build && npm run start -- --port ${PORT}`,
    url: `http://localhost:${PORT}/redesign`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
  },
});
