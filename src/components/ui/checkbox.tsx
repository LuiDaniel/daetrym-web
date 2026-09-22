'use client';

import { Check } from 'lucide-react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Casilla (Radix: teclado y ARIA resueltos). Marcada = verde de marca (control de sistema, como el
 * anillo de foco — no el tono ambiente de una `.hue-*`, que es para categorizar contenido, no estado
 * de formulario).
 */
export function Checkbox({ className, ...props }: ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      className={cn(
        'press grid size-4.5 shrink-0 place-items-center rounded-sm border border-input bg-glass data-[state=checked]:border-accent data-[state=checked]:bg-accent',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check className="size-3.5 text-on-accent" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

/** Casilla + etiqueta, ambas clicables (el `id` las asocia). */
export function CheckboxField({
  id,
  label,
  className,
  ...props
}: ComponentProps<typeof CheckboxPrimitive.Root> & { id: string; label: ReactNode }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <Checkbox id={id} {...props} />
      <label htmlFor={id} className="text-small text-fg-muted select-none">
        {label}
      </label>
    </div>
  );
}
