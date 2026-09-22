import { describe, expect, it } from 'vitest';
import { blogSlugs, projectSlugs } from '@/config/content-slugs';
import { serviceSlugs } from '@/config/services';
import { routing } from '@/i18n/routing';
import { isKnownPath } from '@/lib/routes';

describe('isKnownPath', () => {
  it('reconoce las rutas localizadas de cada idioma', () => {
    expect(isKnownPath('/es')).toBe(true);
    expect(isKnownPath('/en')).toBe(true);
    expect(isKnownPath('/es/servicios')).toBe(true);
    expect(isKnownPath('/en/services')).toBe(true);
    expect(isKnownPath('/es/nosotros')).toBe(true);
    expect(isKnownPath('/en/about')).toBe(true);
    expect(isKnownPath('/es/legal/privacidad')).toBe(true);
    expect(isKnownPath('/en/legal/privacy')).toBe(true);
    expect(isKnownPath('/es/seguridad')).toBe(true);
  });

  it('acepta barra final', () => {
    expect(isKnownPath('/es/servicios/')).toBe(true);
    expect(isKnownPath('/en/')).toBe(true);
  });

  it('rechaza rutas que no existen', () => {
    expect(isKnownPath('/es/no-existe')).toBe(false);
    expect(isKnownPath('/en/no/existe/nunca')).toBe(false);
    expect(isKnownPath('/es/404')).toBe(false);
  });

  it('rechaza la ruta de otro idioma (cada idioma tiene su propia URL)', () => {
    expect(isKnownPath('/en/servicios')).toBe(false);
    expect(isKnownPath('/es/services')).toBe(false);
  });

  it('valida el slug de servicio', () => {
    for (const slug of serviceSlugs) {
      expect(isKnownPath(`/es/servicios/${slug}`)).toBe(true);
      expect(isKnownPath(`/en/services/${slug}`)).toBe(true);
    }
    expect(isKnownPath('/es/servicios/inexistente')).toBe(false);
    expect(isKnownPath('/en/services/web-apps/extra')).toBe(false);
  });

  it('valida el slug del blog y de los proyectos (Fase 3)', () => {
    for (const slug of blogSlugs) expect(isKnownPath(`/en/blog/${slug}`)).toBe(true);
    for (const slug of projectSlugs) {
      expect(isKnownPath(`/es/proyectos/${slug}`)).toBe(true);
      expect(isKnownPath(`/en/projects/${slug}`)).toBe(true);
    }
  });

  it('un slug que no existe falla cerrado (sigue devolviendo la 404 de marca)', () => {
    expect(isKnownPath('/es/proyectos/algo')).toBe(false);
    expect(isKnownPath('/en/blog/un-post')).toBe(false);
    expect(isKnownPath('/en/projects/algo')).toBe(false);
  });

  it('deja pasar la imagen OG que Next genera junto a cada página (un segmento más, con sufijo hash)', () => {
    const slug = blogSlugs[0]!;
    expect(isKnownPath(`/en/blog/${slug}/opengraph-image-1ybbry`)).toBe(true);
    expect(isKnownPath(`/en/blog/opengraph-image-v2by4x`)).toBe(true);
    expect(isKnownPath(`/es/proyectos/${projectSlugs[0]}/opengraph-image-abc123`)).toBe(true);
    // Pero no cualquier segmento de más: solo los nombres de convención de Next.
    expect(isKnownPath(`/en/blog/${slug}/algo-mas`)).toBe(false);
  });

  it('deja pasar las rutas sin prefijo de idioma (las redirige next-intl)', () => {
    expect(isKnownPath('/')).toBe(true);
    expect(isKnownPath('/servicios')).toBe(true);
  });

  it('todas las rutas estáticas definidas en routing existen en cada idioma', () => {
    for (const locale of routing.locales) {
      for (const config of Object.values(routing.pathnames)) {
        const template = typeof config === 'string' ? config : config[locale];
        if (template.includes('[')) continue;
        expect(isKnownPath(`/${locale}${template === '/' ? '' : template}`)).toBe(true);
      }
    }
  });
});
