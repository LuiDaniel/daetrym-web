import { FileSearch, GraduationCap, Search, ShieldAlert, Siren, Wrench, X } from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useTranslations } from 'next-intl';
import { BookCallButton } from '@/components/sections/book-call-button';
import { CardGrid } from '@/components/sections/cards';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section, SectionHeader } from '@/components/sections/section';
import { SplitLayout } from '@/components/sections/split-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checklist } from '@/components/ui/checklist';
import { IconBadge } from '@/components/ui/icon-badge';
import { Steps } from '@/components/ui/steps';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';
import { useMessages } from 'next-intl';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'cybersecurity.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/cybersecurity'),
  };
}

const scopeIcons = {
  pentest: Search,
  codeAudit: FileSearch,
  hardening: Wrench,
  incident: Siren,
  training: GraduationCap,
} as const;
const scopeKeys = ['pentest', 'codeAudit', 'hardening', 'incident', 'training'] as const;
const methodologyKeys = ['owasp', 'nist', 'ptes'] as const;

export default function CybersecurityPage() {
  const t = useTranslations('cybersecurity');
  const common = useTranslations('common');
  const messages = useMessages();
  const phases = messages.cybersecurity.phases.items;

  return (
    <>
      <PageHero
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
      />

      {/* Autorización por escrito: la regla que no se negocia. */}
      <Section id="authorization" labelledBy="authorization-title" tone="raised">
        <SplitLayout
          aside={
            <div>
              <IconBadge icon={ShieldAlert} />
              <SectionHeader
                id="authorization-title"
                eyebrow={t('authorization.eyebrow')}
                title={t('authorization.title')}
                lead={t('authorization.lead')}
                className="mt-5"
              />
            </div>
          }
        >
          <Card className="reveal border-accent/40 bg-surface-2">
            <Checklist items={messages.cybersecurity.authorization.points} />
          </Card>
          <p className="mt-6 text-body text-fg-muted">
            {t('authorization.disclosureText')}{' '}
            <Link
              href="/security"
              className="text-accent-text underline decoration-hairline-strong underline-offset-4 hover:decoration-current"
            >
              {t('authorization.disclosureLink')}
            </Link>
          </p>
        </SplitLayout>
      </Section>

      {/* Alcance */}
      <Section labelledBy="scope-title">
        <SectionHeader
          id="scope-title"
          eyebrow={t('scope.eyebrow')}
          title={t('scope.title')}
          lead={t('scope.lead')}
        />
        <CardGrid columns={3}>
          {scopeKeys.map((key) => (
            <Card key={key} className="reveal flex flex-col gap-4">
              <IconBadge icon={scopeIcons[key]} />
              <h3 className="text-title">{t(`scope.items.${key}.title`)}</h3>
              <p className="text-body text-fg-muted">{t(`scope.items.${key}.text`)}</p>
              <div className="mt-auto border-t border-hairline pt-4">
                <p className="mb-3 text-eyebrow text-fg-subtle">{t('scope.includesLabel')}</p>
                <ul className="space-y-1.5 text-small text-fg-muted">
                  {messages.cybersecurity.scope.items[key].includes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span
                        aria-hidden
                        className="mt-2 size-1 shrink-0 rounded-full bg-accent-text"
                      />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
          <Card className="reveal flex flex-col gap-4 border-dashed bg-transparent">
            <h3 className="text-title">{t('scope.outTitle')}</h3>
            <ul className="space-y-3">
              {messages.cybersecurity.scope.outItems.map((item) => (
                <li key={item} className="flex gap-3 text-small text-fg-muted">
                  <X aria-hidden className="mt-0.5 size-4 shrink-0 text-fg-subtle" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>
        </CardGrid>
      </Section>

      {/* Metodologías */}
      <Section tone="raised" labelledBy="methodologies-title">
        <SectionHeader
          id="methodologies-title"
          eyebrow={t('methodologies.eyebrow')}
          title={t('methodologies.title')}
          lead={t('methodologies.lead')}
        />
        <CardGrid columns={3}>
          {methodologyKeys.map((key) => (
            <Card key={key} className="reveal flex flex-col gap-3 bg-surface-2">
              <h3 className="text-h3">{t(`methodologies.items.${key}.name`)}</h3>
              <p className="font-mono text-small text-accent-text">
                {t(`methodologies.items.${key}.subtitle`)}
              </p>
              <p className="text-body text-fg-muted">{t(`methodologies.items.${key}.text`)}</p>
            </Card>
          ))}
        </CardGrid>
        <p className="reveal mt-6 max-w-3xl text-body text-fg-muted">
          {t('methodologies.scoringNote')}
        </p>
      </Section>

      {/* Fases PTES */}
      <Section labelledBy="phases-title">
        <SplitLayout
          aside={
            <SectionHeader
              id="phases-title"
              eyebrow={t('phases.eyebrow')}
              title={t('phases.title')}
              lead={t('phases.lead')}
            />
          }
        >
          <Steps
            items={phases.map((phase, index) => ({
              title: phase.title,
              text: phase.text,
              label: t('phases.stepLabel', { number: index + 1 }),
            }))}
          />
        </SplitLayout>
      </Section>

      <CtaBand title={t('cta.title')} lead={t('cta.lead')} />
    </>
  );
}
