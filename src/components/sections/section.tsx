import type { ReactNode } from 'react';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/cn';

type SectionProps = {
  /** id del encabezado de la sección: se usa como aria-labelledby (nombre del landmark). */
  labelledBy?: string;
  id?: string;
  /** `raised`: banda con fondo surface-1 para separar secciones sin líneas ni sombras. */
  tone?: 'default' | 'raised';
  className?: string;
  children: ReactNode;
};

export function Section({ labelledBy, id, tone = 'default', className, children }: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cn(
        'section-y',
        tone === 'raised' && 'border-y border-hairline bg-surface-1',
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
      className={cn('reveal max-w-3xl', align === 'center' && 'mx-auto text-center', className)}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 id={id} className={cn('text-h2', eyebrow && 'mt-3')}>
        {title}
      </h2>
      {lead && <p className="mt-4 text-lead text-fg-muted">{lead}</p>}
    </header>
  );
}
