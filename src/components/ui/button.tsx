import { cva, type VariantProps } from 'class-variance-authority';
import { Slot } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/cn';

/**
 * El feedback de press (.press) ocurre en pointer-down, no al soltar (apple-design §1).
 * Texto oscuro sobre el verde: el blanco no alcanza AA (ver scripts/check-contrast.ts).
 */
export const buttonVariants = cva(
  'press inline-flex shrink-0 items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap select-none disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-on-accent hover:bg-accent-hover active:bg-accent-pressed',
        secondary: 'text-fg material-thin hover:bg-surface-3',
        ghost: 'text-fg-muted hover:bg-surface-3 hover:text-fg',
      },
      size: {
        sm: 'h-9 px-4 text-small',
        md: 'h-11 px-5 text-body',
        lg: 'h-13 px-7 text-lead',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

type ButtonProps = ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Renderiza el hijo (p. ej. un <Link>) con el estilo del botón. */
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot.Root : 'button';
  return <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
