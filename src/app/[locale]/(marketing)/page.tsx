import {
  ArrowLeftRight,
  Braces,
  Eye,
  ListChecks,
  PencilRuler,
  ScanSearch,
  ShieldCheck,
} from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useMessages, useTranslations } from 'next-intl';
import { BookCallButton } from '@/components/sections/book-call-button';
import { Card } from '@/components/ui/card';
import { CardGrid, FeatureCard, ProjectCard, ServiceCard } from '@/components/sections/cards';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section, SectionHeader } from '@/components/sections/section';
import { SecurityLayers } from '@/components/sections/security-layers';
import { SplitLayout } from '@/components/sections/split-layout';
import { ArrowLink } from '@/components/ui/arrow-link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DraftNotice } from '@/components/ui/draft-notice';
import { Faq } from '@/components/ui/faq';
import { featuredProjects } from '@/config/projects';
import { processStepIds } from '@/config/process';
import { serviceSlugs } from '@/config/services';
import { siteConfig } from '@/config/site';
import { stack, stackGroups } from '@/config/stack';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';
import { faqSchema } from '@/schemas/page-content';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.meta' });
  return {
    title: { absolute: t('title') },
    description: t('description'),
    alternates: buildAlternates(locale, '/'),
  };
}

const whyIcons = {
  design: PencilRuler,
  code: Braces,
  transparency: Eye,
  bothSides: ArrowLeftRight,
} as const;
const whyKeys = ['design', 'code', 'transparency', 'bothSides'] as const;

export default function HomePage() {
  const t = useTranslations('home');
  const common = useTranslations('common');
  const messages = useMessages();
  const faqItems = faqSchema.parse(messages.home.faq.items);
  const hasPlaceholderProjects = featuredProjects.some((project) => project.placeholder);
  const mailto = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(t('soon.mailSubject'))}`;

  return (
    <>
      <PageHero
        size="display"
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/request-quote">{common('requestQuote')}</Link>
            </Button>
            <BookCallButton size="lg" />
          </>
        }
        footnote={
          <div className="flex max-w-xl items-start gap-2.5 text-small text-fg-muted">
            <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-accent-text" />
            <p>
              {t('hero.trust')}{' '}
              <Link
                href={{ pathname: '/cybersecurity', hash: 'authorization' }}
                className="whitespace-nowrap text-accent-text underline decoration-hairline-strong underline-offset-4 hover:decoration-current"
              >
                {t('hero.trustLink')}
              </Link>
            </p>
          </div>
        }
        visual={
          <SecurityLayers
            labels={{
              design: t('hero.layers.design'),
              code: t('hero.layers.code'),
              infrastructure: t('hero.layers.infrastructure'),
              operations: t('hero.layers.operations'),
            }}
          />
        }
      />

      {/* Servicios */}
      <Section labelledBy="services-title">
        <SectionHeader
          id="services-title"
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          lead={t('services.lead')}
        />
        <CardGrid columns={4}>
          {serviceSlugs.map((slug) => (
            <ServiceCard
              key={slug}
              slug={slug}
              name={messages.services.items[slug].name}
              summary={messages.services.items[slug].summary}
            />
          ))}
        </CardGrid>
        <div className="mt-8">
          <ArrowLink href="/services">{common('viewAllServices')}</ArrowLink>
        </div>
      </Section>

      {/* Por qué DaeTrym */}
      <Section tone="raised" labelledBy="why-title">
        <SectionHeader
          id="why-title"
          eyebrow={t('why.eyebrow')}
          title={t('why.title')}
          lead={t('why.lead')}
        />
        <CardGrid columns={2}>
          {whyKeys.map((key) => (
            <FeatureCard
              key={key}
              icon={whyIcons[key]}
              title={t(`why.items.${key}.title`)}
              text={t(`why.items.${key}.text`)}
              className="bg-surface-2"
            />
          ))}
        </CardGrid>
      </Section>

      {/* Proceso resumido */}
      <Section labelledBy="process-title">
        <SectionHeader
          id="process-title"
          eyebrow={t('process.eyebrow')}
          title={t('process.title')}
          lead={t('process.lead')}
        />
        <ol className="mt-12 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {processStepIds.map((id, index) => (
            <li key={id} className="reveal">
              <Card className="h-full">
                <span aria-hidden className="font-mono text-small text-accent-text">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-3 text-title">{messages.process.steps[id].title}</h3>
                <p className="mt-2 text-body text-fg-muted">{messages.process.steps[id].summary}</p>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <ArrowLink href="/process">{t('process.cta')}</ArrowLink>
        </div>
      </Section>

      {/* Proyectos destacados (ejemplo) */}
      <Section tone="raised" labelledBy="projects-title">
        <SectionHeader
          id="projects-title"
          eyebrow={t('projects.eyebrow')}
          title={t('projects.title')}
          lead={t('projects.lead')}
        />
        {hasPlaceholderProjects && (
          <DraftNotice gated={false} className="mt-8 max-w-3xl">
            {t('projects.notice')}
          </DraftNotice>
        )}
        <CardGrid columns={3} className="mt-8">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              categoryLabel={t(`projects.categories.${project.category}`)}
              className="bg-surface-2"
            />
          ))}
        </CardGrid>
        <div className="mt-8">
          <ArrowLink href="/projects">{t('projects.cta')}</ArrowLink>
        </div>
      </Section>

      {/* Tecnologías */}
      <Section labelledBy="stack-title">
        <SectionHeader
          id="stack-title"
          eyebrow={t('stack.eyebrow')}
          title={t('stack.title')}
          lead={t('stack.lead')}
        />
        <CardGrid columns={3}>
          {stackGroups.map((group) => (
            <Card key={group} className="reveal">
              <h3 className="text-title">{t(`stack.groups.${group}`)}</h3>
              <ul className="mt-4 flex flex-wrap gap-2">
                {stack[group].map((name) => (
                  <li key={name}>
                    <Badge>{name}</Badge>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </CardGrid>
      </Section>

      {/* FAQ */}
      <Section tone="raised" labelledBy="faq-title">
        <SplitLayout
          aside={<SectionHeader id="faq-title" eyebrow={t('faq.eyebrow')} title={t('faq.title')} />}
        >
          <Faq items={faqItems} idPrefix="home-faq" />
        </SplitLayout>
      </Section>

      {/* Próximamente / lista de espera */}
      <Section labelledBy="soon-title">
        <SectionHeader
          id="soon-title"
          eyebrow={t('soon.eyebrow')}
          title={t('soon.title')}
          lead={t('soon.lead')}
        />
        <CardGrid columns={2}>
          <FeatureCard
            icon={ScanSearch}
            title={t('soon.items.tool.title')}
            text={t('soon.items.tool.text')}
          />
          <FeatureCard
            icon={ListChecks}
            title={t('soon.items.checklist.title')}
            text={t('soon.items.checklist.text')}
          />
        </CardGrid>
        <div className="mt-8">
          <Button asChild variant="secondary">
            <a href={mailto}>{t('soon.cta')}</a>
          </Button>
        </div>
      </Section>

      <CtaBand title={t('cta.title')} lead={t('cta.lead')} />
    </>
  );
}
