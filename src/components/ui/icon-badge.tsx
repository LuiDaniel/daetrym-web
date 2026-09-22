import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/**
 * Icono de línea fina (20 px) sobre un tinte del tono actual (`.hue-*`; verde por defecto).
 * Siempre va acompañado de texto, por eso es aria-hidden.
 */
export function IconBadge({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-md border border-h-line bg-h-tint text-h-fg',
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={1.5} />
    </span>
  );
}
