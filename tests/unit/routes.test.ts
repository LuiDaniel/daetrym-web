import { describe, expect, it } from 'vitest';
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

  it('las rutas dinámicas sin validador cuentan como inexistentes (fallan cerrado hasta la Fase 3)', () => {
    expect(isKnownPath('/es/proyectos/algo')).toBe(false);
    expect(isKnownPath('/en/blog/un-post')).toBe(false);
    expect(isKnownPath('/en/projects/algo')).toBe(false);
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
