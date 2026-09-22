'use client';

import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const RadioGroup = RadioGroupPrimitive.Root;

function RadioDot({ className, ...props }: ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      className={cn(
        'press grid size-4.5 shrink-0 place-items-center rounded-full border border-input bg-glass data-[state=checked]:border-accent',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="size-2 rounded-full bg-accent" />
    </RadioGroupPrimitive.Item>
  );
}

/** Radio + etiqueta clicable. Para una lista simple (presupuesto, plazo…). */
export function RadioField({
  id,
  label,
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item> & { id: string; label: ReactNode }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <RadioDot id={id} {...props} />
      <label htmlFor={id} className="text-small text-fg-muted select-none">
        {label}
      </label>
    </div>
  );
}

/**
 * Tarjeta seleccionable (Primer): para elecciones con más peso (tipo de proyecto) que una lista
 * simple. Toda la tarjeta es la etiqueta (mismo patrón que un `<label>` envolviendo su control).
 */
export function RadioCard({
  id,
  label,
  className,
  ...props
}: ComponentProps<typeof RadioGroupPrimitive.Item> & { id: string; label: ReactNode }) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'press flex cursor-pointer items-center gap-2.5 rounded-md border border-hairline bg-glass px-3 py-2.5 text-small text-fg-muted transition-colors has-[button[data-state=checked]]:border-accent has-[button[data-state=checked]]:bg-accent-tint has-[button[data-state=checked]]:text-fg',
        className,
      )}
    >
      <RadioDot id={id} {...props} />
      {label}
    </label>
  );
}
