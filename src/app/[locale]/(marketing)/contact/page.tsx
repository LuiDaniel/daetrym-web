import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { ContactForm } from '@/components/forms/contact-form';
import { PageHero } from '@/components/sections/page-hero';
import { Section } from '@/components/sections/section';
import { Card } from '@/components/ui/card';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: buildAlternates(locale, '/contact'),
  };
}

export default function ContactPage() {
  const t = useTranslations('contact');

  return (
    <>
      <PageHero
        eyebrow={t('eyebrow')}
        title={t('title')}
        lead={t('lead')}
        hue="green"
        glow={['green', 'blue']}
      />
      <Section labelledBy="contact-form-title" className="pt-0 sm:pt-0" hue="green">
        <h2 id="contact-form-title" className="sr-only">
          {t('title')}
        </h2>
        <Card surface="glass" className="mx-auto max-w-2xl">
          <ContactForm />
        </Card>
        <p className="mx-auto mt-6 max-w-2xl text-center text-small text-fg-subtle">
          {t.rich('alternative', {
            link: (chunks) => (
              <a href={`mailto:${siteConfig.contact.email}`} className="underline hover:text-h-fg">
                {chunks}
              </a>
            ),
            email: siteConfig.contact.email,
          })}
        </p>
      </Section>
    </>
  );
}
