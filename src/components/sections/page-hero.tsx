import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/cn';

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  lead?: string;
  /** Botones de acción. */
  actions?: ReactNode;
  /** Contenido bajo las acciones (p. ej. una nota de confianza). */
  footnote?: ReactNode;
  /** Elemento visual a la derecha en pantallas anchas (decorativo). */
  visual?: ReactNode;
  /** Migas de pan sobre el título. */
  breadcrumbs?: ReactNode;
  /** `display` solo para la Home; el resto de páginas usa `h1`. */
  size?: 'display' | 'h1';
};

/**
 * Cabecera de página. Es el elemento LCP: nada aquí se revela con animación ni depende de JavaScript.
 * El resplandor es estático y pasa por detrás del header translúcido (que flota sobre el contenido).
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  actions,
  footnote,
  visual,
  breadcrumbs,
  size = 'h1',
}: PageHeroProps) {
  return (
    <section aria-labelledby="page-title" className="relative isolate overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-136 bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_srgb,var(--accent)_20%,transparent),transparent)]"
      />
      <div
        className={cn(
          'container-page page-top pb-16 sm:pb-20',
          visual &&
            'grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16',
        )}
      >
        <div>
          {breadcrumbs && <div className="mb-6">{breadcrumbs}</div>}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1
            id="page-title"
            className={cn(
              size === 'display' ? 'text-display' : 'text-h1',
              eyebrow && 'mt-4',
              'max-w-4xl',
            )}
          >
            {title}
          </h1>
          {lead && <p className="mt-6 max-w-2xl text-lead text-fg-muted">{lead}</p>}
          {actions && <div className="mt-9 flex flex-wrap gap-3">{actions}</div>}
          {footnote && <div className="mt-6">{footnote}</div>}
        </div>
        {visual && <div className="mx-auto w-full max-w-md lg:max-w-none">{visual}</div>}
      </div>
    </section>
  );
}
