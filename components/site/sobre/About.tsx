import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { siteCopy } from "@/lib/i18n/site";
import { Section } from "../Chapter";
import Dia600 from "./Dia600";

export default function About() {
  const { language } = useLanguage();
  const c = siteCopy[language];
  const a = c.about;

  return (
    <Section id="sobre" title={a.title}>
      <p className="s-about__intro" data-reveal>
        {a.intro}
      </p>
      {/* O dia de 600 toneladas logo depois da abertura (spec §7.1). */}
      <Dia600 />
      <div className="s-about">
        {/* Galeria de retratos compacta e narrativa */}
        <div className="s-portraits">
          {a.portraits.map((p) => (
            <figure key={p.src} className="s-portrait" data-reveal>
              <div className="s-portrait__frame">
                <Image
                  src={p.src}
                  alt={p.alt}
                  width={200}
                  height={200}
                  sizes="(max-width: 719px) 110px, 140px"
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

        {/* Bancada da Stack de Trabalho */}
        <div className="s-stack-workbench" data-reveal>
          <div className="s-stack-workbench__head">
            <h3 className="s-stack-workbench__title">{a.stackTitle}</h3>
            <p className="s-stack-workbench__lead">{a.stackLead}</p>
          </div>
          <div className="s-stack-workbench__grid">
            {a.stackCategories.map((cat) => (
              <div key={cat.name} className="s-stack-category">
                <h4 className="s-stack-category__title">{cat.name}</h4>
                <div className="s-stack-category__chips">
                  {cat.items.map((item) => (
                    <div key={item.name} className="s-stack-chip" tabIndex={0}>
                      <span className="s-stack-chip__name">{item.name}</span>
                      <span className="s-stack-chip__note">{item.note}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
