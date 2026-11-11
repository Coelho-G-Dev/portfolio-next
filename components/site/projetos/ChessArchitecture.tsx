"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { boards, PIECE_ROLE, type Board, type Piece } from "@/data/boards";
import { nodeSpecs } from "@/data/nodeSpecs";
import type { Project } from "@/data/projects";
import {
  boardToSvg,
  edgePath,
  notation,
  parseSquare,
  PIECE_GLYPH,
} from "@/lib/chessBoard";
import { copyText } from "@/lib/clipboard";
import { siteCopy } from "@/lib/i18n/site";

const COLS = 8;
const ROWS = 6;
const CELL = 100;
const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;
const RANKS = [6, 5, 4, 3, 2, 1] as const;
const PIECES: Piece[] = ["pawn", "knight", "bishop", "rook", "queen", "king"];
const PULSE_MS = 1200;

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mql.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  return reduced;
}

function BoardCanvas({
  board,
  lang,
  selectedId,
  onSelect,
  reducedMotion,
  pulseIndex,
  idPrefix,
  preview = false,
}: {
  board: Board;
  lang: "pt" | "en";
  selectedId: string | null;
  onSelect: (id: string, hasSpec: boolean) => void;
  reducedMotion: boolean;
  pulseIndex: number;
  idPrefix: string;
  preview?: boolean;
}) {
  const byId = new Map(board.nodes.map((n) => [n.id, n]));
  const squareWord = lang === "pt" ? "casa" : "square";
  const markerId = `${idPrefix}-arrow`;
  const activeEdge = board.edges[pulseIndex];
  const activeFrom = activeEdge ? byId.get(activeEdge.from) : undefined;
  const activeTo = activeEdge ? byId.get(activeEdge.to) : undefined;
  const activePath =
    activeFrom && activeTo
      ? edgePath(activeFrom.square, activeTo.square, CELL, ROWS)
      : null;

  return (
    <div className="s-board__scroll">
      <div className="s-board__frame">
        {/* Grade 8×6 discreta */}
        <div className="s-board__grid" aria-hidden="true">
          {RANKS.map((rank) =>
            FILES.map((file, cIdx) => {
              const rIdx = rank - 1;
              const dark = (cIdx + rIdx) % 2 === 1;
              return (
                <span
                  key={`${file}${rank}`}
                  className="s-board__cell"
                  data-dark={dark ? "true" : undefined}
                />
              );
            }),
          )}
        </div>

        {/* Coordenadas a–h e 1–6 */}
        <ol className="s-board__files" aria-hidden="true">
          {FILES.map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ol>
        <ol className="s-board__ranks" aria-hidden="true">
          {RANKS.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>

        {/* Setas tracejadas e pulso âmbar (uma aresta por vez, 1,2 s cada) */}
        <svg
          className="s-board__edges"
          viewBox={`0 0 ${COLS * CELL} ${ROWS * CELL}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="7"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="currentColor" />
            </marker>
          </defs>
          {board.edges.map((e, idx) => {
            const fromNode = byId.get(e.from);
            const toNode = byId.get(e.to);
            if (!fromNode || !toNode) return null;
            const d = edgePath(fromNode.square, toNode.square, CELL, ROWS);
            return (
              <path
                key={`${e.from}-${e.to}-${idx}`}
                d={d}
                className="s-board__edge"
                data-dashed={e.dashed ? "true" : undefined}
                markerEnd={`url(#${markerId})`}
              />
            );
          })}
          {!reducedMotion && activePath && (
            <circle
              key={pulseIndex}
              r="4.5"
              className="s-board__pulse"
              data-edge-index={pulseIndex}
              style={
                {
                  offsetPath: `path("${activePath}")`,
                  animationDuration: "1.2s",
                } as CSSProperties
              }
            />
          )}
        </svg>

        {/* Peças posicionadas nas casas */}
        <div className="s-board__pieces">
          {board.nodes.map((node) => {
            const { col, row } = parseSquare(node.square);
            const gridRow = ROWS - row;
            const gridCol = col + 1;
            const roleText = PIECE_ROLE[node.piece][lang];
            const labelText = node.label[lang];
            const hasSpec = Boolean(node.spec && nodeSpecs[node.spec]);
            const isSelected = hasSpec && selectedId === node.id;
            const Piece = preview ? "span" : "button";

            return (
              <Piece
                key={node.id}
                type={preview ? undefined : "button"}
                className="s-board__piece"
                data-critical={node.critical ? "true" : undefined}
                data-selected={isSelected ? "true" : undefined}
                aria-label={preview ? undefined : `${labelText}, ${roleText}, ${squareWord} ${node.square}`}
                aria-expanded={hasSpec && !preview ? isSelected : undefined}
                style={{ gridColumn: gridCol, gridRow }}
                onClick={preview ? undefined : () => onSelect(node.id, hasSpec)}
              >
                <span className="s-board__glyph" aria-hidden="true">
                  {PIECE_GLYPH[node.piece]}
                </span>
                <span className="s-board__label">{labelText}</span>
                <span className="s-board__coord" aria-hidden="true">
                  {node.square}
                </span>
              </Piece>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function ChessArchitecture({
  project,
  lang,
  staticMode = false,
  preview = false,
}: {
  project: Project;
  lang: "pt" | "en";
  staticMode?: boolean;
  /** Gêmeo visual da miniatura da porta: mesmas caixas, sem efeitos nem cliques. */
  preview?: boolean;
}) {
  const board = boards[project.id];
  const b = siteCopy[lang].projetos.board;
  const reducedMotion = useReducedMotion();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const [fullscreen, setFullscreen] = useState(false);
  const [pulseIndex, setPulseIndex] = useState(0);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const fullscreenBtnRef = useRef<HTMLButtonElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (preview || !board || reducedMotion || board.edges.length === 0) return;
    const id = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % board.edges.length);
    }, PULSE_MS);
    return () => clearInterval(id);
  }, [board, reducedMotion, preview]);

  useEffect(() => {
    if (preview) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (fullscreen) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        dialogRef.current?.close?.();
        setFullscreen(false);
        fullscreenBtnRef.current?.focus();
      } else if (selectedId) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        setSelectedId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [fullscreen, selectedId, preview]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (fullscreen) {
      if (typeof dialog.showModal === "function" && !dialog.open) {
        try {
          dialog.showModal();
        } catch {
          dialog.setAttribute("open", "");
        }
      } else {
        dialog.setAttribute("open", "");
      }
      closeBtnRef.current?.focus();
    } else if (dialog.open) {
      dialog.close?.();
    }
  }, [fullscreen]);

  if (!board) return null;

  const selectedNode = board.nodes.find((n) => n.id === selectedId) ?? null;
  const selectedSpec =
    selectedNode?.spec && nodeSpecs[selectedNode.spec]
      ? nodeSpecs[selectedNode.spec]
      : null;

  const handleToggleNode = (id: string, hasSpec: boolean) => {
    if (!hasSpec) {
      setSelectedId(null);
      return;
    }
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleCopyMermaid = async () => {
    const mermaid = project.architecture?.mermaid?.[lang] ?? "";
    if (!mermaid) return;
    const ok = await copyText("```mermaid\n" + mermaid + "\n```");
    setCopyStatus(ok ? "copied" : "failed");
  };

  const handleDownloadSvg = () => {
    const title = project.architecture?.title[lang] ?? project.title;
    const svg = boardToSvg(board, title, lang);
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-board.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const closeFullscreen = () => {
    dialogRef.current?.close?.();
    setFullscreen(false);
    fullscreenBtnRef.current?.focus();
  };

  const moves = notation(board, lang);

  const sidePanel = (
    <aside className="s-board__side" aria-label={preview ? undefined : b.notationTitle}>
      <div className="s-board__block">
        <p className="s-board__heading">{b.notationTitle}</p>
        <ol className="s-board__notation">
          {moves.map((m, i) => (
            <li key={i}>{m}</li>
          ))}
        </ol>
      </div>
      <div className="s-board__block">
        <p className="s-board__heading">{b.legendTitle}</p>
        <ul className="s-board__legend">
          {PIECES.map((piece) => (
            <li key={piece}>
              <span className="s-board__legend-glyph" aria-hidden="true">
                {PIECE_GLYPH[piece]}
              </span>{" "}
              <span>{PIECE_ROLE[piece][lang]}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );

  if (staticMode) {
    return (
      <div className="s-board s-board--static" data-project-board={project.id}>
        {project.architecture?.title[lang] && (
          <div className="s-board__toolbar">
            <p className="s-board__title">{project.architecture.title[lang]}</p>
          </div>
        )}
        {sidePanel}
      </div>
    );
  }

  const detailPanel = selectedNode && selectedSpec && (
    <div className="s-board__detail" data-node-detail={selectedNode.id}>
      <div className="s-board__detail-head">
        <span className="s-board__detail-title">
          {PIECE_GLYPH[selectedNode.piece]} {selectedNode.label[lang]} ({selectedNode.square})
        </span>
        <span className="s-board__detail-proto">{selectedSpec.protocol}</span>
      </div>
      <p className="s-board__detail-role">{selectedSpec.role[lang]}</p>
      <p className="s-board__detail-tradeoff">{selectedSpec.tradeoff[lang]}</p>
    </div>
  );

  // A miniatura fica dentro do botão da porta: nenhum controle pode ser
  // interativo, mesmo que a raiz já seja inert e aria-hidden.
  const Button = preview ? "span" : "button";
  const btn = (onClick: () => void) => (preview ? {} : { onClick });

  return (
    <div className="s-board" data-project-board={preview ? undefined : project.id}>
      <div className="s-board__toolbar">
        {project.architecture?.title[lang] && (
          <p className="s-board__title">{project.architecture.title[lang]}</p>
        )}
        <div className="s-board__actions">
          {project.architecture?.mermaid && (
            <Button
              type={preview ? undefined : "button"}
              className="s-board__btn"
              {...btn(handleCopyMermaid)}
            >
              {b.copyMermaid}
            </Button>
          )}
          <Button
            type={preview ? undefined : "button"}
            className="s-board__btn"
            {...btn(handleDownloadSvg)}
          >
            {b.downloadSvg}
          </Button>
          <Button
            ref={preview ? undefined : fullscreenBtnRef}
            type={preview ? undefined : "button"}
            className="s-board__btn"
            {...btn(() => setFullscreen(true))}
          >
            {b.fullscreen}
          </Button>
          <span
            className="s-board__status"
            role={preview ? undefined : "status"}
            aria-live={preview ? undefined : "polite"}
          >
            {copyStatus === "copied"
              ? b.copied
              : copyStatus === "failed"
                ? b.copyFailed
                : ""}
          </span>
        </div>
      </div>

      <p className="s-board__swipe">
        <span aria-hidden="true">↔</span>
        <span>{b.swipe}</span>
      </p>

      {!fullscreen && (
        <>
          <div className="s-board__main">
            <BoardCanvas
              board={board}
              lang={lang}
              selectedId={selectedId}
              onSelect={handleToggleNode}
              reducedMotion={reducedMotion}
              pulseIndex={pulseIndex}
              idPrefix={`board-${preview ? "preview-" : ""}${project.id}`}
              preview={preview}
            />
            {sidePanel}
          </div>
          {detailPanel}
        </>
      )}

      {!preview && (
        <dialog
          ref={dialogRef}
          className="s-board__dialog"
          aria-label={project.architecture?.title[lang] ?? project.title}
          onClose={() => {
            setFullscreen(false);
            fullscreenBtnRef.current?.focus();
          }}
        >
          {fullscreen && (
            <div className="s-board__dialog-inner">
              <div className="s-board__dialog-head">
                <p className="s-board__title">
                  {project.architecture?.title[lang] ?? project.title}
                </p>
                <button
                  ref={closeBtnRef}
                  type="button"
                  className="s-board__btn"
                  onClick={closeFullscreen}
                >
                  {b.close}
                </button>
              </div>
              <div className="s-board__main">
                <BoardCanvas
                  board={board}
                  lang={lang}
                  selectedId={selectedId}
                  onSelect={handleToggleNode}
                  reducedMotion={reducedMotion}
                  pulseIndex={pulseIndex}
                  idPrefix={`board-dialog-${project.id}`}
                />
                {sidePanel}
              </div>
              {detailPanel}
            </div>
          )}
        </dialog>
      )}
    </div>
  );
}
