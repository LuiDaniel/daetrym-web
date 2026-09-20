import { describe, expect, it } from 'vitest';
import { processStepIds } from '@/config/process';
import { serviceSlugs } from '@/config/services';
import { featuredProjects } from '@/config/projects';
import { team } from '@/config/team';
import { routing } from '@/i18n/routing';
import { parseInline } from '@/lib/inline-markup';
import en from '@/messages/en/index';
import es from '@/messages/es/index';
import {
  faqSchema,
  legalDocumentSchema,
  processStepSchema,
  securityPolicySchema,
  serviceContentSchema,
} from '@/schemas/page-content';

const locales = { es, en } as const;
const markerLanguage = { es: 'COMPLETAR', en: 'COMPLETE' } as const;

/** Recorre cualquier estructura y devuelve todas las cadenas. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe.each(Object.entries(locales))('contenido estructurado (%s)', (locale, messages) => {
  it.each(serviceSlugs)(
    'el servicio %s cumple el esquema (problema→solución→proceso→entregables→FAQ→CTA)',
    (slug) => {
      expect(() => serviceContentSchema.parse(messages.services.items[slug])).not.toThrow();
    },
  );

  it.each(['privacy', 'terms', 'cookies'] as const)(
    'el documento legal %s cumple el esquema',
    (key) => {
      expect(() => legalDocumentSchema.parse(messages.legal[key])).not.toThrow();
    },
  );

  it('la política de divulgación cumple el esquema', () => {
    expect(() => securityPolicySchema.parse(messages.security)).not.toThrow();
  });

  it.each(processStepIds)('la etapa de proceso %s cumple el esquema', (id) => {
    expect(() => processStepSchema.parse(messages.process.steps[id])).not.toThrow();
  });

  it('la FAQ de la Home cumple el esquema', () => {
    expect(() => faqSchema.parse(messages.home.faq.items)).not.toThrow();
  });

  it('todos los servicios configurados tienen contenido (y no sobra ninguno)', () => {
    expect(Object.keys(messages.services.items).sort()).toEqual([...serviceSlugs].sort());
  });

  it('usa el marcador de dato pendiente de su idioma y ninguno del otro', () => {
    const all = strings(messages);
    const other = locale === 'es' ? markerLanguage.en : markerLanguage.es;
    expect(all.some((text) => text.includes(`[${markerLanguage[locale as 'es' | 'en']}:`))).toBe(
      true,
    );
    expect(all.filter((text) => text.includes(`[${other}:`))).toEqual([]);
  });

  it('los enlaces en línea apuntan a rutas que existen o a mailto', () => {
    const internal = new Set(Object.keys(routing.pathnames));
    for (const text of strings([messages.legal, messages.security])) {
      for (const token of parseInline(text)) {
        if (token.type !== 'link') continue;
        const ok =
          token.href.startsWith('mailto:') ||
          internal.has(token.href) ||
          token.href === '/.well-known/security.txt';
        expect(ok, `enlace roto: ${token.href}`).toBe(true);
      }
    }
  });

  it('los marcadores {clave} de los textos largos solo usan claves conocidas', () => {
    const known = new Set(['legalName', 'email', 'securityEmail']);
    for (const text of strings([messages.legal, messages.security])) {
      for (const [, key] of text.matchAll(/\{(\w+)\}/g)) {
        expect(
          known.has(key as string),
          `clave desconocida {${key}} en: ${text.slice(0, 60)}`,
        ).toBe(true);
      }
    }
  });

  it('los ids de sección son únicos y usables como ancla', () => {
    for (const doc of [
      messages.legal.privacy,
      messages.legal.terms,
      messages.legal.cookies,
      messages.security,
    ]) {
      const ids = doc.sections.map((section) => section.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
    }
  });
});

describe('paridad ES/EN del contenido estructurado', () => {
  it('cada servicio tiene el mismo número de puntos, pasos, entregables y preguntas', () => {
    for (const slug of serviceSlugs) {
      const a = es.services.items[slug];
      const b = en.services.items[slug];
      expect(b.problem.points.length).toBe(a.problem.points.length);
      expect(b.solution.points.length).toBe(a.solution.points.length);
      expect(b.process.length).toBe(a.process.length);
      expect(b.deliverables.length).toBe(a.deliverables.length);
      expect(b.faq.length).toBe(a.faq.length);
    }
  });

  it('los documentos legales tienen las mismas secciones y bloques en el mismo orden', () => {
    for (const key of ['privacy', 'terms', 'cookies'] as const) {
      const shape = (doc: typeof es.legal.privacy) =>
        doc.sections.map((section) => section.blocks.map((block) => block.type).join(','));
      expect(shape(en.legal[key])).toEqual(shape(es.legal[key]));
    }
  });
});

describe('datos de ejemplo (placeholders)', () => {
  it('cada perfil y proyecto de ejemplo está marcado y tiene textos en todos los idiomas', () => {
    for (const member of team) {
      for (const locale of routing.locales) {
        expect(member.role[locale].length).toBeGreaterThan(0);
        expect(member.bio[locale].length).toBeGreaterThan(0);
      }
    }
    for (const project of featuredProjects) {
      for (const locale of routing.locales) {
        expect(project.title[locale].length).toBeGreaterThan(0);
        expect(project.summary[locale].length).toBeGreaterThan(0);
      }
    }
  });

  it('los datos de ejemplo no incluyen cifras inventadas (porcentajes, importes ni recuentos de clientes)', () => {
    const text = strings([team, featuredProjects]).join(' ');
    expect(text).not.toMatch(/\d+\s?%|\$\s?\d|€\s?\d|\d+\+?\s+(clientes|clients)/i);
  });
});
