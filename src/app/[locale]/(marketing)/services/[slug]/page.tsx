import { CircleAlert } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { useMessages, useTranslations } from 'next-intl';
import { BookCallButton } from '@/components/sections/book-call-button';
import { CardGrid, ServiceCard } from '@/components/sections/cards';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section, SectionHeader } from '@/components/sections/section';
import { SplitLayout } from '@/components/sections/split-layout';
import { ArrowLink } from '@/components/ui/arrow-link';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checklist } from '@/components/ui/checklist';
import { Faq } from '@/components/ui/faq';
import { Steps } from '@/components/ui/steps';
import { isServiceSlug, serviceHues, serviceSlugs } from '@/config/services';
import type { Hue } from '@/config/hues';
import { Link } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';
import { serviceContentSchema } from '@/schemas/page-content';
import { getMessages } from 'next-intl/server';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => serviceSlugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isServiceSlug(slug)) return {};
  const messages = await getMessages({ locale });
  const content = serviceContentSchema.parse(messages.services.items[slug]);
  return {
    title: content.meta.title,
    description: content.meta.description,
    alternates: buildAlternates(locale, { pathname: '/services/[slug]', params: { slug } }),
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  if (!isServiceSlug(slug)) notFound();
  return <ServiceView slug={slug} />;
}

/**
 * Segundo tono del resplandor de cada servicio: distinto en el hero y en "otros servicios" para que
 * ninguna de las dos combinaciones de la página se repita (ver docs/DESIGN.md).
 */
const heroGlowPartner: Record<(typeof serviceSlugs)[number], Hue> = {
  'web-apps': 'blue',
  'custom-software': 'magenta',
  cybersecurity: 'blue',
  consulting: 'magenta',
};
const relatedGlowPartner: Record<(typeof serviceSlugs)[number], Hue> = {
  'web-apps': 'violet',
  'custom-software': 'cyan',
  cybersecurity: 'amber',
  consulting: 'blue',
};

function ServiceView({ slug }: { slug: (typeof serviceSlugs)[number] }) {
  const t = useTranslations('services');
  const common = useTranslations('common');
  const messages = useMessages();
  const content = serviceContentSchema.parse(messages.services.items[slug]);
  const others = serviceSlugs.filter((other) => other !== slug);
  const hue = serviceHues[slug];

  return (
    <>
      <PageHero
        title={content.name}
        lead={content.tagline}
        hue={hue}
        glow={[hue, heroGlowPartner[slug]]}
        breadcrumbs={
          <Breadcrumbs
            items={[{ label: t('detail.rootLabel'), href: '/services' }, { label: content.name }]}
          />
        }
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/request-quote">{common('requestQuote')}</Link>
            </Button>
            <BookCallButton size="lg" hue={hue} />
          </>
        }
      />

      {/* Problema */}
      <Section labelledBy="problem-title" hue={hue}>
        <SplitLayout
          aside={
            <SectionHeader
              id="problem-title"
              eyebrow={t('detail.problemEyebrow')}
              title={content.problem.title}
              lead={content.problem.body}
            />
          }
        >
          <Card className="reveal">
            <ul className="space-y-4">
              {content.problem.points.map((point) => (
                <li key={point} className="flex gap-3 text-body text-fg-muted">
                  <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0 text-fg-subtle" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        </SplitLayout>
      </Section>

      {/* Solución */}
      <Section tone="raised" labelledBy="solution-title" hue={hue}>
        <SplitLayout
          aside={
            <SectionHeader
              id="solution-title"
              eyebrow={t('detail.solutionEyebrow')}
              title={content.solution.title}
              lead={content.solution.body}
            />
          }
        >
          <Card surface="glass" className="reveal">
            <Checklist items={content.solution.points} />
          </Card>
          {slug === 'cybersecurity' && (
            <div className="mt-6">
              <ArrowLink href="/cybersecurity">{t('detail.cybersecurityHubLink')}</ArrowLink>
            </div>
          )}
        </SplitLayout>
      </Section>

      {/* Proceso */}
      <Section labelledBy="process-title" hue={hue}>
        <SplitLayout
          aside={
            <SectionHeader
              id="process-title"
              eyebrow={t('detail.processEyebrow')}
              title={t('detail.processTitle')}
            />
          }
        >
          <Steps
            items={content.process.map((step, index) => ({
              title: step.title,
              text: step.text,
              label: t('detail.stepLabel', { number: index + 1 }),
            }))}
          />
        </SplitLayout>
      </Section>

      {/* Entregables */}
      <Section tone="raised" labelledBy="deliverables-title" hue={hue}>
        <SplitLayout
          aside={
            <SectionHeader
              id="deliverables-title"
              eyebrow={t('detail.deliverablesEyebrow')}
              title={t('detail.deliverablesTitle')}
            />
          }
        >
          <Card surface="glass" className="reveal">
            <Checklist items={content.deliverables} />
          </Card>
        </SplitLayout>
      </Section>

      {/* FAQ */}
      <Section labelledBy="faq-title" hue={hue}>
        <SplitLayout
          aside={
            <SectionHeader
              id="faq-title"
              eyebrow={t('detail.faqEyebrow')}
              title={t('detail.faqTitle')}
            />
          }
        >
          <Faq items={content.faq} idPrefix={`faq-${slug}`} />
        </SplitLayout>
      </Section>

      {/* Otros servicios */}
      <Section
        tone="raised"
        labelledBy="related-title"
        hue={hue}
        glow={[hue, relatedGlowPartner[slug]]}
      >
        <SectionHeader id="related-title" title={t('detail.relatedTitle')} />
        <CardGrid columns={3}>
          {others.map((other) => (
            <ServiceCard
              key={other}
              slug={other}
              name={messages.services.items[other].name}
              summary={messages.services.items[other].summary}
            />
          ))}
        </CardGrid>
      </Section>

      <CtaBand title={content.cta.title} lead={content.cta.text} />
    </>
  );
}
