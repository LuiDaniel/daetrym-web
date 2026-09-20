/**
 * Verifica que todos los idiomas de src/messages/<locale>/ tengan exactamente las mismas claves
 * (las listas se comparan elemento a elemento, así que también deben tener la misma longitud),
 * que ninguna cadena esté vacía y que los marcadores de plantilla sigan el formato acordado.
 * Uso: pnpm check:i18n
 */
import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = path.join(process.cwd(), 'src/messages');
const locales = readdirSync(root, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

function flatten(value: unknown, prefix = ''): Record<string, unknown> {
  if (Array.isArray(value)) {
    return value.reduce<Record<string, unknown>>((acc, item, index) => {
      Object.assign(acc, flatten(item, prefix ? `${prefix}.${index}` : String(index)));
      return acc;
    }, {});
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).reduce<Record<string, unknown>>((acc, [key, val]) => {
      Object.assign(acc, flatten(val, prefix ? `${prefix}.${key}` : key));
      return acc;
    }, {});
  }
  return { [prefix]: value };
}

/** Une los ficheros JSON de un idioma y detecta espacios de nombres duplicados entre ficheros. */
function loadLocale(locale: string) {
  const dir = path.join(root, locale);
  const merged: Record<string, unknown> = {};
  const problems: string[] = [];
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
    const json = JSON.parse(readFileSync(path.join(dir, file), 'utf8')) as Record<string, unknown>;
    for (const [namespace, content] of Object.entries(json)) {
      if (namespace in merged)
        problems.push(`[${locale}] espacio de nombres duplicado: ${namespace} (${file})`);
      merged[namespace] = content;
    }
  }
  return { flat: flatten(merged), problems };
}

const loaded = Object.fromEntries(locales.map((locale) => [locale, loadLocale(locale)]));
const all = new Set(Object.values(loaded).flatMap((entry) => Object.keys(entry.flat)));
const problems: string[] = Object.values(loaded).flatMap((entry) => entry.problems);

// Marcadores de plantilla: «[COMPLETAR: …]» en español y «[COMPLETE: …]» en inglés.
const markerFor: Record<string, RegExp> = {
  es: /\[COMPLETE:/,
  en: /\[COMPLETAR:/,
};

for (const locale of locales) {
  const messages = loaded[locale]?.flat ?? {};
  for (const key of all) {
    if (!(key in messages)) {
      problems.push(`[${locale}] falta la clave: ${key}`);
      continue;
    }
    const value = messages[key];
    if (typeof value === 'string') {
      if (value.trim() === '') problems.push(`[${locale}] cadena vacía: ${key}`);
      // Un marcador en el idioma equivocado se les escaparía a los scripts de placeholders.
      if (markerFor[locale]?.test(value))
        problems.push(`[${locale}] marcador en el idioma equivocado: ${key}`);
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
