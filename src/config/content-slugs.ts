/**
 * Registro de slugs de /content (Fase 3), en el mismo idioma en ambos locales (como los servicios:
 * `/blog/<slug>`, `/proyectos/<slug>` ↔ `/projects/<slug>`).
 *
 * Es una lista aparte, no derivada de leer el filesystem, porque `src/lib/routes.ts` la usa en
 * `src/proxy.ts`, que corre en el runtime Edge (sin `fs`). Al añadir un post o un caso, añadir su slug
 * aquí también — `tests/unit/content.test.ts` falla si un slug de aquí no tiene MDX en los dos idiomas,
 * o si sobra un MDX sin registrar, así que no se pueden desincronizar en silencio.
 */
export const blogSlugs = ['pentest-authorization-basics', 'nextjs-strict-csp-nonces'] as const;
export type BlogSlug = (typeof blogSlugs)[number];
export function isBlogSlug(value: string): value is BlogSlug {
  return (blogSlugs as readonly string[]).includes(value);
}

export const projectSlugs = ['booking-platform', 'api-audit', 'inventory-system'] as const;
export type ProjectSlug = (typeof projectSlugs)[number];
export function isProjectSlug(value: string): value is ProjectSlug {
  return (projectSlugs as readonly string[]).includes(value);
}
