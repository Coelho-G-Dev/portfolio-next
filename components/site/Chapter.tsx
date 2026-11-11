import type { CSSProperties, ReactNode } from "react";

export type ChapterTone = "marfim" | "nogueiraEscura" | "ebano" | "bordo";
export type ChapterId = "abertura" | "derrube" | "projetos" | "trabalho" | "sobre";

// Um capítulo é o cartão que a Cortina sobrepõe (spec §5.3). Ele agrupa uma
// ou mais seções; cada seção tem o seu h2. O id vai só em data-chapter, para
// não colidir com o id das seções.
export function Chapter({
  id,
  tone,
  style,
  children,
}: {
  id: ChapterId;
  tone: ChapterTone;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div className="s-chapter" data-chapter={id} data-tone={tone} style={style}>
      {children}
    </div>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className="s-section" aria-labelledby={titleId}>
      <h2 id={titleId} className="s-section__title" data-reveal>
        {title}
      </h2>
      {children}
    </section>
  );
}
