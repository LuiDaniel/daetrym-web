import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Superficie sólida (no translúcida): las tarjetas de contenido priorizan la legibilidad. Los
 * materiales translúcidos se reservan para el chrome flotante (header, sheets, controles).
 * Dentro de una sección `tone="raised"` (fondo surface-1), pasar `className="bg-surface-2"`.
 */
export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn('rounded-lg border border-hairline bg-surface-1 p-6 sm:p-7', className)}
      {...props}
    />
  );
}
