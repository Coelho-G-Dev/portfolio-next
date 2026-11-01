import Image from "next/image";
import type { Contributions } from "@/lib/github";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { redesignCopy } from "@/lib/i18n/redesign";
import { Section } from "../Chapter";
import Tiles from "./Tiles";

type Props = {
  contributions?: Contributions | null;
};

export default function About({ contributions }: Props) {
  const { language } = useLanguage();
  const c = redesignCopy[language];
  const a = c.about;

  return (
    <Section id="sobre" title={a.title}>
      <div className="s-about">
        {/* Galeria de retratos em duas colunas alternadas */}
        <div className="s-portraits">
          {a.portraits.map((p) => (
            <figure key={p.src} className="s-portrait">
              <div className="s-portrait__frame">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={1000}
                  height={1250}
                  sizes="(max-width: 719px) 85vw, (max-width: 1024px) 45vw, 420px"
                  className="s-portrait__img"
                />
              </div>
              <figcaption className="s-portrait__caption">
                <p className="s-portrait__name">
                  <strong>{p.name}</strong>
                </p>
                <p className="s-portrait__role">{p.role}</p>
                <p className="s-portrait__text">{p.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Azulejos de marchetaria com histórico do GitHub */}
        <div className="s-tiles">
          <div className="s-tiles__header">
            <h3 className="s-tiles__title">{a.tilesTitle}</h3>
            <p className="s-tiles__text">
              {contributions ? a.tilesText(contributions.total) : a.tilesFallback}
            </p>
          </div>
          {contributions && (
            <div className="s-tiles__canvas-wrap" tabIndex={0} role="region" aria-label={a.tilesTitle}>
              <Tiles
                weeks={contributions.weeks}
                label={a.tilesText(contributions.total)}
                tileLabel={a.tilesAria}
                locale={language === "pt" ? "pt-BR" : "en"}
              />
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
