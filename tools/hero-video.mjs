// Pipeline de vídeo do personagem do hero (spec §5.2 e Apêndice A).
//
// Lê os brutos de assets-src/hero/ (fora do git) e grava em public/hero/:
//   entrada.mp4     reverso da Entrada (termina na pose neutra)
//   olhar.mp4       reverso(Olhar A) + Olhar B: esquerda → neutra (meio) → direita
//   olhar-loop.mp4  B + reverso(B) + A + reverso(A): vaivém para o celular
//   hover.mp4, clique-N.mp4   reações (os cliques que faltarem são pulados)
//   poster.webp     quadro 0 do hover já codificado (a cor bate com o vídeo)
//   manifest.json   arquivos, tamanho, cor de fundo e bytes
//
// Os pontos de corte vêm de assets-src/hero/cortes.json:
//   { "<clipe>": { "in": segundos, "out": segundos } }
//
// Uso: node tools/hero-video.mjs [--src assets-src/hero] [--out public/hero]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const SRC = arg("--src", "assets-src/hero");
const OUT = arg("--out", "public/hero");
const FIRST_LOAD_BUDGET = 1_600_000;

const REQUIRED = ["entrada", "olhar-a", "olhar-b", "hover"];
const CLICKS = ["clique-1", "clique-2", "clique-3"];

function fail(message) {
  console.error(`hero-video: ${message}`);
  process.exit(1);
}

function ffmpeg(args) {
  execFileSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"] });
}

function probe(file, entries) {
  return execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", entries, "-of", "csv=p=0", file], {
    encoding: "utf8",
  }).trim();
}

// ---------- Entradas ----------
const raw = (name) => join(SRC, `${name}.mp4`);
for (const name of REQUIRED) if (!existsSync(raw(name))) fail(`falta o bruto ${raw(name)}`);
const clicks = CLICKS.filter((name) => existsSync(raw(name)));
if (clicks.length === 0) fail("falta pelo menos um clique (clique-1.mp4, clique-2.mp4 ou clique-3.mp4)");

const cortesPath = join(SRC, "cortes.json");
if (!existsSync(cortesPath)) fail(`falta ${cortesPath}`);
const cortes = JSON.parse(readFileSync(cortesPath, "utf8"));
for (const name of [...REQUIRED, ...clicks]) {
  const c = cortes[name];
  if (!c || typeof c.in !== "number" || typeof c.out !== "number" || c.out <= c.in) {
    fail(`cortes.json precisa de { "in": n, "out": n } válido para "${name}"`);
  }
}

// Olhar A e B ficam com a mesma duração, para a pose neutra cair no meio.
const olharDur = Math.min(cortes["olhar-a"].out - cortes["olhar-a"].in, cortes["olhar-b"].out - cortes["olhar-b"].in);
const cut = (name, dur) => {
  const { in: start, out } = cortes[name];
  const end = dur === undefined ? out : start + dur;
  return `trim=start=${start}:end=${end},setpts=PTS-STARTPTS,fps=24`;
};

// ---------- Codificação ----------
// O filtro de escala nunca amplia: os brutos vêm em 720p.
const SCALE = "scale=-2:min(1080\\,ih)";
const encode = (gop) => [
  "-an",
  "-c:v", "libx264",
  "-pix_fmt", "yuv420p",
  "-preset", "slow",
  "-crf", "27",
  "-bf", "0",
  "-g", String(gop),
  "-movflags", "+faststart",
];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });
const out = (file) => join(OUT, file);

// Entrada: invertida, termina na pose neutra.
ffmpeg(["-i", raw("entrada"), "-filter_complex", `[0:v]${cut("entrada")},reverse,${SCALE}[v]`, "-map", "[v]", ...encode(48), out("entrada.mp4")]);

// Olhar: reverso(A) + B. Quadro-chave a cada 4 quadros para o scrub ficar liso.
ffmpeg([
  "-i", raw("olhar-a"),
  "-i", raw("olhar-b"),
  "-filter_complex",
  `[0:v]${cut("olhar-a", olharDur)},reverse[a];[1:v]${cut("olhar-b", olharDur)}[b];[a][b]concat=n=2:v=1:a=0,${SCALE}[v]`,
  "-map", "[v]",
  ...encode(4),
  out("olhar.mp4"),
]);

// Loop do celular: B + reverso(B) + A + reverso(A), com a pose neutra em 0, ½ e no fim.
ffmpeg([
  "-i", raw("olhar-a"),
  "-i", raw("olhar-b"),
  "-filter_complex",
  `[1:v]${cut("olhar-b", olharDur)},split[b1][b2];[b2]reverse[br];` +
    `[0:v]${cut("olhar-a", olharDur)},split[a1][a2];[a2]reverse[ar];` +
    `[b1][br][a1][ar]concat=n=4:v=1:a=0,${SCALE}[v]`,
  "-map", "[v]",
  ...encode(4),
  out("olhar-loop.mp4"),
]);

// Reações: só o trecho útil, sem inverter.
const reactions = {};
for (const name of ["hover", ...clicks]) {
  ffmpeg(["-i", raw(name), "-filter_complex", `[0:v]${cut(name)},${SCALE}[v]`, "-map", "[v]", ...encode(48), out(`${name}.mp4`)]);
  reactions[name] = `${name}.mp4`;
}

// Poster: quadro 0 do hover já codificado.
ffmpeg(["-i", out("hover.mp4"), "-frames:v", "1", "-c:v", "libwebp", "-quality", "82", out("poster.webp")]);

// Cor de fundo: média de 32×32 px no canto superior esquerdo do poster.
const rgb = execFileSync(
  "ffmpeg",
  ["-v", "error", "-i", out("poster.webp"), "-vf", "crop=32:32:8:8,scale=1:1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
  { maxBuffer: 1024 },
);
const bg = `#${[...rgb.subarray(0, 3)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;

const [width, height] = probe(out("olhar.mp4"), "stream=width,height").split(",").map(Number);
const files = ["poster.webp", "entrada.mp4", "olhar.mp4", "olhar-loop.mp4", ...Object.values(reactions)];
const bytes = Object.fromEntries(files.map((f) => [f, statSync(out(f)).size]));

const manifest = {
  bg,
  width,
  height,
  poster: "poster.webp",
  entrada: "entrada.mp4",
  olhar: "olhar.mp4",
  olharLoop: "olhar-loop.mp4",
  reactions,
  bytes,
};
writeFileSync(out("manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

// ---------- Relatório ----------
console.table(Object.fromEntries(files.map((f) => [f, { KB: Math.round(bytes[f] / 1024) }])));
const firstLoad = bytes["poster.webp"] + bytes["entrada.mp4"] + bytes["olhar.mp4"];
console.log(`primeira carga (poster + entrada + olhar): ${Math.round(firstLoad / 1024)} KB · fundo ${bg} · ${width}×${height}`);
console.log(`cliques: ${clicks.join(", ")}${clicks.length < CLICKS.length ? " (os outros estão pendentes)" : ""}`);
if (firstLoad > FIRST_LOAD_BUDGET) {
  console.warn(`AVISO: a primeira carga passa de ${Math.round(FIRST_LOAD_BUDGET / 1024)} KB. Ajuste -crf ou -g.`);
}
