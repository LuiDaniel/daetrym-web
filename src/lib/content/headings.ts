import GithubSlugger from 'github-slugger';

export type Heading = { id: string; text: string; level: 2 | 3 };

/**
 * Extrae los h2/h3 del markdown en bruto para la tabla de contenidos, sin entrar en los bloques de
 * código (una línea que empiece por `#` dentro de un fence no es un título).
 *
 * Usa la MISMA librería que `rehype-slug` (`github-slugger`), con una instancia nueva por documento y
 * llamando a `.slug()` para cada título en el orden en que aparece — igual que hace `rehype-slug` — así
 * que el id que calculamos aquí coincide con el id real del `<h2>`/`<h3>` renderizado, incluso cuando
 * hay títulos repetidos (el segundo "Resumen" pasa a `resumen-1`, en los dos sitios por igual).
 *
 * Limitación asumida: si un título llevara `**negrita**`/`` `código` `` /enlaces, el id no coincidiría
 * exactamente con el de rehype-slug (que extrae solo el texto). Los títulos de /content son siempre
 * texto plano por eso mismo.
 */
export function extractHeadings(markdown: string): Heading[] {
  const slugger = new GithubSlugger();
  const headings: Heading[] = [];
  let inFence = false;

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      continue;
    }
    if (inFence) continue;

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!match?.[1] || match[2] === undefined) continue;
    const level = match[1].length;
    const text = match[2].trim();
    const id = slugger.slug(text);
    if (level === 2 || level === 3) headings.push({ id, text, level });
  }

  return headings;
}
