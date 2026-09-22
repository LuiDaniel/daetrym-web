import type { MetadataRoute } from 'next';
import { buildSitemapEntries } from '@/lib/seo/sitemap-entries';

/**
 * Un único sitemap para todo el sitio (todas las páginas, en los dos idiomas, con hreflang vía
 * `alternates.languages`) — Next lo sirve en /sitemap.xml. La lógica vive en
 * `lib/seo/sitemap-entries.ts` para poder probarla sin el runtime de Next.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return buildSitemapEntries();
}
