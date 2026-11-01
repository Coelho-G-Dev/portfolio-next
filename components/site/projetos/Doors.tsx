import type { Door } from "@/data/projects";
import { Arrow } from "../Pill";
import { useSiteCopy } from "../SiteCopyContext";

export const DOOR_ORDER: Door[] = ["backend", "frontend", "ia"];

export default function Doors({
  openingDoor,
  onSelectDoor,
  doorRefs,
}: {
  openingDoor: Door | null;
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
          return (
            <button
              key={door}
              ref={doorRefs[door]}
              type="button"
              className="s-door"
              data-door={door}
              data-open={isOpening ? "true" : undefined}
              aria-label={c.open(copy.name)}
              aria-expanded={isOpening}
              aria-controls={`door-panel-${door}`}
              onClick={() => onSelectDoor(door)}
            >
              <span className="s-door__frame" aria-hidden="true">
                <span className="s-door__interior" />
                <span className="s-door__leaf" data-leaf="left">
                  <span className="s-door__inlay" />
                  <span className="s-door__handle" />
                </span>
                <span className="s-door__leaf" data-leaf="right">
                  <span className="s-door__inlay" />
                  <span className="s-door__handle" />
                </span>
                <span
                  className="s-door__plate s-pill"
                  data-variant="primary"
                  data-surface="dark"
                >
                  <span className="s-pill__label">{copy.name}</span>
                  <span className="s-pill__dot">
                    <Arrow />
                  </span>
                </span>
              </span>
              <span className="s-door__teaser">{copy.teaser}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
