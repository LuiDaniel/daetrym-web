import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Etiqueta (Primer «Label»): pastilla de 12 px con borde de 1px.
 *
 * - `placeholder` = contenido de ejemplo (ámbar). Cualquier dato inventado que se muestre en pantalla
 *   debe llevar este distintivo hasta que se sustituya por uno real.
 * - `hue` toma el color del `.hue-*` más cercano (p. ej. la categoría de un proyecto).
 * - Estados semánticos: success, info, low, medium, critical (severidad de hallazgos, estados).
 *   El color nunca es el único portador de significado: el texto de la etiqueta lo dice también.
 */
export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-label whitespace-nowrap',
  {
    variants: {
      variant: {
        neutral: 'border-hairline bg-glass text-fg-muted',
        accent: 'hue-green border-h-line bg-h-tint text-h-fg',
        hue: 'border-h-line bg-h-tint text-h-fg',
        placeholder: 'hue-amber border-h-line bg-h-tint text-h-fg',
        success: 'hue-green border-h-line bg-h-tint text-h-fg',
        info: 'hue-cyan border-h-line bg-h-tint text-h-fg',
        low: 'hue-blue border-h-line bg-h-tint text-h-fg',
        medium: 'hue-amber border-h-line bg-h-tint text-h-fg',
        critical: 'hue-red border-h-line bg-h-tint text-h-fg',
      },
    },
    defaultVariants: { variant: 'neutral' },
  },
);

export function Badge({
  className,
  variant,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

/**
 * Etiqueta superpuesta en una miniatura (proyecto/post): `bg-h-tint` no se lee de forma fiable sobre
 * una foto o un degradado, así que en vez de eso usa `material-thumb-badge` (píldora oscura con blur,
 * siempre oscura sea cual sea el tema — ver materials.css) y `text-thumb-fg` (la variante clara de cada
 * tono, verificada en `pnpm check:contrast` contra el peor caso: una miniatura casi blanca). El color
 * de cada variante es el mismo que en `Badge`, solo cambia la superficie sobre la que se lee.
 */
export const thumbBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border material-thumb-badge px-2 py-0.5 text-label whitespace-nowrap text-thumb-fg',
  {
    variants: {
      variant: {
        hue: '',
        placeholder: 'hue-amber',
      },
    },
    defaultVariants: { variant: 'hue' },
  },
);

export function ThumbBadge({
  className,
  variant,
  ...props
}: ComponentProps<'span'> & VariantProps<typeof thumbBadgeVariants>) {
  return <span className={cn(thumbBadgeVariants({ variant }), className)} {...props} />;
}
