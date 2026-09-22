import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import type { ZodType } from 'zod';
import type { Locale } from '@/i18n/routing';

export type ContentEntry<F> = { slug: string; frontmatter: F; body: string };

/**
 * Lee y valida todos los `.mdx` de `content/<area>/<locale>`. El slug es el nombre de fichero sin
 * extensión — debe coincidir con el registro de `src/config/content-slugs.ts` (lo comprueba
 * `tests/unit/content.test.ts`). Solo se usa desde Server Components / route handlers (Node, no Edge):
 * el registro de slugs, que sí necesita el proxy (Edge), vive aparte por eso mismo.
 *
 * Si el frontmatter de un fichero no valida, `schema.parse` lanza con un mensaje claro de Zod — se
 * prefiere fallar el build a publicar contenido con datos incompletos.
 */
export function readContentArea<F>(
  area: 'blog' | 'projects',
  locale: Locale,
  schema: ZodType<F>,
): ContentEntry<F>[] {
  const dir = path.join(process.cwd(), 'content', area, locale);
  const files = readdirSync(dir).filter((name) => name.endsWith('.mdx'));

  return files.map((file) => {
    const raw = readFileSync(path.join(dir, file), 'utf8');
    const { data, content } = matter(raw);
    const slug = file.replace(/\.mdx$/, '');
    let frontmatter: F;
    try {
      frontmatter = schema.parse(data);
    } catch (cause) {
      throw new Error(`Frontmatter inválido en content/${area}/${locale}/${file}`, { cause });
    }
    return { slug, frontmatter, body: content.trim() };
  });
}
