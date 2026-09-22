import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Tarjeta base. Tres superficies (ver styles/materials.css):
 *   panel (por defecto)  translúcida sin blur: barata, se puede usar en cantidad.
 *   glass                vidrio con blur: solo para tarjetas destacadas (límite de blurs por pantalla).
 *   solid                opaca: lectura larga o contenido que debe destacar sobre cualquier fondo.
 * Padding interno de 20–24 px (`--pad-card`).
 */
export const cardVariants = cva('rounded-lg p-(--pad-card)', {
  variants: {
    surface: {
      panel: 'material-panel',
      glass: 'material-regular',
      solid: 'material-solid',
    },
  },
  defaultVariants: { surface: 'panel' },
});

export function Card({
  className,
  surface,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof cardVariants>) {
  return <div className={cn(cardVariants({ surface }), className)} {...props} />;
}
