import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Sobretítulo técnico (mono, mayúsculas) que sitúa la sección. Toma el color del `.hue-*` actual. */
export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-eyebrow text-h-fg', className)} {...props} />;
}
