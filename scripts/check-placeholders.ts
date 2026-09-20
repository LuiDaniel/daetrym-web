/**
 * Lista todo el contenido de ejemplo o pendiente que debe revisarse antes de publicar:
 *  1. MDX de /content con `placeholder: true` en el frontmatter.
 *  2. Marcador `PLACEHOLDER` y datos con `placeholder: true` en /src/config.
 *  3. Marcadores `[COMPLETAR: …]` / `[COMPLETE: …]` en los textos de /src/messages
 *     (plantillas legales y política de divulgación: datos propios de la empresa).
 *  4. La bandera `draftNotices: true` (avisos de borrador visibles en las páginas legales).
 * Uso: pnpm check:placeholders  (informativo; con --strict falla si queda alguno)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const strict = process.argv.includes('--strict');

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

const rel = (file: string) => path.relative(ROOT, file).replaceAll('\\', '/');

const content: string[] = [];
const config: string[] = [];
const markers: string[] = [];

for (const file of walk(path.join(ROOT, 'content')).filter((f) => f.endsWith('.mdx'))) {
  const text = readFileSync(file, 'utf8');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  if (/^placeholder:\s*true\s*$/m.test(frontmatter)) content.push(rel(file));
}

for (const file of walk(path.join(ROOT, 'src/config')).filter((f) => f.endsWith('.ts'))) {
  readFileSync(file, 'utf8')
    .split(/\r?\n/)
    .forEach((line, index) => {
      if (/PLACEHOLDER|placeholder:\s*true|draftNotices:\s*true/.test(line)) {
        config.push(`${rel(file)}:${index + 1}  ${line.trim()}`);
      }
    });
}

// Un mismo marcador aparece en ES y EN: se cuentan por fichero para no duplicar el aviso.
const perFile = new Map<string, number>();
for (const file of walk(path.join(ROOT, 'src/messages')).filter((f) => f.endsWith('.json'))) {
  const count = (readFileSync(file, 'utf8').match(/\[(?:COMPLETAR|COMPLETE):/g) ?? []).length;
  if (count > 0) perFile.set(rel(file), count);
}
for (const [file, count] of perFile)
  markers.push(`${file}  (${count} marcador${count === 1 ? '' : 'es'})`);

const sections: [string, string[]][] = [
  ['Contenido MDX de ejemplo (/content)', content],
  ['Datos de ejemplo y banderas (/src/config)', config],
  ['Textos con datos pendientes (/src/messages)', markers],
];

const total = sections.reduce((sum, [, items]) => sum + items.length, 0);

if (total === 0) {
  console.log('✓ No quedan placeholders.');
} else {
  console.log(`Pendiente de revisar antes de publicar (${total}):\n`);
  for (const [title, items] of sections) {
    if (items.length === 0) continue;
    console.log(`${title}\n${items.map((item) => `  - ${item}`).join('\n')}\n`);
  }
  if (strict) process.exit(1);
}
