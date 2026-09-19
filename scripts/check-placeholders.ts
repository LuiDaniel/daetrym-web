/**
 * Lista todo el contenido de ejemplo que debe reemplazarse antes de publicar.
 * Busca `placeholder: true` en el frontmatter de /content y el marcador `PLACEHOLDER`
 * en /src/config. Uso: pnpm check:placeholders  (informativo; con --strict falla si hay alguno)
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

const found: string[] = [];

for (const file of walk(path.join(ROOT, 'content')).filter((f) => f.endsWith('.mdx'))) {
  const text = readFileSync(file, 'utf8');
  const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
  if (/^placeholder:\s*true\s*$/m.test(frontmatter)) found.push(path.relative(ROOT, file));
}

for (const file of walk(path.join(ROOT, 'src/config')).filter((f) => f.endsWith('.ts'))) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.includes('PLACEHOLDER'))
      found.push(`${path.relative(ROOT, file)}:${index + 1}  ${line.trim()}`);
  });
}

if (found.length === 0) {
  console.log('✓ No quedan placeholders.');
} else {
  console.log(
    `Placeholders pendientes de reemplazar (${found.length}):\n${found.map((f) => `  - ${f}`).join('\n')}`,
  );
  if (strict) process.exit(1);
}
