import type { LucideIcon } from 'lucide-react';
import { AppWindow, Boxes, Compass, ShieldCheck } from 'lucide-react';

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

export function isServiceSlug(value: string): value is ServiceSlug {
  return (serviceSlugs as readonly string[]).includes(value);
}
