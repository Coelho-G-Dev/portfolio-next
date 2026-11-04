"use client";

import { useState } from "react";
import { EMAIL, GITHUB_URL, LINKEDIN_URL, mailtoFor, type ContactKind as Kind } from "@/lib/contact";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { Section } from "../Chapter";
import { Arrow } from "../Pill";

export default function Contact() {
  const { language } = useLanguage();
  const c = siteCopy[language];
  const k = c.contact;
  const [kind, setKind] = useState<Kind>("role");

  return (
    <Section id="contato" title={k.title}>
      <div className="s-contact">
        <div className="s-contact__grid">
          {/* Coluna 1: Informações diretas, presença e links */}
          <div className="s-contact__info">
            <div className="s-contact__meta">
              <span className="s-contact__badge">{k.location}</span>
              <span className="s-contact__badge s-contact__badge--sla">{k.reply}</span>
            </div>

            <div className="s-contact__channels">
              <a className="s-contact__email" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>

              <div className="s-contact__socials">
                <a
                  href={LINKEDIN_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="s-contact__social-link"
                >
                  <span>LinkedIn</span>
                  <span className="s-contact__social-handle">· gabriel-coelho</span>
                  <Arrow />
                </a>
                <a
                  href={GITHUB_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="s-contact__social-link"
                >
                  <span>GitHub</span>
                  <span className="s-contact__social-handle">· Coelho-G-Dev</span>
                  <Arrow />
                </a>
              </div>
            </div>
          </div>

          {/* Coluna 2: Seletor de finalidade e disparo pré-configurado */}
          <div className="s-contact__action-card">
            <fieldset className="s-contact__fieldset">
              <legend className="s-contact__legend">{k.kindLegend}</legend>
              <div className="s-contact__options" role="group" aria-label={k.kindLegend}>
                {(["role", "project"] as Kind[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className="s-contact__choice"
                    aria-pressed={kind === option}
                    onClick={() => setKind(option)}
                  >
                    {k.kinds[option]}
                  </button>
                ))}
              </div>
            </fieldset>

            <a className="s-pill s-contact__send" data-variant="primary" href={mailtoFor(k, kind)}>
              <span className="s-pill__label">{k.write}</span>
              <span className="s-pill__dot">
                <Arrow />
              </span>
            </a>
          </div>
        </div>
      </div>
    </Section>
  );
}
