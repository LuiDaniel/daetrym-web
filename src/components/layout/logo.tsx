import { useTranslations } from 'next-intl';
import { siteConfig } from '@/config/site';
import { Link } from '@/i18n/navigation';
import { cn } from '@/lib/cn';
import { LogoMark } from './logo-mark';

/** Isotipo + wordmark (el logo original no incluye texto). Enlaza al inicio del idioma actual. */
export function Logo({ className }: { className?: string }) {
  const t = useTranslations('common');

  return (
    <Link
      href="/"
      aria-label={t('homeLink')}
      className={cn('inline-flex items-center gap-2 text-fg', className)}
    >
      <LogoMark className="h-6" />
      <span aria-hidden className="text-title tracking-tight">
        {siteConfig.name}
      </span>
    </Link>
  );
}
