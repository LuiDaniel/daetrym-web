import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Composición de dos columnas: encabezado fijo a la izquierda (en escritorio) y contenido a la derecha.
 * En móvil y tablet se apilan. Mantiene el título a la vista mientras se recorre una lista larga.
 */
export function SplitLayout({
  aside,
  children,
  className,
}: {
  aside: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20',
        className,
      )}
    >
      <div className="lg:sticky lg:top-28 lg:self-start">{aside}</div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
