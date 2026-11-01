import Image from "next/image";
import type { Contributions } from "@/lib/github";
import type { Locale } from "@/lib/i18n/translations";
import type { RedesignCopy } from "@/lib/i18n/redesign";
import Tiles from "./Tiles";

type Props = { c: RedesignCopy; contributions: Contributions | null; language: Locale };

export default function About({ c, contributions, language }: Props) {
  const a = c.about;
  return (
    <section id="sobre" className="rd-section rd-about" data-layer="db" aria-labelledby="sobre-title">
      <h2 id="sobre-title" className="rd-about__title">
        {a.title}
      </h2>

      <div className="rd-portraits">
        {a.portraits.map((p) => (
          <figure key={p.src} className="rd-portrait" style={{ margin: 0 }}>
            <Image src={p.src} alt={p.alt} width={1000} height={1250} sizes="(max-width: 900px) 72vw, 30vw" data-rise />
            <figcaption style={{ display: "grid", gap: 6 }} data-rise>
              <p className="rd-portrait__name">{p.name}</p>
              <p className="rd-portrait__role">{p.role}</p>
              <p className="rd-portrait__text">{p.text}</p>
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="rd-tiles">
        <div data-rise>
          <h3>{a.tilesTitle}</h3>
          <p>{contributions ? a.tilesText(contributions.total) : a.tilesFallback}</p>
        </div>
        {contributions && (
          <div data-rise style={{ ["--i" as string]: 1 }}>
            <Tiles
              weeks={contributions.weeks}
              label={a.tilesText(contributions.total)}
              tileLabel={a.tilesAria}
              locale={language === "pt" ? "pt-BR" : "en"}
            />
          </div>
        )}
      </div>
    </section>
  );
}
