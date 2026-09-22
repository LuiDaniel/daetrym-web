import { cache } from 'react';
import { projectSlugs } from '@/config/content-slugs';
import type { Locale } from '@/i18n/routing';
import { projectFrontmatterSchema, type ProjectFrontmatter } from '@/schemas/content';
import { readContentArea } from './shared';

export type ProjectContent = { slug: string; frontmatter: ProjectFrontmatter; body: string };

/** Orden fijo (el de `content-slugs.ts`), no alfabético: lo decide quien mantiene el registro. */
const order = new Map<string, number>(projectSlugs.map((slug, index) => [slug, index]));

const loadAll = cache((locale: Locale): ProjectContent[] =>
  readContentArea('projects', locale, projectFrontmatterSchema).sort(
    (a, b) => (order.get(a.slug) ?? 0) - (order.get(b.slug) ?? 0),
  ),
);

export function getAllProjects(locale: Locale): ProjectContent[] {
  return loadAll(locale);
}

export function getProject(locale: Locale, slug: string): ProjectContent | undefined {
  return loadAll(locale).find((project) => project.slug === slug);
}

/** Para la Home: los marcados `featured: true` en el frontmatter, en el mismo orden del registro. */
export function getFeaturedProjects(locale: Locale, limit = 3): ProjectContent[] {
  return loadAll(locale)
    .filter((project) => project.frontmatter.featured)
    .slice(0, limit);
}
