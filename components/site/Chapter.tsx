import type { ReactNode } from "react";

export type ChapterTone = "marfim" | "nogueiraEscura" | "ebano" | "bordo";

// Um capítulo é o cartão que a Cortina sobrepõe (spec §5.3). Ele agrupa uma
// ou mais seções; cada seção tem o seu h2.
export function Chapter({ tone, children }: { tone: ChapterTone; children: ReactNode }) {
  return (
    <div className="s-chapter" data-tone={tone}>
      {children}
    </div>
  );
}

export function Section({ id, title, children }: { id: string; title: string; children?: ReactNode }) {
  const titleId = `${id}-title`;
  return (
    <section id={id} className="s-section" aria-labelledby={titleId}>
      <h2 id={titleId} className="s-section__title">
        {title}
      </h2>
      {children}
    </section>
  );
}
