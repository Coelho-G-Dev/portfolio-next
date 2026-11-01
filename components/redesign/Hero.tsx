import Image from "next/image";
import type { RedesignCopy } from "@/lib/i18n/redesign";

function Run({ hidden }: { hidden?: boolean }) {
  return (
    <span className="rd-track__run" aria-hidden={hidden || undefined}>
      <span>Gabriel Coelho</span>
      <i className="rd-track__dot" />
      <span>back-end</span>
      <i className="rd-track__dot" />
    </span>
  );
}

// A linha corre duas vezes: em maroon sobre o papel e, recortada ao quadrado
// da foto, em papel. Assim as letras clareiam ao atravessar o retrato.
function Track() {
  return (
    <span className="rd-track" aria-hidden="true">
      <Run />
      <Run hidden />
      <Run hidden />
    </span>
  );
}

export default function Hero({ c, onToggleLanguage }: { c: RedesignCopy; onToggleLanguage: () => void }) {
  return (
    <header id="inicio" className="rd-hero" data-layer="surface">
      <div className="rd-nav">
        <a href="#projetos">{c.nav.work}</a>
        <a href="#inicio" aria-label="Gabriel Coelho">
          Gabriel Coelho
        </a>
        <div className="rd-nav__right">
          <a className="rd-nav__contact" href="#contato">
            {c.nav.contact}
          </a>
          <button type="button" className="rd-nav__lang" onClick={onToggleLanguage} aria-label={c.nav.langSwitchAria}>
            {c.nav.langSwitch}
          </button>
        </div>
      </div>

      <div className="rd-band">
        <Image
          className="rd-band__photo"
          src="/photos/web/retrato-quadrado.webp"
          alt={c.hero.photoAlt}
          width={600}
          height={600}
          priority
          sizes="(max-width: 720px) 46vw, 300px"
        />
        <h1 className="rd-band__title">
          <span className="sr-only">{c.hero.titleSr}</span>
          <Track />
        </h1>
        <div className="rd-band__clip" aria-hidden="true">
          <Track />
        </div>
      </div>

      <div className="rd-hero__text">
        <p className="rd-hero__sentence">{c.hero.sentence}</p>
        <p className="rd-hero__fact">{c.hero.fact}</p>
      </div>

      <div className="rd-hero__foot">
        <p>{c.hero.status}</p>
        <a className="rd-btn" href="#projetos">
          {c.hero.cta}
        </a>
      </div>
    </header>
  );
}
