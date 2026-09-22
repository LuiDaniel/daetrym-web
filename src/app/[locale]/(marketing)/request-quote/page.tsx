import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { QuoteWizard } from '@/components/forms/quote-wizard';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { Card } from '@/components/ui/card';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'quote' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: buildAlternates(locale, '/request-quote'),
  };
}

export default function RequestQuotePage() {
  const t = useTranslations('quote');

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        lead={t('lead')}
        hue="green"
        glow={['green', 'magenta']}
      />
      <Section labelledBy="quote-form-title" className="pt-0 sm:pt-0" hue="green">
        <h2 id="quote-form-title" className="sr-only">
          {t('title')}
        </h2>
        <Card surface="glass" className="mx-auto max-w-2xl">
          <QuoteWizard />
        </Card>
      </Section>
    </>
  );
}
