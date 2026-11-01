"use client";

import { useState } from "react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useSiteCopy } from "./SiteCopyContext";

export default function Nav() {
  const c = useSiteCopy().nav;
  const { toggleLanguage } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="s-nav">
      <a className="s-nav__brand" href="#inicio" aria-label={c.homeAria}>
        <span aria-hidden="true">♚</span> {c.brand}
      </a>

      {/* Abaixo de 720px, os links ficam atrás do botão "Menu". */}
      <button
        type="button"
        className="s-nav__menu"
        aria-expanded={open}
        aria-controls="s-nav-links"
        onClick={() => setOpen((v) => !v)}
      >
        {c.menu}
      </button>

      <nav aria-label={c.navAria} className="s-nav__links" id="s-nav-links" data-open={open || undefined}>
        <ul>
          {c.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="s-nav__right">
        <p className="s-nav__status">
          <span className="s-nav__dot" aria-hidden="true" />
          {c.status}
        </p>
        <button type="button" className="s-nav__lang" onClick={toggleLanguage} aria-label={c.langSwitchAria}>
          {c.langSwitch}
        </button>
      </div>
    </div>
  );
}
