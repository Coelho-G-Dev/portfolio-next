import { projects } from "@/data/projects";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { Section } from "../Chapter";
import { Arrow } from "../Pill";

const SWAGGER_URL = "https://cidade-energia-back-end.vercel.app/api/docs";

const CONTRACT = `"/api/tutor": {
  "post": {
    "summary": "Pergunta ao Energinho",
    "operationId": "perguntarAoTutor",
    "security": [{ "bearerAuth": [] }],
    "requestBody": {
      "required": true,
      "content": { "application/json": {
        "schema": { "$ref": "#/components/schemas/PerguntaTutor" },
        "examples": { "simples": {
          "summary": "Só a pergunta",
          "value": { "mensagem": "Por que o sol de São Luís é tão forte?" }
        }}
      }}
    }
  }
}`;

export default function HowIWork() {
  const { language } = useLanguage();
  const c = siteCopy[language];
  const h = c.how;
  const authguard = projects.find((p) => p.title === "AuthGuard");

  return (
    <Section id="como-trabalho" title={h.title}>
      <div className="s-how">
        <div className="s-how__steps">
          {h.steps.map((step, idx) => (
            <div key={step.lead} className="s-how__step">
              <div className="s-how__narrative">
                <span className="s-how__num" aria-hidden="true">
                  0{idx + 1}
                </span>
                <p className="s-how__text">
                  <strong className="s-how__lead">{step.lead}</strong> {step.body}
                </p>
              </div>

              <div className="s-how__evidence">
                {step.evidence === "contract" && (
                  <figure className="s-evidence-card">
                    <pre
                      tabIndex={0}
                      aria-label={h.contractCaption}
                      className="s-evidence-code"
                    >
                      {CONTRACT}
                    </pre>
                    <figcaption className="s-evidence-caption">
                      {h.contractCaption}
                    </figcaption>
                  </figure>
                )}

                {step.evidence === "diagram" && (
                  <figure className="s-evidence-card">
                    <pre
                      tabIndex={0}
                      aria-label={h.diagramCaption}
                      className="s-evidence-code s-evidence-code--diagram"
                    >
                      {authguard?.architecture?.diagram[language] ??
                        authguard?.architecture?.diagram.pt}
                    </pre>
                    <figcaption className="s-evidence-caption">
                      {h.diagramCaption}
                    </figcaption>
                  </figure>
                )}

                {step.evidence === "tests" && (
                  <div className="s-evidence-card s-evidence-card--stats">
                    <dl className="s-evidence-metrics tnum">
                      {h.tests.map((t) => (
                        <div key={t.label} className="s-evidence-metric">
                          <dt className="s-evidence-metric__label">{t.label}</dt>
                          <dd className="s-evidence-metric__val">{t.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}

                {step.evidence === "docs" && (
                  <figure className="s-evidence-card s-evidence-card--link">
                    <a
                      className="s-pill"
                      data-variant="primary"
                      data-surface="light"
                      href={SWAGGER_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span className="s-pill__label">{h.docsLink}</span>
                      <span className="s-pill__dot">
                        <Arrow />
                      </span>
                    </a>
                    <figcaption className="s-evidence-caption">
                      {h.docsCaption}
                    </figcaption>
                  </figure>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
