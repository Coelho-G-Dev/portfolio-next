import type { ContributionWeek } from "@/lib/github";

const SIZE = 100;
const GAP = 6;
const COLS = 18;

// Tons de marchetaria na madeira (paleta Tabuleiro)
const TILE_BASE = "#FAF6F0";
const TILE_WOOD_LIGHT = "#C4A882";
const TILE_WOOD_MED = "#8A6A4A";
const TILE_WOOD_DARK = "#2A2018";
const TILE_AMBAR = "#F5A524";

const CORNER = {
  tl: "M0,0 L50,0 A50,50 0 0 1 0,50 Z",
  tr: "M100,0 L100,50 A50,50 0 0 1 50,0 Z",
  br: "M100,100 L50,100 A50,50 0 0 1 100,50 Z",
  bl: "M0,100 L0,50 A50,50 0 0 1 50,100 Z",
};
const DIAMOND = "M50,22 L78,50 L50,78 L22,50 Z";

function Motif({ level, flip }: { level: ContributionWeek["level"]; flip: boolean }) {
  if (level === 0) return null;
  if (level === 1) {
    const pair = flip ? [CORNER.tr, CORNER.bl] : [CORNER.tl, CORNER.br];
    return (
      <>
        {pair.map((d) => (
          <path key={d} d={d} fill={TILE_WOOD_LIGHT} />
        ))}
      </>
    );
  }
  const cornerFill = level === 2 ? TILE_WOOD_LIGHT : TILE_WOOD_MED;
  return (
    <>
      {Object.values(CORNER).map((d) => (
        <path key={d} d={d} fill={cornerFill} />
      ))}
      {level >= 3 && <path d={DIAMOND} fill={TILE_WOOD_DARK} />}
      {level === 4 && <circle cx="50" cy="50" r="14" fill={TILE_AMBAR} />}
    </>
  );
}

type Props = {
  weeks: ContributionWeek[];
  label: string;
  tileLabel: (week: string, count: number) => string;
  locale: string;
};

export default function Tiles({ weeks, label, tileLabel, locale }: Props) {
  const rows = Math.ceil(weeks.length / COLS);
  const width = COLS * SIZE + (COLS - 1) * GAP;
  const height = rows * SIZE + (rows - 1) * GAP;
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" });

  return (
    <svg
      className="s-tiles__panel"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
    >
      {weeks.map((w, i) => {
        const x = (i % COLS) * (SIZE + GAP);
        const y = Math.floor(i / COLS) * (SIZE + GAP);
        return (
          <g key={w.start} transform={`translate(${x} ${y})`}>
            <g className="s-tile">
              <title>{tileLabel(fmt.format(new Date(`${w.start}T12:00:00`)), w.count)}</title>
              <rect width={SIZE} height={SIZE} rx="4" fill={TILE_BASE} />
              <Motif level={w.level} flip={i % 2 === 1} />
            </g>
          </g>
        );
      })}
    </svg>
  );
}
