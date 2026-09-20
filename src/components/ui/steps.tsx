import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export type StepItem = {
  title: string;
  text: string;
  /** Texto para lectores de pantalla, p. ej. «Paso 2». */
  label: string;
  /** Contenido adicional bajo el texto (duración, entregables…). */
  extra?: ReactNode;
};

/**
 * Lista numerada con línea de tiempo vertical. La numeración visual es decorativa; la lista ordenada
 * y la etiqueta oculta («Paso 2») dan la semántica a los lectores de pantalla.
 */
export function Steps({ items, className }: { items: StepItem[]; className?: string }) {
  return (
    <ol className={cn('grid', className)}>
      {items.map((item, index) => {
        const last = index === items.length - 1;
        return (
          <li key={`${index}:${item.title}`} className="reveal grid grid-cols-[auto_1fr] gap-x-5">
            <div className="flex flex-col items-center">
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full border border-hairline-strong bg-surface-2 font-mono text-small text-accent-text"
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              {!last && <span aria-hidden className="mt-2 w-px flex-1 bg-hairline-strong" />}
            </div>
            <div className={cn('min-w-0', last ? 'pb-0' : 'pb-10')}>
              <h3 className="pt-1.5 text-title">
                <span className="sr-only">{`${item.label}: `}</span>
                {item.title}
              </h3>
              <p className="mt-2 text-body text-fg-muted">{item.text}</p>
              {item.extra && <div className="mt-4">{item.extra}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
