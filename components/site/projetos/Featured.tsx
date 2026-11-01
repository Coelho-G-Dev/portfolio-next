import { projects, type FacetLink } from "@/data/projects";
import { Arrow } from "../Pill";
import { useSiteCopy } from "../SiteCopyContext";

const FEATURED = projects.find((p) => p.title === "Cidade Energia")!;

const LINK_FIELD: Record<
  FacetLink,
  "githubLink" | "frontendLink" | "demoLink" | "apiDocsLink"
> = {
  github: "githubLink",
  frontend: "frontendLink",
  demo: "demoLink",
  docs: "apiDocsLink",
};

export default function Featured({ lang }: { lang: "pt" | "en" }) {
  const c = useSiteCopy().projetos;
  const links: FacetLink[] = ["demo", "github", "frontend", "docs"];

  return (
    <article className="s-featured" data-featured-project="cidade-energia">
      <div className="s-featured__top">
        <span className="s-featured__badge">{c.featured.badge}</span>
        <span className="s-featured__fullstack">{c.featured.fullStack}</span>
      </div>

      <h3 className="s-featured__title">{FEATURED.title}</h3>
      <p className="s-featured__line">{c.featured.line}</p>

      {FEATURED.metrics && (
        <dl className="s-featured__metrics">
          {FEATURED.metrics.map((m, i) => (
            <div key={i} className="s-featured__metric">
              <dt>{m.label[lang]}</dt>
              <dd>{m.value[lang]}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="s-featured__links">
        {links.map((key, idx) => {
          const href = FEATURED[LINK_FIELD[key]];
          if (!href) return null;
          const primary = idx === 0;
          return (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="s-pill"
              data-variant={primary ? "primary" : "secondary"}
              data-surface="dark"
            >
              <span className="s-pill__label">{c.links[key]}</span>
              {primary && (
                <span className="s-pill__dot">
                  <Arrow />
                </span>
              )}
            </a>
          );
        })}
      </div>
    </article>
  );
}
