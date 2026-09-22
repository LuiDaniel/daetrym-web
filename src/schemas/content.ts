import { z } from 'zod';

/**
 * Frontmatter de /content (Fase 3). Se valida al leer cada fichero (falla claro en build/desarrollo
 * si falta un campo) — ver src/lib/content/. `placeholder: true` es obligatorio: todo el contenido de
 * /content de esta fase es de ejemplo (nunca cifras, clientes o resultados inventados como reales).
 */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha ISO (AAAA-MM-DD)');

export const blogCategories = ['cybersecurity', 'engineering'] as const;
export type BlogCategory = (typeof blogCategories)[number];

export const blogFrontmatterSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
  date: isoDate,
  category: z.enum(blogCategories),
  tags: z.array(z.string().trim().min(1)).min(1),
  placeholder: z.literal(true),
});
export type BlogFrontmatter = z.infer<typeof blogFrontmatterSchema>;

/** Mismas categorías que src/config/projects.ts (`ProjectCategory`): un caso por servicio. */
export const projectCategories = ['web', 'software', 'security'] as const;
export type ProjectContentCategory = (typeof projectCategories)[number];

export const projectFrontmatterSchema = z.object({
  title: z.string().trim().min(1),
  summary: z.string().trim().min(1),
  category: z.enum(projectCategories),
  tags: z.array(z.string().trim().min(1)).min(1),
  /** Si aparece en la Home (`getFeaturedProjects`); como mucho unos pocos deberían llevarlo. */
  featured: z.boolean().default(false),
  placeholder: z.literal(true),
});
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
