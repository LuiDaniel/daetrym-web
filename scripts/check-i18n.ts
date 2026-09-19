/**
 * Verifica que src/messages/es.json y en.json tengan exactamente las mismas claves
 * y que ninguna cadena esté vacía. Uso: pnpm check:i18n
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const dir = path.join(process.cwd(), 'src/messages');
const locales = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));

function flatten(value: unknown, prefix = ''): Record<string, unknown> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, val]) => {
      Object.assign(acc, flatten(val, prefix ? `${prefix}.${key}` : key));
      return acc;
    }, {});
  }
  return { [prefix]: value };
}

const flat = Object.fromEntries(
  locales.map((locale) => [
    locale,
    flatten(JSON.parse(readFileSync(path.join(dir, `${locale}.json`), 'utf8'))),
  ]),
);

const all = new Set(Object.values(flat).flatMap((messages) => Object.keys(messages)));
const problems: string[] = [];

for (const locale of locales) {
  const messages = flat[locale] ?? {};
  for (const key of all) {
    if (!(key in messages)) problems.push(`[${locale}] falta la clave: ${key}`);
    else if (typeof messages[key] === 'string' && (messages[key] as string).trim() === '') {
      problems.push(`[${locale}] cadena vacía: ${key}`);
    }
  }
}

if (problems.length > 0) {
  console.error(
    `✗ ${problems.length} problema(s) de i18n:\n${problems.map((p) => `  ${p}`).join('\n')}`,
  );
  process.exit(1);
}

console.log(`✓ i18n: ${all.size} claves idénticas en ${locales.join(', ')}.`);
