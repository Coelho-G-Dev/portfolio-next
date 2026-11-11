import { readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ivory = '#F4EEE3';
// O pacote é CommonJS; este módulo de dados só possui imports de tipos.
const copySource = await readFile(resolve(root, 'lib/i18n/site.ts'), 'utf8');
const copyModule = stripTypeScriptTypes(copySource);
const { siteCopy } = await import(`data:text/javascript;base64,${Buffer.from(copyModule).toString('base64')}`);

export function cardModel() {
  const { hero, sharing } = siteCopy.pt;
  return { label: hero.label, name: hero.name, line: sharing.line, alt: sharing.alt };
}

// Reutiliza as fontes do next/font após npm run build, sem acesso à rede.
async function cardFonts() {
  const directory = resolve(root, '.next/static/css');
  const faces = [];
  for (const file of await readdir(directory)) {
    if (!file.endsWith('.css')) continue;
    const css = await readFile(resolve(directory, file), 'utf8');
    for (const face of css.match(/@font-face\{[^}]+\}/g) ?? []) {
      if (!/font-family:(?:Bricolage Grotesque|JetBrains Mono);/.test(face)) continue;
      const source = face.match(/url\((\/_next\/static\/media\/[^)]+)\)/);
      if (!source) continue;
      const data = await readFile(resolve(root, '.next', source[1].slice('/_next/'.length)));
      faces.push(face.replace(source[1], `data:font/woff2;base64,${data.toString('base64')}`));
    }
  }
  if (!faces.some((face) => face.includes('Bricolage Grotesque')) || !faces.some((face) => face.includes('JetBrains Mono'))) {
    throw new Error('Fontes não encontradas. Execute npm run build antes de gerar o cartão.');
  }
  return faces.join('\n');
}

export async function renderCard() {
  const { chromium } = await import('@playwright/test');
  const html = await readFile(resolve(root, 'tools/brand/og-card.html'), 'utf8');
  const fonts = await cardFonts();
  const poster = await readFile(resolve(root, 'public/hero/poster.webp'));
  const model = cardModel();
  const browser = await chromium.launch({ channel: 'chrome' });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    await page.route('**/*', (route) => route.abort());
    await page.setContent(html);
    await page.addStyleTag({ content: fonts });
    await page.evaluate(async ({ model, poster }) => {
      for (const key of ['label', 'name', 'line']) {
        document.getElementById(key).textContent = key === 'name' ? model[key].replace(' ', '\n') : model[key];
      }
      const img = document.getElementById('poster');
      img.src = poster;
      await img.decode();
      await document.fonts.ready;
      for (const font of ['800 108px "Bricolage Grotesque"', '400 22px "JetBrains Mono"']) {
        if (!document.fonts.check(font)) throw new Error(`Fonte indisponível: ${font}`);
      }
    }, { model, poster: `data:image/webp;base64,${poster.toString('base64')}` });
    const screenshot = await page.screenshot({ type: 'png' });
    const png = await sharp(screenshot).png({ compressionLevel: 9, palette: true, quality: 100 }).toBuffer();
    if (png.length > 300 * 1024) throw new Error(`Cartão excede 300 KB: ${png.length} bytes`);
    await writeFile(resolve(root, 'app/opengraph-image.png'), png);
    await writeFile(resolve(root, 'app/opengraph-image.alt.txt'), model.alt);
  } finally {
    await browser.close();
  }
}

/** @param {{ size: number, data: Buffer }[]} pngs */
export function packIco(pngs) {
  if (!pngs.length || pngs.length > 65535) throw new RangeError('Quantidade inválida de imagens ICO');
  const header = Buffer.alloc(6 + 16 * pngs.length);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  let offset = header.length;
  pngs.forEach(({ size, data }, index) => {
    if (!Number.isInteger(size) || size < 1 || size > 256 || !Buffer.isBuffer(data)) {
      throw new TypeError('ICO exige tamanho entre 1 e 256 e dados em Buffer');
    }
    const entry = 6 + index * 16;
    header[entry] = size === 256 ? 0 : size;
    header[entry + 1] = size === 256 ? 0 : size;
    header.writeUInt16LE(1, entry + 4);
    header.writeUInt16LE(32, entry + 6);
    header.writeUInt32LE(data.length, entry + 8);
    header.writeUInt32LE(offset, entry + 12);
    offset += data.length;
  });
  return Buffer.concat([header, ...pngs.map(({ data }) => data)]);
}

export async function renderIcons() {
  const svg = await readFile(resolve(root, 'app/icon.svg'), 'utf8');
  // O iOS aplica os próprios cantos: o fundo desta versão é um quadrado cheio.
  const appleSvg = svg.replace(/<rect\b[^>]*\/>/, '<rect width="512" height="512" fill="#F4EEE3"/>');
  if (appleSvg === svg) throw new Error('Retângulo de fundo não encontrado no SVG');
  const apple = await sharp(Buffer.from(appleSvg)).resize(180, 180)
    .flatten({ background: ivory }).removeAlpha().png({ compressionLevel: 9 }).toBuffer();
  const pngs = [];
  for (const size of [16, 32, 48]) {
    pngs.push({ size, data: await sharp(Buffer.from(svg)).resize(size, size).png().toBuffer() });
  }
  await writeFile(resolve(root, 'app/apple-icon.png'), apple);
  await writeFile(resolve(root, 'app/favicon.ico'), packIco(pngs));
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await renderIcons();
  await renderCard();
}
