import { describe, expect, it } from 'vitest';
import { blogSlugs, projectSlugs } from '@/config/content-slugs';
import { processStepIds } from '@/config/process';
import { serviceSlugs } from '@/config/services';
import { team } from '@/config/team';
import { routing } from '@/i18n/routing';
import { getAllPosts, getPost, getRelatedPosts } from '@/lib/content/blog';
import { extractHeadings } from '@/lib/content/headings';
import { getAllProjects } from '@/lib/content/projects';
import { estimateReadingMinutes } from '@/lib/content/reading-time';
import { buildBlogRss } from '@/lib/content/rss';
import { parseInline } from '@/lib/inline-markup';
import { isKnownPath } from '@/lib/routes';
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
  it('cada perfil de ejemplo tiene textos en todos los idiomas', () => {
    for (const member of team) {
      for (const locale of routing.locales) {
        expect(member.role[locale].length).toBeGreaterThan(0);
        expect(member.bio[locale].length).toBeGreaterThan(0);
      }
    }
  });

  it('los datos de ejemplo de src/config no incluyen cifras inventadas (porcentajes, importes ni recuentos de clientes)', () => {
    const text = strings([team]).join(' ');
    expect(text).not.toMatch(/\d+\s?%|\$\s?\d|€\s?\d|\d+\+?\s+(clientes|clients)/i);
  });
});

/** Extrae `/rutas` de enlaces Markdown `[texto](/ruta#ancla)`, sin la almohadilla. */
function internalLinks(body: string): string[] {
  return [...body.matchAll(/\]\((\/[^)\s#]+)/g)].map((match) => match[1]!);
}

describe('capa de contenido /content (Fase 3)', () => {
  describe.each(routing.locales)('blog (%s)', (locale) => {
    const posts = getAllPosts(locale);

    it('un fichero .mdx por slug registrado, ni de más ni de menos', () => {
      expect(posts.map((post) => post.slug).sort()).toEqual([...blogSlugs].sort());
    });

    it('todo el contenido de ejemplo lleva placeholder: true', () => {
      for (const post of posts) expect(post.frontmatter.placeholder).toBe(true);
    });

    it('no incluye resultados de negocio inventados (importes, clientes o mejoras en %)', () => {
      // Un blog técnico sí puede decir «100% estable»: no es una cifra de negocio. Lo que no
      // debe aparecer es una mejora/ahorro en % ni importes ni recuentos de clientes.
      const text = posts.map((post) => post.body).join(' ');
      expect(text).not.toMatch(
        /\d+%\s*(faster|reduction|improvement|increase|growth|más rápido|reducción|mejora)|\$\s?\d|€\s?\d|\d+\+?\s+(clientes|clients)/i,
      );
    });

    it('extrae los h2/h3 en orden, con id único por post', () => {
      for (const post of posts) {
        expect(post.headings.length).toBeGreaterThan(0);
        expect(post.headings.every((h) => h.level === 2 || h.level === 3)).toBe(true);
        const ids = post.headings.map((h) => h.id);
        expect(new Set(ids).size).toBe(ids.length);
      }
    });

    it('el tiempo de lectura es un entero positivo', () => {
      for (const post of posts) {
        expect(Number.isInteger(post.readingMinutes)).toBe(true);
        expect(post.readingMinutes).toBeGreaterThan(0);
      }
    });

    it('cada post tiene al menos un relacionado (comparten categoría o etiqueta)', () => {
      for (const post of posts) {
        expect(getRelatedPosts(locale, post).length).toBeGreaterThan(0);
      }
    });

    it('un post nunca aparece como su propio relacionado', () => {
      for (const post of posts) {
        expect(getRelatedPosts(locale, post).some((r) => r.slug === post.slug)).toBe(false);
      }
    });
  });

  describe.each(routing.locales)('proyectos (%s)', (locale) => {
    const projects = getAllProjects(locale);

    it('un fichero .mdx por slug registrado, ni de más ni de menos', () => {
      expect(projects.map((project) => project.slug).sort()).toEqual([...projectSlugs].sort());
    });

    it('todos llevan placeholder: true y al menos uno lleva featured: true', () => {
      for (const project of projects) expect(project.frontmatter.placeholder).toBe(true);
      expect(projects.some((project) => project.frontmatter.featured)).toBe(true);
    });

    it('no incluye cifras inventadas', () => {
      const text = projects.map((project) => project.body).join(' ');
      expect(text).not.toMatch(/\d+\s?%|\$\s?\d|€\s?\d|\d+\+?\s+(clientes|clients)/i);
    });
  });

  it('paridad ES/EN: los mismos slugs, categoría y placeholder en los dos idiomas', () => {
    for (const slug of blogSlugs) {
      const esPost = getPost('es', slug)!;
      const enPost = getPost('en', slug)!;
      expect(enPost.frontmatter.category).toBe(esPost.frontmatter.category);
      expect(enPost.frontmatter.placeholder).toBe(esPost.frontmatter.placeholder);
    }
  });

  it('los enlaces internos de cada post/caso resuelven en SU idioma (nunca el segmento del otro)', () => {
    // El bug real que motivó este test: un post en español enlazaba a /cybersecurity (el segmento
    // en inglés) en vez de /ciberseguridad. isKnownPath ya distingue los segmentos por idioma.
    const broken: string[] = [];
    for (const locale of routing.locales) {
      const entries = [...getAllPosts(locale), ...getAllProjects(locale)];
      for (const entry of entries) {
        for (const link of internalLinks(entry.body)) {
          if (!isKnownPath(`/${locale}${link}`)) broken.push(`${locale}/${entry.slug} → ${link}`);
        }
      }
    }
    expect(broken).toEqual([]);
  });

  it('extractHeadings ignora las líneas que empiezan por # dentro de un bloque de código', () => {
    const markdown = [
      '## Título real',
      '',
      '```bash',
      '# esto es un comentario, no un título',
      '```',
      '',
      '### Otro título',
    ].join('\n');
    const headings = extractHeadings(markdown);
    expect(headings.map((h) => h.text)).toEqual(['Título real', 'Otro título']);
  });

  it('extractHeadings numera los títulos repetidos igual que rehype-slug (github-slugger)', () => {
    const markdown = ['## Resumen', '', 'texto', '', '## Resumen'].join('\n');
    const headings = extractHeadings(markdown);
    expect(headings.map((h) => h.id)).toEqual(['resumen', 'resumen-1']);
  });

  it('estimateReadingMinutes redondea hacia arriba y nunca da 0', () => {
    expect(estimateReadingMinutes('una palabra')).toBeGreaterThanOrEqual(1);
    expect(estimateReadingMinutes(Array(400).fill('palabra').join(' '))).toBeGreaterThan(1);
  });

  it('buildBlogRss escapa entidades XML y no rompe con comillas o &', () => {
    const posts = getAllPosts('es');
    const xml = buildBlogRss({
      locale: 'es',
      posts,
      title: 'Título con & "comillas"',
      description: 'Descripción',
    });
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('&amp;');
    expect(xml).not.toMatch(/<title>[^<]*&(?!amp;|lt;|gt;|quot;|apos;)/);
    for (const post of posts) expect(xml).toContain(post.frontmatter.title);
  });
});
