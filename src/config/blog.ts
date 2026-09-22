import type { LucideIcon } from 'lucide-react';
import { Braces, ShieldCheck } from 'lucide-react';
import type { BlogCategory } from '@/schemas/content';
import type { Hue } from './hues';

/** Un tono por categoría del blog (igual que el servicio homónimo para ciberseguridad). */
export const blogCategoryHues: Record<BlogCategory, Hue> = {
  cybersecurity: 'green',
  engineering: 'cyan',
};

/** Icono de línea fina para la miniatura de un post sin imagen (ver `CardThumbnail` en cards.tsx). */
export const blogCategoryIcons: Record<BlogCategory, LucideIcon> = {
  cybersecurity: ShieldCheck,
  engineering: Braces,
};
