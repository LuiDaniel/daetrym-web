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
