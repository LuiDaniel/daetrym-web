'use client';

import type { ComponentProps } from 'react';
import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/lib/cn';

type NavLinkProps = ComponentProps<typeof Link>;

/** Enlace con `aria-current="page"` (usa el pathname interno, independiente del idioma). */
export function NavLink({ href, className, ...props }: NavLinkProps) {
  const pathname = usePathname();
  const target = typeof href === 'string' ? href : href.pathname;
  const active =
    target === '/' ? pathname === '/' : pathname === target || pathname.startsWith(`${target}/`);

  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'rounded-md px-2.5 py-1.5 text-small font-medium transition-colors',
        active ? 'bg-glass-hover text-fg' : 'text-fg-muted hover:bg-glass hover:text-fg',
        className,
      )}
      {...props}
    />
  );
}
