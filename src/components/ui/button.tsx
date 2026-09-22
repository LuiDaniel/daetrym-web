import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * Botones de radio pequeño (Primer): 32 / 36 / 40 px de alto.
 * El feedback de press (.press) ocurre en pointer-down, no al soltar.
 * Texto oscuro sobre el verde: el blanco no alcanza AA (ver scripts/check-contrast.ts).
 */
export const buttonVariants = cva(
  'press inline-flex shrink-0 items-center justify-center gap-2 rounded-md font-medium whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-pressed',
        secondary: 'material-thin text-fg hover:bg-glass-hover',
        ghost: 'text-fg-muted hover:bg-glass-hover hover:text-fg',
      },
      size: {
        sm: 'h-8 px-3 text-small',
        md: 'h-9 px-4 text-body',
        lg: 'h-10 px-5 text-body',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Renderiza el hijo (p. ej. un <Link>) con el estilo del botón. */
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
