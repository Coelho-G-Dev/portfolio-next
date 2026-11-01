import type { Door } from "@/data/projects";
import { Arrow } from "../Pill";
import { useSiteCopy } from "../SiteCopyContext";

export const DOOR_ORDER: Door[] = ["backend", "frontend", "ia"];

export default function Doors({
  openingDoor,
  closingDoor,
  onSelectDoor,
  doorRefs,
}: {
  openingDoor: Door | null;
  closingDoor?: Door | null;
  onSelectDoor: (door: Door) => void;
  doorRefs: Record<Door, (el: HTMLButtonElement | null) => void>;
}) {
  const c = useSiteCopy().projetos;

  return (
    <div
      className="s-doors"
      data-opening={openingDoor ? "true" : undefined}
    >
      <p className="s-doors__lead">{c.doorsTitle}</p>
      <div className="s-doors__row">
        {DOOR_ORDER.map((door) => {
          const copy = c.doors[door];
          const isOpening = openingDoor === door;
          const isClosing = closingDoor === door;
          const isPortal = isOpening || isClosing;

          return (
            <button
              key={door}
              ref={doorRefs[door]}
              type="button"
              className="s-door"
              data-door={door}
              data-open={isOpening ? "true" : undefined}
              data-portal={isPortal ? "true" : undefined}
              aria-label={c.open(copy.name)}
              aria-expanded={isOpening}
              aria-controls={`door-panel-${door}`}
              onClick={() => onSelectDoor(door)}
            >
              {/* Moldura Arqueada (Portal Romano) */}
              <span className="s-door__frame" aria-hidden="true">
                {/* Câmara interna com iluminação âmbar */}
                <span className="s-door__interior" />

                {/* Folha única arqueada com acabamento em nogueira nobre */}
                <span className="s-door__leaf" data-leaf="left">
                  {/* Entalhe interno arqueado */}
                  <span className="s-door__inlay" />

                  {/* Placa de identificação em latão maciço */}
                  <span className="s-door__plaque">
                    <span className="s-door__plaque-screw" data-pos="left" />
                    <span className="s-door__plaque-text">{copy.name}</span>
                    <span className="s-door__plaque-screw" data-pos="right" />
                  </span>

                  {/* Puxador vertical em latão polido */}
                  <span className="s-door__handle" />

                  {/* Fechadura / espelho em latão */}
                  <span className="s-door__keyhole" />
                </span>

                {/* Sombra de chão sob a base da porta */}
                <span className="s-door__floor-shadow" />
              </span>

              {/* Informações da porta abaixo do portal */}
              <span className="s-door__meta">
                <span className="s-door__head">
                  <span className="s-door__title">{copy.name}</span>
                  <span className="s-door__indicator" aria-hidden="true">
                    <Arrow />
                  </span>
                </span>
                <span className="s-door__teaser">{copy.teaser}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
