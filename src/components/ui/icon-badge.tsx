import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/** Icono decorativo sobre un tinte de acento. Siempre va acompañado de texto, por eso es aria-hidden. */
export function IconBadge({ icon: Icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-tint text-accent-text',
        className,
      )}
    >
      <Icon className="size-5" strokeWidth={1.75} />
    </span>
  );
}
