import { describe, expect, it } from "vitest";
import { EMAIL, mailtoFor } from "@/components/redesign/Contact";
import { redesignCopy } from "@/lib/i18n/redesign";

describe.each(["pt", "en"] as const)("mailto do contato (%s)", (lang) => {
  const c = redesignCopy[lang];

  it.each(["role", "project"] as const)("monta assunto e corpo para %s", (kind) => {
    const url = new URL(mailtoFor(c, kind));
    expect(url.protocol).toBe("mailto:");
    expect(url.pathname).toBe(EMAIL);
    expect(url.searchParams.get("subject")).toBe(c.contact.subject[kind]);
    expect(url.searchParams.get("body")).toBe(c.contact.body[kind]);
  });

  it("codifica acentos, espaços e quebras de linha", () => {
    const href = mailtoFor(c, "project");
    const query = href.split("?")[1];
    expect(query).not.toMatch(/[\s\n]/);
    expect(query).not.toMatch(/[^\x20-\x7e]/);
    // "+" não pode representar espaço: clientes de e-mail o mostram literalmente.
    expect(query).not.toContain("+");
  });

  it("vaga e projeto geram assuntos diferentes", () => {
    expect(mailtoFor(c, "role")).not.toBe(mailtoFor(c, "project"));
  });
});
