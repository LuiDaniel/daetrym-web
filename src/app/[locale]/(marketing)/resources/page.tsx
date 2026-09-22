import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { ShieldCheck } from 'lucide-react';
import { NewsletterForm } from '@/components/forms/newsletter-form';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { Card } from '@/components/ui/card';
import { DraftNotice } from '@/components/ui/draft-notice';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'resources' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: buildAlternates(locale, '/resources'),
  };
}

export default function ResourcesPage() {
  const t = useTranslations('resources');

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        lead={t('lead')}
        hue="blue"
        glow={['blue', 'amber']}
        visual={
          <div
            aria-hidden
            className="grid aspect-square place-items-center rounded-xl border border-h-line bg-h-tint"
          >
            <ShieldCheck className="size-20 text-h-fg" strokeWidth={1} />
          </div>
        }
      />
      <Section labelledBy="resources-form-title" className="pt-0 sm:pt-0" hue="blue">
        <h2 id="resources-form-title" className="sr-only">
          {t('form.title')}
        </h2>
        <DraftNotice gated={false} className="mx-auto mb-6 max-w-2xl">
          {t('notice')}
        </DraftNotice>
        <Card surface="glass" className="mx-auto max-w-2xl">
          <h3 className="text-title">{t('form.title')}</h3>
          <p className="mt-1.5 mb-5 text-body text-fg-muted">{t('form.lead')}</p>
          <NewsletterForm source="checklist" />
        </Card>
      </Section>
    </>
  );
}
