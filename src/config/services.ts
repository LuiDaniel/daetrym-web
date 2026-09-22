import type { LucideIcon } from 'lucide-react';
import { AppWindow, Boxes, Compass, ShieldCheck } from 'lucide-react';
import type { Hue } from './hues';

/**
 * Servicios del sitio. Los slugs son iguales en todos los idiomas (así el selector de idioma conserva
 * la ruta) y sus textos viven en src/messages/<locale>/services.json → `services.items.<slug>`.
 * Para añadir un servicio: añadir el slug aquí y su contenido en ambos idiomas (`pnpm check:i18n`).
 */
export const serviceSlugs = ['web-apps', 'custom-software', 'cybersecurity', 'consulting'] as const;

export type ServiceSlug = (typeof serviceSlugs)[number];

export const serviceIcons: Record<ServiceSlug, LucideIcon> = {
  'web-apps': AppWindow,
  'custom-software': Boxes,
  cybersecurity: ShieldCheck,
  consulting: Compass,
};

/** Un color por servicio (identidad, no decoración): cian, violeta, verde de marca y ámbar. */
export const serviceHues: Record<ServiceSlug, Hue> = {
  'web-apps': 'cyan',
  'custom-software': 'violet',
  cybersecurity: 'green',
  consulting: 'amber',
};

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
