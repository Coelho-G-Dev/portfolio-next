// Clipes provisórios do personagem, para o hero funcionar antes dos vídeos
// finais. NUNCA sobrescreve um arquivo existente: só cria o que falta.
//
// - neutra.png: se faltar, é o retrato de public/photos/web/ sobre fundo marfim.
// - entrada, olhar-a, olhar-b, hover e clique-1: se faltarem, saem da neutra
//   com movimentos simples (deslizar, escalar, saltar), todos começando na
//   posição neutra, como os clipes reais.
// - clique-2 e clique-3 são opcionais e não são criados.
// - cortes.json: ganha uma entrada (clipe inteiro) para cada clipe criado.
//
// Uso: node tools/hero-placeholder.mjs [--dir assets-src/hero]

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const i = process.argv.indexOf("--dir");
const DIR = i > -1 ? process.argv[i + 1] : "assets-src/hero";
const W = 1280;
const H = 720;
const DUR = 5;
const BG = "0xF4EEE3";

mkdirSync(DIR, { recursive: true });
const ff = (args) => execFileSync("ffmpeg", ["-v", "error", "-n", ...args], { stdio: ["ignore", "inherit", "inherit"] });

const neutra = join(DIR, "neutra.png");
if (!existsSync(neutra)) {
  // Retrato de 460px de altura, centrado em ~68% da largura (como nos clipes reais).
  ff([
    "-f", "lavfi", "-i", `color=c=${BG}:s=${W}x${H}`,
    "-i", "public/photos/web/retrato-quadrado.webp",
    "-filter_complex", `[1:v]scale=-2:460[p];[0:v][p]overlay=x=${Math.round(W * 0.68)}-w/2:y=(H-h)/2`,
    "-frames:v", "1", neutra,
  ]);
  console.log(`criado ${neutra}`);
}

// Cada movimento é uma expressão de overlay em função de t (segundos).
// Todas valem a posição neutra em t=0.
const X0 = "(W-w)/2";
const Y0 = "(H-h)/2";
const MOVES = {
  entrada: { x: X0, y: `${Y0}+80*min(t/2\\,1)`, fadeOut: true },
  "olhar-a": { x: `${X0}-48*min(t/2\\,1)`, y: Y0 },
  "olhar-b": { x: `${X0}+48*min(t/2\\,1)`, y: Y0 },
  hover: { x: X0, y: `${Y0}-12*sin(PI*min(t/1.5\\,1))` },
  "clique-1": { x: X0, y: `${Y0}-24*abs(sin(PI*min(t/2\\,1)))` },
};

const cortesPath = join(DIR, "cortes.json");
const cortes = existsSync(cortesPath) ? JSON.parse(readFileSync(cortesPath, "utf8")) : {};
let changed = false;

for (const [name, move] of Object.entries(MOVES)) {
  const file = join(DIR, `${name}.mp4`);
  if (existsSync(file)) continue;
  // A Entrada some (alfa) enquanto desce; invertida, ela sobe e aparece.
  const fade = move.fadeOut ? ",format=rgba,fade=t=out:st=0:d=2:alpha=1" : "";
  ff([
    "-f", "lavfi", "-i", `color=c=${BG}:s=${W}x${H}:d=${DUR}:r=24`,
    "-loop", "1", "-t", String(DUR), "-i", neutra,
    "-filter_complex",
    `[1:v]scale=${W}:${H}${fade}[n];[0:v][n]overlay=x='${move.x}':y='${move.y}':eval=frame:shortest=1,format=yuv420p[v]`,
    "-map", "[v]", "-c:v", "libx264", "-crf", "18", "-r", "24", file,
  ]);
  cortes[name] = { in: 0, out: DUR };
  changed = true;
  console.log(`criado ${file}`);
}

if (changed) writeFileSync(cortesPath, `${JSON.stringify(cortes, null, 2)}\n`);
console.log("hero-placeholder: pronto (nada existente foi alterado).");
