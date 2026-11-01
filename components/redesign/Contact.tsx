"use client";

import { useState } from "react";
import type { RedesignCopy } from "@/lib/i18n/redesign";

export const EMAIL = "gabrielbiellosousa@gmail.com";
export const LINKEDIN_URL = "https://www.linkedin.com/in/gabriel-coelho-7184a32a3/";
export const GITHUB_URL = "https://github.com/Coelho-G-Dev";

type Kind = "role" | "project";

export function mailtoFor(c: RedesignCopy, kind: Kind) {
  const subject = encodeURIComponent(c.contact.subject[kind]);
  const body = encodeURIComponent(c.contact.body[kind]);
  return `mailto:${EMAIL}?subject=${subject}&body=${body}`;
}

export default function Contact({ c }: { c: RedesignCopy }) {
  const k = c.contact;
  const [kind, setKind] = useState<Kind>("role");

  return (
    <section id="contato" className="rd-contact" data-layer="db" aria-labelledby="contato-title">
      <div className="rd-rows">
        <div>
          <h2 id="contato-title">{k.title}</h2>
        </div>
        <div>
          <a className="rd-rows__email" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
        </div>
        <div>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
            LinkedIn · gabriel-coelho
          </a>
        </div>
        <div>
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
            GitHub · Coelho-G-Dev
          </a>
        </div>
        <div>
          <p style={{ margin: 0 }}>{k.location}</p>
        </div>
        <div>
          <p style={{ margin: 0 }}>{k.reply}</p>
        </div>
        <div className="rd-write">
          <fieldset>
            <legend>{k.kindLegend}</legend>
            {(["role", "project"] as Kind[]).map((option) => (
              <button
                key={option}
                type="button"
                className="rd-choice"
                aria-pressed={kind === option}
                onClick={() => setKind(option)}
              >
                {k.kinds[option]}
              </button>
            ))}
          </fieldset>
          <a className="rd-write__go" href={mailtoFor(c, kind)}>
            {k.write}
            <span className="rd-write__arrow" aria-hidden="true">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
