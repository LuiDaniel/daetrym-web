import { Clock, LayoutDashboard, MessagesSquare, Repeat } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useMessages, useTranslations } from 'next-intl';
import { BookCallButton } from '@/components/sections/book-call-button';
import { CardGrid, FeatureCard } from '@/components/sections/cards';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section, SectionHeader } from '@/components/sections/section';
import { Button } from '@/components/ui/button';
import { Checklist } from '@/components/ui/checklist';
import { Steps } from '@/components/ui/steps';
import { processStepIds } from '@/config/process';
import type { Hue } from '@/config/hues';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';
import { processStepSchema } from '@/schemas/page-content';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'process.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/process'),
  };
}

const collaborationIcons = {
  cadence: Repeat,
  channel: MessagesSquare,
  visibility: LayoutDashboard,
} as const;
const collaborationKeys = ['cadence', 'channel', 'visibility'] as const;
const collaborationHues: Record<(typeof collaborationKeys)[number], Hue> = {
  cadence: 'blue',
  channel: 'cyan',
  visibility: 'violet',
};

export default function ProcessPage() {
  const t = useTranslations('process');
  const common = useTranslations('common');
  const messages = useMessages();

  const steps = processStepIds.map((id) => processStepSchema.parse(messages.process.steps[id]));

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        hue="blue"
        glow={['blue', 'cyan']}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/request-quote">{common('requestQuote')}</Link>
            </Button>
            <BookCallButton size="lg" hue="blue" />
          </>
        }
      />

      <Section labelledBy="stages-title" hue="blue" className="pt-0 sm:pt-0">
        <h2 id="stages-title" className="sr-only">
          {t('labels.stagesTitle')}
        </h2>
        <div className="mx-auto max-w-3xl">
          <Steps
            items={steps.map((step, index) => ({
              title: step.title,
              text: `${step.summary} ${step.description}`,
              label: t('labels.step', { number: index + 1 }),
              extra: (
                <div className="space-y-4">
                  <p className="flex items-start gap-2 text-small text-fg-muted">
                    <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-h-fg" />
                    <span>{`${t('labels.duration')}: ${step.duration}`}</span>
                  </p>
                  <div>
                    <p className="mb-2 text-eyebrow text-fg-subtle">{t('labels.outputs')}</p>
                    <Checklist items={step.outputs} />
                  </div>
                </div>
              ),
            }))}
          />
        </div>
      </Section>

      <Section tone="raised" labelledBy="collaboration-title" hue="blue" glow={['blue', 'magenta']}>
        <SectionHeader
          id="collaboration-title"
          eyebrow={t('collaboration.eyebrow')}
          title={t('collaboration.title')}
        />
        <CardGrid columns={3}>
          {collaborationKeys.map((key) => (
            <FeatureCard
              key={key}
              icon={collaborationIcons[key]}
              title={t(`collaboration.items.${key}.title`)}
              text={t(`collaboration.items.${key}.text`)}
              hue={collaborationHues[key]}
              surface="glass"
            />
          ))}
        </CardGrid>
        <p className="reveal mt-6 text-small text-fg-subtle">{t('collaboration.note')}</p>
      </Section>

      <CtaBand title={t('cta.title')} lead={t('cta.lead')} />
    </>
  );
}
