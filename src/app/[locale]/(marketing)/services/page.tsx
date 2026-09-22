import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useMessages, useTranslations } from 'next-intl';
import { CardGrid, ServiceCard } from '@/components/sections/cards';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { serviceSlugs } from '@/config/services';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'services.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/services'),
  };
}

export default function ServicesPage() {
  const t = useTranslations('services');
  const messages = useMessages();

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        lead={t('lead')}
        hue="violet"
        glow={['violet', 'amber']}
      />

      <Section labelledBy="services-list-title" className="pt-0 sm:pt-0">
        <h2 id="services-list-title" className="sr-only">
          {t('index.listTitle')}
        </h2>
        <CardGrid columns={2} className="mt-0">
          {serviceSlugs.map((slug) => (
            <ServiceCard
              key={slug}
              slug={slug}
              name={messages.services.items[slug].name}
              summary={messages.services.items[slug].tagline}
            />
          ))}
        </CardGrid>
      </Section>

      <CtaBand title={t('index.helpTitle')} lead={t('index.helpText')} />
    </>
  );
}
