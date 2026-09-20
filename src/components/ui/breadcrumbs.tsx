import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import type { AppPathname } from '@/i18n/routing';

type Crumb = { label: string; href?: Exclude<AppPathname, `${string}[${string}`> };

/** Ruta de navegación: el último elemento es la página actual (sin enlace, con aria-current). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const t = useTranslations('common');

  return (
    <nav aria-label={t('breadcrumbLabel')}>
      <ol className="flex flex-wrap items-center gap-1.5 text-small text-fg-muted">
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-1.5">
              {item.href && !last ? (
                <Link href={item.href} className="rounded-sm hover:text-fg">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className={last ? 'text-fg' : undefined}
                >
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight aria-hidden className="size-4 text-fg-subtle" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
