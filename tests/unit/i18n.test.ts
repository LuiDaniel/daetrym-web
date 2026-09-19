import { describe, expect, it } from 'vitest';
import en from '@/messages/en.json';
import es from '@/messages/es.json';
import { footerNav, mainNav } from '@/config/navigation';
import { routing } from '@/i18n/routing';

function keys(value: unknown, prefix = ''): string[] {
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe('mensajes ES/EN', () => {
  it('tienen exactamente las mismas claves', () => {
    expect(keys(en).sort()).toEqual(keys(es).sort());
  });

  it('no hay cadenas vacías', () => {
    const empty = (m: unknown) =>
      keys(m).filter((k) => {
        const value = k.split('.').reduce<unknown>((acc, part) => (acc as never)?.[part], m);
        return typeof value === 'string' && value.trim() === '';
      });
    expect(empty(es)).toEqual([]);
    expect(empty(en)).toEqual([]);
  });
});

describe('routing y navegación', () => {
  it('cada enlace de navegación existe en las rutas definidas', () => {
    const all = [...mainNav, ...footerNav.flatMap((group) => group.items)];
    for (const item of all) {
      expect(Object.keys(routing.pathnames)).toContain(item.href);
    }
  });

  it('cada clave de navegación tiene traducción en todos los idiomas', () => {
    const all = [...mainNav, ...footerNav.flatMap((group) => group.items)];
    for (const item of all) {
      expect(es.nav).toHaveProperty(item.key);
      expect(en.nav).toHaveProperty(item.key);
    }
  });

  it('los idiomas configurados coinciden con los archivos de mensajes', () => {
    expect([...routing.locales].sort()).toEqual(['en', 'es']);
    expect(routing.defaultLocale).toBe('es');
  });
});
