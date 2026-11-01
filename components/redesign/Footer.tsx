import type { RedesignCopy } from "@/lib/i18n/redesign";
import { EMAIL, GITHUB_URL, LINKEDIN_URL } from "@/lib/contact";

export default function Footer({ c }: { c: RedesignCopy }) {
  return (
    <footer className="rd-footer" data-layer="db" aria-labelledby="rodape-title">
      <div className="rd-footer__top">
        <div>
          <h2 id="rodape-title">{c.footer.title}</h2>
          <a className="rd-btn rd-btn--light" href={`mailto:${EMAIL}`}>
            {c.footer.cta}
          </a>
        </div>
        <ul className="rd-footer__links">
          <li>
            <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </li>
          <li>
            <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
          </li>
          <li>
            <a href={`mailto:${EMAIL}`}>E-mail</a>
          </li>
        </ul>
      </div>
      <div className="rd-footer__legal">
        <span>{c.footer.rights}</span>
        <span>{c.footer.preview}</span>
        <span>{c.footer.built}</span>
      </div>
      <p className="rd-footer__name" aria-hidden="true">
        Gabriel Coelho
      </p>
    </footer>
  );
}
