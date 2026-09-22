import { useTranslations } from 'next-intl';
import { Banner } from '@/components/ui/banner';
import { siteConfig } from '@/config/site';
import type { ActionResult } from '@/actions/types';

/** Traduce el resultado de una Server Action de formulario a un `Banner` (éxito o error concreto). */
export function FormStatusBanner({ result }: { result: ActionResult | null }) {
  const t = useTranslations('forms');

  if (!result) return null;

  if (result.ok) {
    return (
      <Banner tone="success" title={t('success.title')} role="status">
        {t('success.body')}
      </Banner>
    );
  }

  const body =
    result.error === 'rate_limit'
      ? t('error.rateLimit')
      : t('error.generic', { email: siteConfig.contact.email });

  return (
    <Banner tone="critical" title={t('error.title')} role="alert">
      {body}
    </Banner>
  );
}
