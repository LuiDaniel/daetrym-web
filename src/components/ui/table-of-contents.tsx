'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/content/headings';
import { cn } from '@/lib/cn';

/**
 * Tabla de contenidos del artículo (Fase 3): fija en escritorio, como el índice de `LegalDocument`.
 * Resalta el título visible con `IntersectionObserver` — `rootMargin` negativo arriba compensa el
 * header flotante (un título queda "visible" solo cuando ya libró la píldora).
 */
export function TableOfContents({ headings, label }: { headings: Heading[]; label: string }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-96px 0px -70% 0px' },
    );

    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((el): el is HTMLElement => el !== null);
    for (const el of elements) observer.observe(el);

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label={label} className="lg:sticky lg:top-24 lg:self-start">
      <p className="text-eyebrow text-fg-subtle">{label}</p>
      <ol className="mt-3 grid gap-y-1 lg:border-l lg:border-hairline">
        {headings.map((heading) => {
          const active = activeId === heading.id;
          return (
            <li key={heading.id} className={heading.level === 3 ? 'ml-3' : undefined}>
              <a
                href={`#${heading.id}`}
                aria-current={active ? 'location' : undefined}
                className={cn(
                  'block rounded-sm py-1.5 text-small transition-colors lg:pl-4',
                  active ? 'font-medium text-h-fg' : 'text-fg-muted hover:text-fg',
                )}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
