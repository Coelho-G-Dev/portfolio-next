"use client";

import type { RefObject } from "react";
import { useSiteCopy } from "../SiteCopyContext";

// Topo da sala: rótulo, título e teaser. A prévia usa `asHeading={false}` para
// não duplicar o h3 da sala real.
export default function RoomTop({
  index,
  name,
  teaser,
  headingRef,
  asHeading = true,
}: {
  index: number;
  name: string;
  teaser: string;
  headingRef?: RefObject<HTMLHeadingElement>;
  asHeading?: boolean;
}) {
  const c = useSiteCopy().projetos;
  return (
    <div className="s-room__top">
      <p className="s-room__label">{c.roomLabel(index, name)}</p>
      {asHeading ? (
        <h3 ref={headingRef} tabIndex={-1} className="s-room__title">
          {name}
        </h3>
      ) : (
        <p className="s-room__title">{name}</p>
      )}
      <p className="s-room__teaser">{teaser}</p>
    </div>
  );
}
