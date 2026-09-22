import { describe, expect, it } from 'vitest';
import {
  blogPostingJsonLd,
  breadcrumbListJsonLd,
  faqPageJsonLd,
  organizationJsonLd,
  serviceJsonLd,
  websiteJsonLd,
} from '@/lib/seo/json-ld';

describe('organizationJsonLd', () => {
  it('nunca declara sameAs de las redes marcadas PLACEHOLDER (solo la raíz del dominio)', () => {
    const data = organizationJsonLd();
    expect(data['@type']).toBe('Organization');
    // src/config/social.ts hoy solo tiene github.com/ y linkedin.com/ (sin perfil real todavía).
    expect(data).not.toHaveProperty('sameAs');
  });

  it('trae nombre legal y logo absoluto', () => {
    const data = organizationJsonLd();
    expect(data.name).toBeTruthy();
    expect(data.logo).toMatch(/^https?:\/\//);
  });
});

describe('websiteJsonLd', () => {
  it('declara el idioma pedido', () => {
    expect(websiteJsonLd('es').inLanguage).toBe('es');
    expect(websiteJsonLd('en').inLanguage).toBe('en');
  });
});

describe('serviceJsonLd', () => {
  it('incluye el proveedor (Organization) y los campos pedidos', () => {
    const data = serviceJsonLd({
      name: 'Aplicaciones web',
      description: 'Desarrollo de aplicaciones web a medida.',
      url: 'https://example.com/es/servicios/web-apps',
    });
    expect(data['@type']).toBe('Service');
    expect(data.provider['@type']).toBe('Organization');
    expect(data.url).toBe('https://example.com/es/servicios/web-apps');
  });
});

describe('blogPostingJsonLd', () => {
  it('trae autor, publisher y la fecha tal cual (ISO)', () => {
    const data = blogPostingJsonLd({
      title: 'Título del post',
      description: 'Descripción',
      url: 'https://example.com/es/blog/post',
      datePublished: '2026-01-15',
    });
    expect(data['@type']).toBe('BlogPosting');
    expect(data.datePublished).toBe('2026-01-15');
    expect(data.author['@type']).toBe('Organization');
    expect(data.publisher.logo.url).toMatch(/^https?:\/\//);
  });

  it('omite la imagen si no se pasa (no inventa una URL)', () => {
    const data = blogPostingJsonLd({
      title: 't',
      description: 'd',
      url: 'https://example.com/x',
      datePublished: '2026-01-01',
    });
    expect(data).not.toHaveProperty('image');
  });
});

describe('breadcrumbListJsonLd', () => {
  it('numera las posiciones desde 1, en el orden dado', () => {
    const data = breadcrumbListJsonLd([
      { name: 'Blog', url: 'https://example.com/es/blog' },
      { name: 'Post', url: 'https://example.com/es/blog/post' },
    ]);
    expect(data.itemListElement).toEqual([
      { '@type': 'ListItem', position: 1, name: 'Blog', item: 'https://example.com/es/blog' },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Post',
        item: 'https://example.com/es/blog/post',
      },
    ]);
  });
});

describe('faqPageJsonLd', () => {
  it('convierte cada {q,a} en Question/Answer', () => {
    const data = faqPageJsonLd([{ q: '¿Pregunta?', a: 'Respuesta.' }]);
    expect(data.mainEntity[0]).toEqual({
      '@type': 'Question',
      name: '¿Pregunta?',
      acceptedAnswer: { '@type': 'Answer', text: 'Respuesta.' },
    });
  });
});
