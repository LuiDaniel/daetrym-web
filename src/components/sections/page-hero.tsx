import type { ReactNode } from 'react';
import { AccentText } from '@/components/ui/accent-text';
import { Eyebrow } from '@/components/ui/eyebrow';
import { hueClass, type Hue } from '@/config/hues';
import { cn } from '@/lib/cn';

type PageHeroProps = {
  eyebrow?: string;
  /** Admite `*palabra*` para el acento editorial (serif cursiva): una palabra por título. */
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
  /** Tono del sobretítulo y de los detalles (verde de marca por defecto). */
  hue?: Hue;
};

/**
 * Cabecera de página. Es el elemento LCP: nada aquí se revela con animación ni depende de JavaScript.
 * Los resplandores de color son globales (body::before) y pasan por detrás del header de vidrio.
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
  hue,
}: PageHeroProps) {
  return (
    <section aria-labelledby="page-title" className={cn('relative', hue && hueClass[hue])}>
      <div
        className={cn(
          'container-page page-top pb-12 sm:pb-16',
          visual &&
            'grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-14',
        )}
      >
        <div>
          {breadcrumbs && <div className="mb-5">{breadcrumbs}</div>}
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1
            id="page-title"
            className={cn(
              size === 'display' ? 'text-display' : 'text-h1',
              eyebrow && 'mt-3',
              'max-w-3xl',
            )}
          >
            <AccentText text={title} />
          </h1>
          {lead && <p className="mt-5 max-w-xl text-lead text-fg-muted">{lead}</p>}
          {actions && <div className="mt-7 flex flex-wrap gap-2.5">{actions}</div>}
          {footnote && <div className="mt-5">{footnote}</div>}
        </div>
        {visual && <div className="mx-auto w-full max-w-sm lg:max-w-none">{visual}</div>}
      </div>
    </section>
  );
}
