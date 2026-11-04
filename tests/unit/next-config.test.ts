import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config.mjs";

describe("next.config", () => {
  it("/novo redireciona permanentemente para a raiz", async () => {
    expect(nextConfig.redirects).toBeTypeOf("function");
    const redirects = await nextConfig.redirects!();
    expect(redirects).toContainEqual({ source: "/novo", destination: "/", permanent: true });
  });
});
