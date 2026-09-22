import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { confirmNewsletter } from '@/actions/newsletter';
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
  const t = await getTranslations({ locale, namespace: 'newsletter.confirm' });
  return {
    title: t('meta.title'),
    robots: { index: false, follow: false },
    alternates: buildAlternates(locale, '/newsletter/confirm'),
  };
}

/**
 * GET solo abre esta página con el botón; el POST (confirmNewsletter, bind del token) confirma de
 * verdad — así un escáner de correo que sigue el enlace del email no confirma por accidente
 * (docs/ARCHITECTURE.md §3). Tras confirmar, la acción redirige aquí mismo con `?status=`.
 */
export default async function NewsletterConfirmPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { token, status } = await searchParams;
  const t = await getTranslations({ locale, namespace: 'newsletter.confirm' });

  const outcome = status ?? (token ? 'pending' : 'invalid');

  return (
    <>
      <PageHero title={t('pendingTitle')} hue="green" />
      <Section labelledBy="confirm-title" className="pt-0 sm:pt-0" hue="green">
        <h2 id="confirm-title" className="sr-only">
          {t('pendingTitle')}
        </h2>
        <div className="mx-auto max-w-md">
          {outcome === 'pending' && token && (
            <>
              <p className="mb-5 text-body text-fg-muted">{t('pendingBody')}</p>
              <form action={confirmNewsletter.bind(null, token, locale)}>
                <Button type="submit">{t('button')}</Button>
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
