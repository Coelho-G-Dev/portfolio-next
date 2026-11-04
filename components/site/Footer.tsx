import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/contact";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { Arrow } from "./Pill";

export default function Footer() {
  const { language } = useLanguage();
  const c = siteCopy[language];
  const f = c.footer;

  return (
    <footer className="s-footer" role="contentinfo">
      <div className="s-footer__inner">
        <div className="s-footer__top">
          <div className="s-footer__cta-block">
            <h2 className="s-footer__title">{f.title}</h2>
            <a
              className="s-pill s-footer__cta"
              data-variant="primary"
              href={`mailto:${EMAIL}`}
            >
              <span className="s-pill__label">{f.cta}</span>
              <span className="s-pill__dot">
                <Arrow />
              </span>
            </a>
          </div>

          <ul className="s-footer__links">
            <li>
              <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
            <li>
              <a href={`mailto:${EMAIL}`}>E-mail</a>
            </li>
          </ul>
        </div>

        <div className="s-footer__bottom">
          <div className="s-footer__legal">
            <span>{f.rights}</span>
            <span>{f.built}</span>
          </div>
          <div className="s-footer__watermark" aria-hidden="true">
            <svg viewBox="0 0 1200 160" className="s-footer__watermark-svg">
              <text x="0" y="130" className="s-footer__watermark-text">
                Gabriel Coelho
              </text>
            </svg>
          </div>
        </div>
      </div>
    </footer>
  );
}
