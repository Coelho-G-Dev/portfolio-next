import { projects } from "@/data/projects";
import type { RedesignCopy } from "@/lib/i18n/redesign";

const SWAGGER_URL = "https://cidade-energia-back-end.vercel.app/api/docs";

// Trecho real de https://cidade-energia-back-end.vercel.app/api/openapi
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

function Evidence({ kind, c }: { kind: string; c: RedesignCopy }) {
  const h = c.how;
  if (kind === "contract") {
    return (
      <figure className="rd-evidence" data-ui style={{ margin: 0 }}>
        <pre tabIndex={0} aria-label={h.contractCaption}>{CONTRACT}</pre>
        <figcaption>{h.contractCaption}</figcaption>
      </figure>
    );
  }
  if (kind === "diagram") {
    const authguard = projects.find((p) => p.title === "AuthGuard");
    return (
      <figure className="rd-evidence" data-ui style={{ margin: 0 }}>
        <pre tabIndex={0} aria-label={h.diagramCaption}>{authguard?.architecture?.diagram.pt}</pre>
        <figcaption>{h.diagramCaption}</figcaption>
      </figure>
    );
  }
  if (kind === "tests") {
    return (
      <dl className="rd-tests tnum">
        {h.tests.map((t) => (
          <div key={t.label}>
            <dt>{t.label}</dt>
            <dd>{t.value}</dd>
          </div>
        ))}
      </dl>
    );
  }
  return (
    <figure className="rd-evidence" style={{ margin: 0 }}>
      <a className="rd-btn rd-btn--light" href={SWAGGER_URL} target="_blank" rel="noopener noreferrer">
        {h.docsLink}
      </a>
      <figcaption>{h.docsCaption}</figcaption>
    </figure>
  );
}

export default function HowIWork({ c }: { c: RedesignCopy }) {
  return (
    <section id="como-trabalho" className="rd-section rd-how" data-layer="queue" aria-labelledby="como-title">
      <div className="rd-how__grid">
        <h2 id="como-title" className="rd-head rd-how__title" data-rise>
          {c.how.title}
        </h2>
        <div className="rd-how__steps">
          {c.how.steps.map((s) => (
            <div key={s.lead}>
              <p data-rise>
                <b>{s.lead}</b> {s.body}
              </p>
              <div data-rise style={{ ["--i" as string]: 1 }}>
                <Evidence kind={s.evidence} c={c} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
