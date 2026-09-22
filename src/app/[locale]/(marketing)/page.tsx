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
import { useLocale, useMessages, useTranslations } from 'next-intl';
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
import { hueClass, type Hue } from '@/config/hues';
import { processStepIds } from '@/config/process';
import { serviceSlugs } from '@/config/services';
import { siteConfig } from '@/config/site';
import { stack, stackGroups, stackHues } from '@/config/stack';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { getFeaturedProjects } from '@/lib/content/projects';
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
/** Un tono por principio (intención, no decoración). */
const whyHues: Record<(typeof whyKeys)[number], Hue> = {
  design: 'violet',
  code: 'cyan',
  transparency: 'amber',
  bothSides: 'green',
};
/** Las seis etapas recorren la paleta de la marca (verde → cian → azul → violeta → magenta → ámbar). */
const processHues: Hue[] = ['green', 'cyan', 'blue', 'violet', 'magenta', 'amber'];

export default function HomePage() {
  const locale = useLocale() as Locale;
  const t = useTranslations('home');
  const common = useTranslations('common');
  const projectsT = useTranslations('projects');
  const messages = useMessages();
  const faqItems = faqSchema.parse(messages.home.faq.items);
  const featuredProjects = getFeaturedProjects(locale);
  const hasPlaceholderProjects = featuredProjects.some(
    (project) => project.frontmatter.placeholder,
  );
  const mailto = `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(t('soon.mailSubject'))}`;

  return (
    <>
      <PageHero
        size="display"
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        glow={['green', 'cyan']}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/request-quote">{common('requestQuote')}</Link>
            </Button>
            <BookCallButton size="lg" hue="cyan" />
          </>
        }
        footnote={
          <div className="flex max-w-xl items-start gap-2 text-small text-fg-muted">
            <ShieldCheck
              aria-hidden
              className="mt-0.5 size-4 shrink-0 text-h-fg"
              strokeWidth={1.5}
            />
            <p>
              {t('hero.trust')}{' '}
              <Link
                href={{ pathname: '/cybersecurity', hash: 'authorization' }}
                className="whitespace-nowrap text-h-fg underline decoration-hairline-strong underline-offset-4 hover:decoration-current"
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
      <Section labelledBy="services-title" hue="violet" glow={['violet', 'amber']}>
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
        <div className="mt-6">
          <ArrowLink href="/services">{common('viewAllServices')}</ArrowLink>
        </div>
      </Section>

      {/* Por qué DaeTrym */}
      <Section tone="raised" labelledBy="why-title" hue="cyan" glow={['cyan', 'blue']}>
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
              hue={whyHues[key]}
            />
          ))}
        </CardGrid>
      </Section>

      {/* Proceso resumido */}
      <Section labelledBy="process-title" hue="magenta" glow={['magenta', 'green']}>
        <SectionHeader
          id="process-title"
          eyebrow={t('process.eyebrow')}
          title={t('process.title')}
          lead={t('process.lead')}
        />
        <ol className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {processStepIds.map((id, index) => (
            <li key={id} className={cn('reveal', hueClass[processHues[index] ?? 'green'])}>
              <Card className="h-full">
                <span aria-hidden className="font-mono text-small text-h-fg">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2.5 text-title">{messages.process.steps[id].title}</h3>
                <p className="mt-1.5 text-body text-fg-muted">
                  {messages.process.steps[id].summary}
                </p>
              </Card>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <ArrowLink href="/process">{t('process.cta')}</ArrowLink>
        </div>
      </Section>

      {/* Proyectos destacados (ejemplo) */}
      <Section tone="raised" labelledBy="projects-title" hue="violet" glow={['violet', 'cyan']}>
        <SectionHeader
          id="projects-title"
          eyebrow={t('projects.eyebrow')}
          title={t('projects.title')}
          lead={t('projects.lead')}
        />
        {hasPlaceholderProjects && (
          <DraftNotice gated={false} className="mt-6 max-w-3xl">
            {t('projects.notice')}
          </DraftNotice>
        )}
        <CardGrid columns={3} className="mt-6">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              href={{ pathname: '/projects/[slug]', params: { slug: project.slug } }}
              category={project.frontmatter.category}
              categoryLabel={projectsT(`categories.${project.frontmatter.category}`)}
              title={project.frontmatter.title}
              summary={project.frontmatter.summary}
              tags={project.frontmatter.tags}
              placeholder={project.frontmatter.placeholder}
            />
          ))}
        </CardGrid>
        <div className="mt-6">
          <ArrowLink href="/projects">{t('projects.cta')}</ArrowLink>
        </div>
      </Section>

      {/* Tecnologías */}
      <Section labelledBy="stack-title" hue="blue" glow={['blue', 'amber']}>
        <SectionHeader
          id="stack-title"
          eyebrow={t('stack.eyebrow')}
          title={t('stack.title')}
          lead={t('stack.lead')}
        />
        <CardGrid columns={3}>
          {stackGroups.map((group) => (
            <Card key={group} className={cn('reveal', hueClass[stackHues[group]])}>
              <h3 className="text-title">{t(`stack.groups.${group}`)}</h3>
              <ul className="mt-3.5 flex flex-wrap gap-1.5">
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
      <Section tone="raised" labelledBy="faq-title" hue="cyan" glow={['cyan', 'magenta']}>
        <SplitLayout
          aside={<SectionHeader id="faq-title" eyebrow={t('faq.eyebrow')} title={t('faq.title')} />}
        >
          <Faq items={faqItems} idPrefix="home-faq" />
        </SplitLayout>
      </Section>

      {/* Próximamente / lista de espera */}
      <Section labelledBy="soon-title" hue="blue" glow={['blue', 'magenta']}>
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
            hue="magenta"
          />
          <FeatureCard
            icon={ListChecks}
            title={t('soon.items.checklist.title')}
            text={t('soon.items.checklist.text')}
            hue="blue"
          />
        </CardGrid>
        <div className="mt-6">
          <Button asChild variant="secondary">
            <a href={mailto}>{t('soon.cta')}</a>
          </Button>
        </div>
      </Section>

      <CtaBand title={t('cta.title')} lead={t('cta.lead')} />
    </>
  );
}
