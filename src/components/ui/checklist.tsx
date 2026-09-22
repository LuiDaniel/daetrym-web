import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Lista con marca de verificación. La marca es decorativa: la semántica de lista ya la aporta <ul>. */
export function Checklist({ items, className }: { items: readonly string[]; className?: string }) {
  return (
    <ul className={cn('space-y-3', className)}>
      {items.map((item, index) => (
        <li key={`${index}:${item}`} className="flex gap-2.5 text-body text-fg-muted">
          <span
            aria-hidden
            className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-h-line bg-h-tint text-h-fg"
          >
            <Check className="size-3" strokeWidth={2.25} />
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
