"use client";

import type { CSSProperties } from "react";
import { projectsForDoor, type Door } from "@/data/doors";
import ProjectCard from "./ProjectCard";
import { useSiteCopy } from "../SiteCopyContext";
import RoomTop from "./RoomTop";

// Miniatura da sala vista pela abertura da porta. Usa o mesmo topo e o mesmo
// cartão (modo prévia) da sala real, com as mesmas caixas de CSS, para o quadro
// de chegada ser idêntico. Sem foco, sem leitor de tela, cortada em `height`.
// Traz também um gêmeo visual do Voltar da sala, para ele não surgir na troca.
export default function RoomPreview({
  door,
  index,
  lang,
  width,
  height,
}: {
  door: Door;
  index: number;
  lang: "pt" | "en";
  width: number;
  height: number;
}) {
  const c = useSiteCopy().projetos;
  const { name, teaser } = c.doors[door];
  return (
    <div
      className="s-room s-room--preview"
      data-door={door}
      aria-hidden="true"
      // `inert` direto no DOM: no React 19 do Next, `inert=""` some.
      ref={(el) => el?.setAttribute("inert", "")}
      style={{ width, height, overflow: "hidden", "--room-glow": `var(--c-porta-${door}-claro)` } as CSSProperties}
    >
      <RoomTop index={index} name={name} teaser={teaser} asHeading={false} />
      <span className="s-room__back">
        <span aria-hidden="true">← </span>
        {c.back}
      </span>
      <div className="s-room__list">
        {projectsForDoor(door).map((entry) => (
          <ProjectCard key={entry.project.id} entry={entry} door={door} lang={lang} mode="preview" />
        ))}
      </div>
    </div>
  );
}
