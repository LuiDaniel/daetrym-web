'use client';

import { motion } from 'motion/react';
import { cn } from '@/lib/cn';
import { spring } from '@/styles/motion';

export type FilterOption = { value: string; label: string };

/**
 * Filtro segmentado (blog y proyectos, Fase 3): mismo patrón que `LanguageSwitcher` — una píldora que
 * se desliza con spring entre opciones — pero con el tono ambiente (`bg-h-tint`/`text-h-fg`) en vez del
 * verde fijo: cada página del listado ya tiene su propio color (ver docs/DESIGN.md, balance de color),
 * así que el filtro lo hereda en vez de imponer el de marca por defecto.
 */
export function CategoryFilter({
  value,
  onChange,
  options,
  label,
  layoutId,
}: {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  label: string;
  /** Único por filtro en la página: evita que dos filtros compartan la animación de la píldora. */
  layoutId: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="inline-flex flex-wrap gap-1 rounded-md material-thin p-1"
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className="press relative h-8 rounded-sm px-3 text-small font-medium"
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                transition={spring.snappy}
                className="absolute inset-0 rounded-sm border border-h-line bg-h-tint"
              />
            )}
            <span className={cn('relative', active ? 'text-h-fg' : 'text-fg-muted hover:text-fg')}>
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
