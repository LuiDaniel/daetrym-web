import { cva, type VariantProps } from 'class-variance-authority';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * `placeholder` = contenido de ejemplo (ámbar, distinto del verde de marca). Cualquier dato inventado
 * que se muestre en pantalla debe llevar este distintivo hasta que se sustituya por uno real.
 */
export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label whitespace-nowrap',
  {
    variants: {
      variant: {
        placeholder: 'border border-warning-border bg-warning-bg text-warning',
        neutral: 'border border-hairline bg-surface-2 text-fg-muted',
        accent: 'bg-accent-tint text-accent-text',
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
