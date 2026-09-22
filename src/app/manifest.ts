import type { MetadataRoute } from 'next';
import { siteConfig } from '@/config/site';

/**
 * Manifest de la app web (/manifest.webmanifest). Un solo manifest para todo el sitio (no depende del
 * idioma: es metadata de la app instalada, no contenido) — los iconos ya existían desde la Fase 1
 * (`scripts/generate-brand.ts`) pero nunca se habían enlazado a un manifest real.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.legalName}`,
    short_name: siteConfig.name,
    description:
      'Ciberseguridad y desarrollo de software: aplicaciones web, software a medida y pruebas de seguridad.',
    start_url: '/',
    display: 'standalone',
    background_color: siteConfig.themeColor,
    theme_color: siteConfig.themeColor,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
