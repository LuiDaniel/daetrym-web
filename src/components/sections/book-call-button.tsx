import { ExternalLink } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button, type ButtonProps } from '@/components/ui/button';
import { siteConfig } from '@/config/site';
import { Link } from '@/i18n/navigation';

type BookCallButtonProps = Pick<ButtonProps, 'size' | 'variant' | 'className' | 'hue'>;

/**
 * "Agendar llamada": si hay una URL de agenda (NEXT_PUBLIC_CAL_URL) abre Cal.com u otra en una
 * pestaña nueva (con rel="noopener noreferrer"); si no, lleva a la página de contacto.
 */
export function BookCallButton({ variant = 'secondary', ...props }: BookCallButtonProps) {
  const t = useTranslations('common');
  const url = siteConfig.contact.calUrl;

  if (url) {
    return (
      <Button asChild variant={variant} {...props}>
        <a href={url} target="_blank" rel="noopener noreferrer">
          {t('bookCall')}
          <ExternalLink aria-hidden className="size-4" />
          <span className="sr-only">{`(${t('opensInNewTab')})`}</span>
        </a>
      </Button>
    );
  }

  return (
    <Button asChild variant={variant} {...props}>
      <Link href="/contact">{t('bookCall')}</Link>
    </Button>
  );
}
