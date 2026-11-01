import { PIECE_ROLE, type Board, type Piece } from "@/data/boards";
import { PALETTE } from "./palette";
import { escapeXml } from "./xml";

export const PIECE_GLYPH: Record<Piece, string> = {
  pawn: "♙",
  knight: "♘",
  bishop: "♗",
  rook: "♖",
  queen: "♕",
  king: "♔",
};

const COLS = 8;
const DEFAULT_ROWS = 6;
const FILE_NAMES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

export function parseSquare(sq: string): { col: number; row: number } {
  if (!/^[a-h][1-6]$/.test(sq)) {
    throw new Error(`Casa inválida: "${sq}"`);
  }
  const col = sq.charCodeAt(0) - 97;
  const row = Number(sq[1]) - 1;
  return { col, row };
}

export function nodeCenter(sq: string, cell: number, rows = DEFAULT_ROWS): { x: number; y: number } {
  const { col, row } = parseSquare(sq);
  return {
    x: (col + 0.5) * cell,
    y: (rows - 1 - row + 0.5) * cell,
  };
}

export function edgePath(from: string, to: string, cell: number, rows = DEFAULT_ROWS): string {
  const a = nodeCenter(from, cell, rows);
  const b = nodeCenter(to, cell, rows);
  const dx = b.x - a.x;
  const dy = b.y - a.y;

  if (dx === 0 || dy === 0) {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }

  const r = Math.min(8, Math.abs(dx) / 2, Math.abs(dy) / 2);
  const sx = Math.sign(dx);
  const sy = Math.sign(dy);
  const cornerX = b.x;
  const cornerY = a.y;

  return [
    `M ${a.x} ${a.y}`,
    `L ${cornerX - sx * r} ${cornerY}`,
    `Q ${cornerX} ${cornerY} ${cornerX} ${cornerY + sy * r}`,
    `L ${b.x} ${b.y}`,
  ].join(" ");
}

export function notation(board: Board, lang: "pt" | "en"): string[] {
  const byId = new Map(board.nodes.map((n) => [n.id, n]));
  const moves = board.edges.map((e, i) => {
    const fromLabel = byId.get(e.from)?.label[lang] ?? e.from;
    const toLabel = byId.get(e.to)?.label[lang] ?? e.to;
    const note = e.label ? ` (${e.label[lang]})` : "";
    return `${i + 1}. ${fromLabel} → ${toLabel}${note}`;
  });
  const lost = lang === "pt" ? "Peças perdidas: 0" : "Pieces lost: 0";
  return [...moves, lost];
}

export function boardToSvg(board: Board, title: string, lang: "pt" | "en"): string {
  const cell = 110;
  const padX = 48;
  const padTop = 72;
  const legendHeight = 84;
  const boardW = COLS * cell;
  const boardH = DEFAULT_ROWS * cell;
  const width = boardW + padX * 2;
  const height = padTop + boardH + legendHeight;

  const byId = new Map(board.nodes.map((n) => [n.id, n]));

  const squares: string[] = [];
  for (let r = 0; r < DEFAULT_ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = padX + c * cell;
      const y = padTop + (DEFAULT_ROWS - 1 - r) * cell;
      const isDark = (c + r) % 2 === 1;
      const fill = isDark ? PALETTE.nogueiraEscura : PALETTE.ebano;
      const fillOpacity = isDark ? "0.4" : "1";
      squares.push(
        `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${fill}" fill-opacity="${fillOpacity}" />`,
      );
    }
  }

  const coords: string[] = [];
  for (let c = 0; c < COLS; c++) {
    const x = padX + (c + 0.5) * cell;
    const y = padTop + boardH + 20;
    coords.push(
      `<text x="${x}" y="${y}" text-anchor="middle" fill="${PALETTE.bordo}" font-family="monospace" font-size="12">${FILE_NAMES[c]}</text>`,
    );
  }
  for (let r = 0; r < DEFAULT_ROWS; r++) {
    const x = padX - 16;
    const y = padTop + (DEFAULT_ROWS - 1 - r + 0.5) * cell + 4;
    coords.push(
      `<text x="${x}" y="${y}" text-anchor="end" fill="${PALETTE.bordo}" font-family="monospace" font-size="12">${r + 1}</text>`,
    );
  }

  const edgesSvg = board.edges
    .map((e) => {
      const fromNode = byId.get(e.from);
      const toNode = byId.get(e.to);
      if (!fromNode || !toNode) return "";
      const d = edgePath(fromNode.square, toNode.square, cell, DEFAULT_ROWS);
      const dash = e.dashed ? "4 6" : "6 4";
      return `<path d="${d}" transform="translate(${padX} ${padTop})" fill="none" stroke="${PALETTE.bordo}" stroke-width="1.75" stroke-dasharray="${dash}" marker-end="url(#board-arrow)" />`;
    })
    .join("\n    ");

  const nodesSvg = board.nodes
    .map((n) => {
      const { x, y } = nodeCenter(n.square, cell, DEFAULT_ROWS);
      const cx = padX + x;
      const cy = padTop + y;
      const boxW = cell - 14;
      const boxH = cell - 18;
      const rx = cx - boxW / 2;
      const ry = cy - boxH / 2;
      const stroke = n.critical ? PALETTE.ambar : PALETTE.nogueira;
      const strokeWidth = n.critical ? "2" : "1.5";
      const critAttr = n.critical ? ` data-critical="true"` : "";
      const glyph = PIECE_GLYPH[n.piece];
      const label = escapeXml(n.label[lang]);
      const sq = escapeXml(n.square);
      return [
        `<g data-board-node="${escapeXml(n.id)}">`,
        `  <rect x="${rx}" y="${ry}" width="${boxW}" height="${boxH}" rx="12" fill="${PALETTE.ebano}" stroke="${stroke}" stroke-width="${strokeWidth}"${critAttr} />`,
        `  <text x="${cx}" y="${cy - 10}" text-anchor="middle" fill="${n.critical ? PALETTE.ambar : PALETTE.marfim}" font-size="22">${glyph}</text>`,
        `  <text x="${cx}" y="${cy + 14}" text-anchor="middle" fill="${PALETTE.marfim}" font-family="sans-serif" font-size="11" font-weight="600" data-node-label="true">${label}</text>`,
        `  <text x="${cx}" y="${cy + 30}" text-anchor="middle" fill="${PALETTE.bordo}" font-family="monospace" font-size="10">${sq}</text>`,
        `</g>`,
      ].join("\n    ");
    })
    .join("\n    ");

  const piecesOrder: Piece[] = ["pawn", "knight", "bishop", "rook", "queen", "king"];
  const legendItems = piecesOrder
    .map((p, idx) => {
      const lx = padX + idx * Math.floor(boardW / piecesOrder.length);
      const ly = padTop + boardH + 54;
      return `<text x="${lx}" y="${ly}" fill="${PALETTE.bordo}" font-family="monospace" font-size="11">${PIECE_GLYPH[p]} ${escapeXml(PIECE_ROLE[p][lang])}</text>`;
    })
    .join("\n    ");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeXml(title)}">`,
    `  <defs>`,
    `    <marker id="board-arrow" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">`,
    `      <path d="M 0 1 L 8 5 L 0 9 z" fill="${PALETTE.bordo}" />`,
    `    </marker>`,
    `  </defs>`,
    `  <rect width="${width}" height="${height}" fill="${PALETTE.ebano}" />`,
    `  <text x="${padX}" y="42" fill="${PALETTE.marfim}" font-family="sans-serif" font-size="18" font-weight="700">${escapeXml(title)}</text>`,
    `  <g data-board-grid="true">`,
    `    <rect x="${padX}" y="${padTop}" width="${boardW}" height="${boardH}" fill="none" stroke="${PALETTE.nogueira}" stroke-width="1.5" />`,
    `    ${squares.join("\n    ")}`,
    `    ${coords.join("\n    ")}`,
    `  </g>`,
    `  <g data-board-edges="true">`,
    `    ${edgesSvg}`,
    `  </g>`,
    `  <g data-board-nodes="true">`,
    `    ${nodesSvg}`,
    `  </g>`,
    `  <g data-board-legend="true">`,
    `    ${legendItems}`,
    `  </g>`,
    `</svg>`,
  ].join("\n");
}
