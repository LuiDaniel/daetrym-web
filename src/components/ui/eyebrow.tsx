import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/** Sobretítulo técnico (mono, mayúsculas) que sitúa la sección. El verde se usa solo aquí y en CTAs. */
export function Eyebrow({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('text-eyebrow text-accent-text', className)} {...props} />;
}
