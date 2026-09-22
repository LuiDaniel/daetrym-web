import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Sirve /robots.txt. Las páginas transaccionales (mantenimiento, 404, newsletter/confirm y
 * /unsubscribe) ya llevan `noindex` en su metadata — eso basta para que no aparezcan en resultados de
 * búsqueda; aquí solo se excluyen las rutas puramente técnicas (`/api`) que no tiene sentido rastrear.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = siteConfig.url.replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/api/' },
    sitemap: `${origin}/sitemap.xml`,
  };
}
