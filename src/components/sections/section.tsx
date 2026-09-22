import type { ReactNode } from 'react';
import { AccentText } from '@/components/ui/accent-text';
import { Eyebrow } from '@/components/ui/eyebrow';
import { hueClass, type Hue } from '@/config/hues';
import { cn } from '@/lib/cn';

type SectionProps = {
  /** id del encabezado de la sección: se usa como aria-labelledby (nombre del landmark). */
  labelledBy?: string;
  id?: string;
  /** `raised`: banda con un tinte sutil sobre el fondo para separar secciones sin sombras. */
  tone?: 'default' | 'raised';
  /** Tono de la sección (sobretítulo, enlaces, iconos). Verde de marca por defecto. */
  hue?: Hue;
  className?: string;
  children: ReactNode;
};

export function Section({
  labelledBy,
  id,
  tone = 'default',
  hue,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'section-y',
        tone === 'raised' && 'border-y border-hairline bg-band',
        hue && hueClass[hue],
        className,
      )}
    >
      <div className="container-page">{children}</div>
    </section>
  );
}

type SectionHeaderProps = {
  id: string;
  eyebrow?: string;
  /** Admite `*palabra*` para el acento editorial (serif cursiva); ver `AccentText`. */
  title: string;
  lead?: string;
  align?: 'start' | 'center';
  className?: string;
};

/** Encabezado de sección: sobretítulo + h2 + entradilla. Aparece con un revelado suave al hacer scroll. */
export function SectionHeader({
  id,
  eyebrow,
  title,
  lead,
  align = 'start',
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn('reveal max-w-2xl', align === 'center' && 'mx-auto text-center', className)}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={id} className={cn('text-h2', eyebrow && 'mt-2.5')}>
        <AccentText text={title} />
      </h2>
      {lead && <p className="mt-3 text-lead text-fg-muted">{lead}</p>}
    </header>
  );
}
