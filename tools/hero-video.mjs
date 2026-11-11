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

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { median3, noiseOf, firstFrame, lastFrame, balanceK, buildCurve, gates } from "./hero-vertical.mjs";

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i > -1 ? process.argv[i + 1] : fallback;
};
const SRC = arg("--src", "assets-src/hero");
const OUT = arg("--out", "public/hero");
const FFMPEG = arg("--ffmpeg", "ffmpeg");
const FFPROBE = arg("--ffprobe", "ffprobe");
const FIRST_LOAD_BUDGET = 1_600_000;
const VERTICAL_ONLY = process.argv.includes("--vertical-only");
const REPORT = arg("--report", null);

const REQUIRED = ["entrada", "olhar-a", "olhar-b", "hover"];
const CLICKS = ["clique-1", "clique-2", "clique-3"];

function fail(message) {
  console.error(`hero-video: ${message}`);
  process.exit(1);
}

function ffmpeg(args) {
  execFileSync(FFMPEG, ["-v", "error", "-y", ...args], { stdio: ["ignore", "inherit", "inherit"], windowsHide: true });
}

function probe(file, entries) {
  return execFileSync(FFPROBE, ["-v", "error", "-select_streams", "v:0", "-show_entries", entries, "-of", "csv=p=0", file], {
    encoding: "utf8",
  }).trim();
}

// ---------- Entradas ----------
const raw = (name) => join(SRC, `${name}.mp4`);
for (const name of VERTICAL_ONLY ? ["olhar-b"] : REQUIRED) if (!existsSync(raw(name))) fail(`falta o bruto ${raw(name)}`);
const clicks = CLICKS.filter((name) => existsSync(raw(name)));
if (!VERTICAL_ONLY && clicks.length === 0) fail("falta pelo menos um clique (clique-1.mp4, clique-2.mp4 ou clique-3.mp4)");

const cortesPath = join(SRC, "cortes.json");
if (!existsSync(cortesPath)) fail(`falta ${cortesPath}`);
const cortes = JSON.parse(readFileSync(cortesPath, "utf8"));
for (const name of VERTICAL_ONLY ? [] : [...REQUIRED, ...clicks]) {
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

// Sobrescreve apenas os arquivos gerados; nunca apaga a pasta inteira de saída.
mkdirSync(OUT, { recursive: true });
const out = (file) => join(OUT, file);

function headMotion(gray) {
  const size = 640 * 360, motion = [0];
  for (let k = 1; k < gray.length / size; k++) {
    let sum = 0;
    for (let y = 14; y < 122; y++) for (let x = 358; x < 486; x++) {
      const i = y * 640 + x;
      sum += Math.abs(gray[k * size + i] - gray[(k - 1) * size + i]);
    }
    motion.push(sum / (128 * 108));
  }
  return motion;
}
function grayFrames(file, one = false) {
  return execFileSync(FFMPEG, ["-v", "error", "-i", file, ...(one ? ["-frames:v", "1"] : ["-t", "3"]), "-vf", "scale=640:360,format=gray", "-f", "rawvideo", "-"], { maxBuffer: 40_000_000, windowsHide: true });
}
function ssimFrame(a, ka, b, kb) {
  const filter = `[0:v]select=eq(n\\,${ka}),setpts=PTS-STARTPTS[a];[1:v]select=eq(n\\,${kb}),setpts=PTS-STARTPTS[b];[a][b]ssim`;
  const result = spawnSync(FFMPEG, ["-v", "info", "-i", a, "-i", b, "-filter_complex", filter, "-frames:v", "1", "-f", "null", "-"], { encoding: "utf8", windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(result.error?.message ?? result.stderr);
  const value = Number(result.stderr.match(/All:([\d.]+)/)?.[1]);
  if (!Number.isFinite(value)) throw new Error("SSIM não medido");
  return value;
}
function buildVertical(manifest) {
  const config = cortes.vertical;
  if (!config || !Array.isArray(config.noise) || config.noise.length !== 2) throw new Error("falta bloco vertical em cortes.json");
  const sides = {};
  for (const name of ["cima", "baixo"]) {
    const c = config[name];
    if (!c || typeof c.src !== "string" || !Number.isInteger(c.first) || !Number.isInteger(c.last)) throw new Error(`corte vertical ${name} inválido`);
    const file = join(SRC, c.src), gray = grayFrames(file), motion = headMotion(gray), mt = median3(motion);
    const b = noiseOf(mt, config.noise[0], config.noise[1]), F = firstFrame(mt, b), L = lastFrame(mt, b, F);
    if (F !== c.first || L !== c.last) throw new Error(`cortes ${name} divergiram: calculado ${F}/${L}, configurado ${c.first}/${c.last}`);
    sides[name] = { file, gray, mt, b, F, L };
  }
  const K = balanceK([sides.cima, sides.baixo]), frames = 2 * K + 1, curve = buildCurve(sides.cima, sides.baixo, K);
  const hFrames = Number(probe(out("olhar.mp4"), "stream=nb_frames")), hNeutral = Math.floor(hFrames / 2);
  if (!Number.isInteger(hFrames) || hFrames < 3) throw new Error("quantidade de quadros horizontal inválida");
  const temp = out(".olhar-v-tmp.mp4");
  try {
    const filters = `[0:v]setsar=1,trim=start_frame=${sides.cima.F}:end_frame=${sides.cima.F + K},setpts=PTS-STARTPTS,setsar=1,reverse[a];` +
      `[1:v]trim=end_frame=1,setpts=PTS-STARTPTS,setsar=1[b];` +
      `[2:v]setsar=1,trim=start_frame=${sides.baixo.F}:end_frame=${sides.baixo.F + K},setpts=PTS-STARTPTS,setsar=1[c];[a][b][c]concat=n=3:v=1:a=0[v]`;
    // Os parâmetros são os do candidato aceito (preset medium padrão), um só encode.
    ffmpeg(["-i", sides.cima.file, "-i", raw("olhar-b"), "-i", sides.baixo.file, "-filter_complex", filters, "-map", "[v]", "-frames:v", String(frames), "-an", "-c:v", "libx264", "-crf", "27", "-bf", "0", "-g", "4", "-pix_fmt", "yuv420p", "-movflags", "+faststart", temp]);
    if (Number(probe(temp, "stream=nb_frames")) !== frames) throw new Error("vertical gerado com quadros incorretos");
    const size = 640 * 360, frame = (side, k) => side.gray.subarray(k * size, (k + 1) * size), sequence = [];
    for (let j = K - 1; j >= 0; j--) sequence.push(frame(sides.cima, sides.cima.F + j));
    sequence.push(grayFrames(raw("olhar-b"), true));
    for (let j = 0; j < K; j++) sequence.push(frame(sides.baixo, sides.baixo.F + j));
    const motion = headMotion(Buffer.concat(sequence));
    const firstLoad = ["poster.webp", "entrada.mp4", "olhar.mp4"].reduce((sum, file) => sum + statSync(out(file)).size, 0);
    const result = gates({ motion, K, bUp: sides.cima.b, bDown: sides.baixo.b, curve,
      neutralSsim: [ssimFrame(raw("olhar-b"), 0, temp, K - 1), ssimFrame(raw("olhar-b"), 0, temp, K + 1)],
      nativeSsim: ssimFrame(raw("olhar-b"), 0, temp, K), nativeReference: ssimFrame(raw("olhar-b"), 0, out("olhar.mp4"), hNeutral),
      canonicalSource: true, bytes: statSync(temp).size, firstLoad });
    const report = { frames, K, source: "olhar-b.mp4 frame 0 nativo", sides: Object.fromEntries(Object.entries(sides).map(([name, s]) => [name, { F: s.F, L: s.L, b: s.b, appliedLast: s.F + K - 1 }])), curve, headMotion: motion, gates: result };
    if (REPORT) writeFileSync(REPORT, JSON.stringify(report, null, 2) + "\n");
    console.log(JSON.stringify(result, null, 2));
    if (!Object.values(result).every(g => g.pass)) throw new Error("portão vertical reprovado; manifest preservado");
    renameSync(temp, out("olhar-v.mp4"));
    return { ...manifest, olharFrames: hFrames, olharNeutral: hNeutral, olharV: "olhar-v.mp4", olharVFrames: frames, olharVNeutral: K, olharVCurve: curve,
      bytes: { ...manifest.bytes, "olhar-v.mp4": statSync(out("olhar-v.mp4")).size } };
  } finally {
    rmSync(temp, { force: true });
  }
}

if (VERTICAL_ONLY) {
  try {
    const manifest = JSON.parse(readFileSync(out("manifest.json"), "utf8"));
    writeFileSync(out("manifest.json"), JSON.stringify(buildVertical(manifest), null, 2) + "\n");
  } catch (error) { fail(error.message); }
  process.exit(0);
}

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
  FFMPEG,
  ["-v", "error", "-i", out("poster.webp"), "-vf", "crop=32:32:8:8,scale=1:1", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
  { maxBuffer: 1024 },
);
const bg = `#${[...rgb.subarray(0, 3)].map((b) => b.toString(16).padStart(2, "0")).join("")}`;

const [width, height] = probe(out("olhar.mp4"), "stream=width,height").split(",").map(Number);
const files = ["poster.webp", "entrada.mp4", "olhar.mp4", "olhar-loop.mp4", ...Object.values(reactions)];
const bytes = Object.fromEntries(files.map((f) => [f, statSync(out(f)).size]));

let manifest = {
  bg,
  width,
  height,
  poster: "poster.webp",
  entrada: "entrada.mp4",
  olhar: "olhar.mp4",
  olharFrames: Number(probe(out("olhar.mp4"), "stream=nb_frames")),
  olharNeutral: Math.floor(Number(probe(out("olhar.mp4"), "stream=nb_frames")) / 2),
  olharLoop: "olhar-loop.mp4",
  reactions,
  bytes,
};
if (cortes.vertical) manifest = buildVertical(manifest);
writeFileSync(out("manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

// ---------- Relatório ----------
console.table(Object.fromEntries(files.map((f) => [f, { KB: Math.round(bytes[f] / 1024) }])));
const firstLoad = bytes["poster.webp"] + bytes["entrada.mp4"] + bytes["olhar.mp4"];
console.log(`primeira carga (poster + entrada + olhar): ${Math.round(firstLoad / 1024)} KB · fundo ${bg} · ${width}×${height}`);
console.log(`cliques: ${clicks.join(", ")}${clicks.length < CLICKS.length ? " (os outros estão pendentes)" : ""}`);
if (firstLoad > FIRST_LOAD_BUDGET) {
  console.warn(`AVISO: a primeira carga passa de ${Math.round(FIRST_LOAD_BUDGET / 1024)} KB. Ajuste -crf ou -g.`);
}
