import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/cn';

/**
 * Campos de formulario. Borde de 1px con contraste ≥ 3:1 (`--input-border`, WCAG 1.4.11), 36 px de alto,
 * radio pequeño y fondo translúcido sin blur. El foco usa el anillo global (:focus-visible).
 */
const control =
  'w-full rounded-md border border-input bg-glass px-3 text-body text-fg placeholder:text-fg-subtle disabled:opacity-50 aria-[invalid=true]:border-danger';

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, 'h-9', className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(control, 'min-h-28 resize-y py-2', className)} {...props} />;
}

/**
 * Etiqueta + control + ayuda/error. El error se asocia con `aria-describedby` y se anuncia (role="alert").
 * El llamador pasa `id` y lo usa en el control; los ids de ayuda y error se derivan de él.
 */
export function Field({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  /** El control (Input, Textarea…) con `id={id}` y `aria-describedby={`${id}-hint ${id}-error`}`. */
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-small font-medium text-fg">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-label text-fg-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-label text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
