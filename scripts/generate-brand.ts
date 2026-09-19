/**
 * Genera los iconos del sitio a partir de public/brand/logo-mark-dark.svg.
 * Uso: pnpm brand
 *
 * Salidas:
 *  - src/app/icon.png, apple-icon.png, favicon.ico  (convención de archivos de Next)
 *  - public/icons/icon-192.png, icon-512.png, icon-maskable-512.png (web manifest)
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const BG = '#040712';
const MARK_SVG = path.join(ROOT, 'public/brand/logo-mark-dark.svg');

/** Devuelve un PNG cuadrado con el isotipo centrado. `markRatio` = ancho del isotipo / lado. */
async function render(size: number, markRatio: number, opts: { rounded?: boolean } = {}) {
  const markWidth = Math.round(size * markRatio);
  const mark = await sharp(await readFile(MARK_SVG), { density: 400 })
    .resize({ width: markWidth })
    .png()
    .toBuffer();

  const radius = opts.rounded ? Math.round(size * 0.22) : 0;
  const background = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/></svg>`,
  );

  return sharp(background)
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer();
}

/** ICO con una sola imagen PNG incrustada (soportado por todos los navegadores actuales). */
function pngToIco(png: Buffer, size: number) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reservado
  header.writeUInt16LE(1, 2); // tipo: icono
  header.writeUInt16LE(1, 4); // nº de imágenes
  header.writeUInt8(size >= 256 ? 0 : size, 6);
  header.writeUInt8(size >= 256 ? 0 : size, 7);
  header.writeUInt16LE(1, 10); // planos
  header.writeUInt16LE(32, 12); // bits por píxel
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18); // offset de los datos
  return Buffer.concat([header, png]);
}

async function main() {
  await mkdir(path.join(ROOT, 'public/icons'), { recursive: true });

  await writeFile(path.join(ROOT, 'src/app/icon.png'), await render(512, 0.62, { rounded: true }));
  await writeFile(path.join(ROOT, 'src/app/apple-icon.png'), await render(180, 0.6));
  await writeFile(
    path.join(ROOT, 'src/app/favicon.ico'),
    pngToIco(await render(48, 0.68, { rounded: true }), 48),
  );

  await writeFile(
    path.join(ROOT, 'public/icons/icon-192.png'),
    await render(192, 0.62, { rounded: true }),
  );
  await writeFile(
    path.join(ROOT, 'public/icons/icon-512.png'),
    await render(512, 0.62, { rounded: true }),
  );
  // Maskable: el isotipo debe caber en la zona segura (círculo central del 80 %).
  await writeFile(path.join(ROOT, 'public/icons/icon-maskable-512.png'), await render(512, 0.5));

  console.log('Iconos generados.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
