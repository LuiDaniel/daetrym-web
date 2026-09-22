import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { unsubscribeNewsletter } from '@/actions/newsletter';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { Banner } from '@/components/ui/banner';
import { Button } from '@/components/ui/button';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ token?: string; status?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'newsletter.unsubscribe' });
  return {
    title: t('meta.title'),
    robots: { index: false, follow: false },
    alternates: buildAlternates(locale, '/newsletter/unsubscribe'),
  };
}

/**
 * RFC 8058: la baja debe poder hacerse con un solo clic, sin iniciar sesión. Aun así se mantiene el
 * mismo patrón GET-abre/POST-confirma que la confirmación, para que un escáner de correo no dé de
 * baja a nadie sin que lo pida (mismo motivo que en newsletter/confirm).
 */
export default async function NewsletterUnsubscribePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, status } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'newsletter.unsubscribe' });

  const outcome = status ?? (token ? 'pending' : 'invalid');

  return (
    <>
      <PageHero title={t('pendingTitle')} hue="amber" />
      <Section labelledBy="unsubscribe-title" className="pt-0 sm:pt-0" hue="amber">
        <h2 id="unsubscribe-title" className="sr-only">
          {t('pendingTitle')}
        </h2>
        <div className="mx-auto max-w-md">
          {outcome === 'pending' && token && (
            <>
              <p className="mb-5 text-body text-fg-muted">{t('pendingBody')}</p>
              <form action={unsubscribeNewsletter.bind(null, token, locale)}>
                <Button type="submit" variant="secondary">
                  {t('button')}
                </Button>
              </form>
            </>
          )}
          {outcome === 'success' && (
            <Banner tone="success" title={t('successTitle')} role="status">
              {t('successBody')}
            </Banner>
          )}
          {outcome === 'already' && (
            <Banner tone="info" title={t('alreadyTitle')} role="status">
              {t('alreadyBody')}
            </Banner>
          )}
          {outcome === 'invalid' && (
            <Banner tone="critical" title={t('invalidTitle')} role="alert">
              {t('invalidBody')}
            </Banner>
          )}
        </div>
      </Section>
    </>
  );
}
