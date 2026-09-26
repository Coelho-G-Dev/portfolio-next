"use client";
import { useReveal } from "@/lib/useReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import SectionCut from "@/components/SectionCut";

const backendTechs = [
  "Node.js",
  "TypeScript",
  "Python",
  "FastAPI",
  "Docker",
  "RabbitMQ",
  "Redis",
  "PostgreSQL",
  "pgvector",
  "MongoDB",
  "Jest",
];
const frontendTechs = ["React", "Next.js", "TypeScript", "Tailwind CSS", "HTML5", "CSS3"];

export default function Method() {
  const { t } = useLanguage();
  const ref = useReveal<HTMLDivElement>();

  const stack = [
    { category: t.method.categories.backend, techs: backendTechs },
    { category: t.method.categories.frontend, techs: frontendTechs },
  ];

  return (
    <section id="metodo" className="relative min-h-screen bg-blue text-cream px-6 md:px-10 py-32 overflow-hidden">
      <SectionCut label={t.method.cutLabel} color="lime" side="right" />
      <div
        className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full border-[10px] border-lime"
        aria-hidden="true"
      />
      <div ref={ref} className="reveal max-w-5xl mx-auto">
        <div className="grid md:grid-cols-[1fr_1.3fr] gap-16">
          <div>
            <p className="font-mono text-xs tracking-widest uppercase mb-4">{t.method.sectionNumber}</p>
            <h2 className="font-display font-black text-[10vw] md:text-5xl leading-[0.95]">
              {t.method.titleLine1}
              <br />
              <span className="font-serif italic font-normal text-lime">{t.method.titleHighlight}</span>
            </h2>
            <p className="text-cream text-sm leading-relaxed mt-6 max-w-sm">
              {t.method.subtitle}
            </p>
          </div>

          <div className="divide-y divide-cream/20 border-t border-cream/20">
            {t.method.steps.map((s, i) => (
              <div
                key={s.title}
                className="group relative grid grid-cols-[auto_1fr] gap-6 py-6 items-start px-4 -mx-4 transition-colors duration-300 hover:bg-cream/[0.04] overflow-hidden"
              >
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-full w-0 bg-lime group-hover:w-1 transition-all duration-300 ease-out"
                />
                <span className="font-mono text-xs opacity-50 pt-1 transition-colors duration-300 group-hover:text-lime group-hover:opacity-100">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="grid md:grid-cols-2 gap-4">
                  <h3 className="font-display font-bold text-xl transition-colors duration-300 group-hover:text-lime">
                    {s.title}
                  </h3>
                  <p className="text-sm text-cream leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-12 border-t border-cream/20">
          <p className="font-mono text-xs tracking-widest uppercase mb-8">{t.method.stackTitle}</p>
          <div className="grid md:grid-cols-2 gap-10">
            {stack.map(({ category, techs }) => (
              <div key={category}>
                <h3 className="font-display font-bold text-lg mb-4">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech, i) => (
                    <span
                      key={tech}
                      style={{ animationDelay: `${i * 60}ms` }}
                      className="stack-pill opacity-0 font-mono text-sm tracking-wide uppercase border border-cream/30 rounded-full px-3 py-1.5 transition-all duration-300 hover:bg-lime hover:text-navy hover:border-lime hover:-translate-y-0.5 cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
