import { ArrowRight } from 'lucide-react';
import type { ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

/**
 * Enlace secundario de sección ("Ver todos los servicios →"). Alineado con el texto de la sección
 * (a diferencia de un botón fantasma, que tiene relleno propio) y con la flecha que avanza al pasar.
 */
export function ArrowLink({ className, children, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        'group inline-flex items-center gap-2 rounded-sm py-2 text-body font-medium text-accent-text',
        className,
      )}
      {...props}
    >
      <span className="underline decoration-transparent underline-offset-4 transition-colors group-hover:decoration-current">
        {children}
      </span>
      <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
