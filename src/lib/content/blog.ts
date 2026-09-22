import { cache } from 'react';
import type { Locale } from '@/i18n/routing';
import { blogFrontmatterSchema, type BlogFrontmatter } from '@/schemas/content';
import { extractHeadings, type Heading } from './headings';
import { estimateReadingMinutes } from './reading-time';
import { readContentArea } from './shared';

export type BlogPost = {
  slug: string;
  frontmatter: BlogFrontmatter;
  body: string;
  headings: Heading[];
  readingMinutes: number;
};

/** `cache()`: los Server Components de una misma petición que pidan el mismo idioma comparten la lectura. */
const loadAll = cache((locale: Locale): BlogPost[] =>
  readContentArea('blog', locale, blogFrontmatterSchema)
    .map((entry) => ({
      ...entry,
      headings: extractHeadings(entry.body),
      readingMinutes: estimateReadingMinutes(entry.body),
    }))
    // Más reciente primero.
    .sort((a, b) => (a.frontmatter.date < b.frontmatter.date ? 1 : -1)),
);

export function getAllPosts(locale: Locale): BlogPost[] {
  return loadAll(locale);
}

export function getPost(locale: Locale, slug: string): BlogPost | undefined {
  return loadAll(locale).find((post) => post.slug === slug);
}

/**
 * Relacionados: +2 por compartir categoría, +1 por cada etiqueta en común; se excluye el propio post y
 * los que no comparten nada (score 0). Empate por fecha más reciente.
 */
export function getRelatedPosts(locale: Locale, current: BlogPost, limit = 3): BlogPost[] {
  return loadAll(locale)
    .filter((post) => post.slug !== current.slug)
    .map((post) => {
      const sharedTags = post.frontmatter.tags.filter((tag) =>
        current.frontmatter.tags.includes(tag),
      ).length;
      const score =
        (post.frontmatter.category === current.frontmatter.category ? 2 : 0) + sharedTags;
      return { post, score };
    })
    .filter((entry) => entry.score > 0)
    .sort(
      (a, b) => b.score - a.score || (a.post.frontmatter.date < b.post.frontmatter.date ? 1 : -1),
    )
    .slice(0, limit)
    .map((entry) => entry.post);
}
