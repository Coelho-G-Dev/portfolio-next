import type { Door } from "@/data/projects";
import { Arrow } from "../Pill";
import { useSiteCopy } from "../SiteCopyContext";

export const DOOR_ORDER: Door[] = ["backend", "frontend", "ia"];

const DOOR_GLYPH: Record<Door, string> = { backend: "♜", frontend: "♞", ia: "♛" };

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
          const meta = c.doorMeta[door];
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
              {/* Portal Arquitetural de Alto Nível */}
              <span className="s-door__frame" aria-hidden="true">
                <span className="s-door__interior" />
                <span className="s-door__halo" />
                <span className="s-door__glyph-wrap">
                  <span className="s-door__glyph">{DOOR_GLYPH[door]}</span>
                </span>
                <span className="s-door__badge">{meta.badge}</span>
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

                <span className="s-door__points">
                  {meta.points.map((pt) => (
                    <span key={pt} className="s-door__point">
                      <span className="s-door__point-dot" aria-hidden="true" />
                      {pt}
                    </span>
                  ))}
                </span>

                <span className="s-door__cta">
                  <span>{c.explore}</span>
                  <Arrow />
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
