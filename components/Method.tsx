"use client";
import { useReveal } from "@/lib/useReveal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import SectionCut from "@/components/SectionCut";

export default function Method() {
  const { language, t } = useLanguage();
  const ref = useReveal<HTMLDivElement>();

  const stack = [
    {
      category: t.method.categories.backend,
      description: t.method.categories.backendDesc,
      techs: [
        "Node.js",
        "TypeScript",
        "Python",
        "FastAPI",
        "Java / Spring Boot",
        "Express",
        "REST APIs",
        "Zod",
      ],
    },
    {
      category: t.method.categories.messaging,
      description: t.method.categories.messagingDesc,
      techs: [
        "RabbitMQ",
        "Dead-Letter Queues (DLQ)",
        "Redis",
        "Token Bucket Rate Limit",
        "Event-Driven",
      ],
    },
    {
      category: t.method.categories.data,
      description: t.method.categories.dataDesc,
      techs: [
        "PostgreSQL",
        "pgvector (HNSW)",
        "MongoDB",
        "Mongoose",
        "Prisma / TypeORM",
      ],
    },
    {
      category: t.method.categories.devops,
      description: t.method.categories.devopsDesc,
      techs: [
        "Docker",
        "Docker Compose",
        "Jest",
        "Supertest",
        "CI/CD Pipelines",
        "Linux / Bash",
      ],
    },
    {
      category: t.method.categories.frontend,
      description: t.method.categories.frontendDesc,
      techs: [
        "Next.js",
        "React",
        "Tailwind CSS",
        "TypeScript",
        "HTML5 / CSS3",
      ],
    },
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
                <span className="font-mono text-xs opacity-75 pt-1 transition-colors duration-300 group-hover:text-lime group-hover:opacity-100 font-bold">
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
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 mb-8">
            <p className="font-mono text-xs tracking-widest uppercase">{t.method.stackTitle}</p>
            <p className="font-mono text-[11px] tracking-wider uppercase text-lime font-medium">
              Back-End First · Arquitetura Orientada a Resiliência
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stack.map(({ category, description, techs }) => (
              <div
                key={category}
                className="p-5 rounded-lg border border-cream/15 bg-navy/40 backdrop-blur-sm flex flex-col justify-between transition-all duration-300 hover:border-lime/60 hover:bg-navy/60 hover:-translate-y-1 shadow-sm hover:shadow-lg"
              >
                <div>
                  <h3 className="font-display font-bold text-base text-cream mb-1">{category}</h3>
                  <p className="text-xs text-cream/95 leading-relaxed mb-4 min-h-[2.5rem] font-normal">{description}</p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-2 border-t border-cream/10">
                  {techs.map((tech, i) => (
                    <span
                      key={tech}
                      style={{ animationDelay: `${i * 40}ms` }}
                      className="stack-pill opacity-0 font-mono text-[11px] tracking-wide uppercase border border-cream/30 rounded-full px-2.5 py-1 transition-all duration-300 hover:bg-lime hover:text-navy hover:border-lime hover:-translate-y-0.5 cursor-default bg-navy/40 font-medium text-cream"
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
