import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { Section } from "../Chapter";
import { Arrow } from "../Pill";

export default function Services() {
  const { language } = useLanguage();
  const c = siteCopy[language];
  const s = c.services;

  return (
    <Section id="o-que-resolvo" title={s.title}>
      <div className="s-services">
        {/* Tabela para desktop e tablet */}
        <div className="s-services__table-wrap" data-reveal tabIndex={0} role="region" aria-label={s.title}>
          <table className="s-services__table">
            <thead>
              <tr>
                <th scope="col">{s.head.problem}</th>
                <th scope="col">{s.head.delivery}</th>
                <th scope="col">{s.head.stack}</th>
                <th scope="col">{s.head.proof}</th>
              </tr>
            </thead>
            <tbody>
              {s.rows.map((row) => (
                <tr key={row.problem}>
                  <td className="s-services__cell-problem">
                    <strong>{row.problem}</strong>
                  </td>
                  <td className="s-services__cell-delivery">{row.delivery}</td>
                  <td className="s-services__cell-stack">
                    <span className="s-services__stack-tag">{row.stack}</span>
                  </td>
                  <td className="s-services__cell-proof">
                    <a className="s-services__proof-link" href="#projetos">
                      <span>{row.proof}</span>
                      <Arrow />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards para celular */}
        <div className="s-services__cards" data-reveal>
          {s.rows.map((row) => (
            <article key={row.problem} className="s-services__card">
              <p className="s-services__card-problem">
                <strong>{row.problem}</strong>
              </p>
              <p className="s-services__card-delivery">{row.delivery}</p>
              <div className="s-services__card-footer">
                <span className="s-services__stack-tag">{row.stack}</span>
                <a className="s-services__proof-link" href="#projetos">
                  <span>{row.proof}</span>
                  <Arrow />
                </a>
              </div>
            </article>
          ))}
        </div>

        {/* Linha de disponibilidade para vagas / posições */}
        <div className="s-services__roles-banner">
          <p className="s-services__roles-text">{s.roles}</p>
          <a
            href="#contato"
            className="s-pill"
            data-variant="secondary"
            data-surface="light"
          >
            <span className="s-pill__label">
              {s.talk}
            </span>
            <span className="s-pill__dot">
              <Arrow />
            </span>
          </a>
        </div>
      </div>
    </Section>
  );
}
