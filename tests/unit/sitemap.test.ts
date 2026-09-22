import { describe, expect, it } from 'vitest';
import { buildSitemapEntries } from '@/lib/seo/sitemap-entries';

describe('buildSitemapEntries', () => {
  const entries = buildSitemapEntries();

  it('incluye la home de los dos idiomas, sin barra final (igual que el canonical real)', () => {
    expect(entries.some((e) => e.url.endsWith('/es'))).toBe(true);
    expect(entries.some((e) => e.url.endsWith('/en'))).toBe(true);
    expect(entries.some((e) => e.url.endsWith('/es/') || e.url.endsWith('/en/'))).toBe(false);
  });

  it('cada entrada trae alternates con los dos idiomas y x-default', () => {
    for (const entry of entries) {
      expect(entry.alternates?.languages.es).toBeTruthy();
      expect(entry.alternates?.languages.en).toBeTruthy();
      expect(entry.alternates?.languages['x-default']).toBeTruthy();
    }
  });

  it('no incluye páginas transaccionales (mantenimiento, newsletter, 404)', () => {
    const urls = entries.map((e) => e.url);
    expect(urls.some((u) => u.includes('mantenimiento') || u.includes('maintenance'))).toBe(false);
    expect(urls.some((u) => u.includes('newsletter'))).toBe(false);
    expect(urls.some((u) => u.includes('404'))).toBe(false);
  });

  it('incluye los cuatro servicios en los dos idiomas', () => {
    const serviceUrls = entries.filter(
      (e) => e.url.includes('/servicios/') || e.url.includes('/services/'),
    );
    expect(serviceUrls.length).toBe(8);
  });

  it('incluye los posts del blog y los casos de proyectos, con fecha en los posts', () => {
    const blogEntries = entries.filter((e) => e.url.includes('/blog/'));
    expect(blogEntries.length).toBeGreaterThan(0);
    expect(blogEntries.every((e) => e.lastModified instanceof Date)).toBe(true);

    const projectEntries = entries.filter(
      (e) => e.url.includes('/proyectos/') || e.url.includes('/projects/'),
    );
    expect(projectEntries.length).toBeGreaterThan(0);
  });

  it('no tiene URLs duplicadas', () => {
    const urls = entries.map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
