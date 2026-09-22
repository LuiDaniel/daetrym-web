import {
  BadgeCheck,
  BookOpen,
  Eye,
  Handshake,
  Scale,
  ShieldCheck,
  Target,
  Telescope,
} from 'lucide-react';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { useMessages, useTranslations } from 'next-intl';
import { BookCallButton } from '@/components/sections/book-call-button';
import { CardGrid, FeatureCard, TeamCard } from '@/components/sections/cards';
import { CtaBand } from '@/components/sections/cta-band';
import { PageHero } from '@/components/sections/page-hero';
import { Section, SectionHeader } from '@/components/sections/section';
import { SplitLayout } from '@/components/sections/split-layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DraftNotice } from '@/components/ui/draft-notice';
import { IconBadge } from '@/components/ui/icon-badge';
import { socialLinks } from '@/config/social';
import { team } from '@/config/team';
import type { Hue } from '@/config/hues';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';
import { ExternalLink } from 'lucide-react';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'about.meta' });
  return {
    title: t('title'),
    description: t('description'),
    alternates: buildAlternates(locale, '/about'),
  };
}

const valueIcons = {
  security: ShieldCheck,
  honesty: BadgeCheck,
  clarity: Eye,
  responsibility: Handshake,
  ethics: Scale,
  learning: BookOpen,
} as const;
const valueKeys = [
  'security',
  'honesty',
  'clarity',
  'responsibility',
  'ethics',
  'learning',
] as const;
/** Un tono por valor: recorre la paleta (intención, no decoración). */
const valueHues: Record<(typeof valueKeys)[number], Hue> = {
  security: 'green',
  honesty: 'blue',
  clarity: 'cyan',
  responsibility: 'violet',
  ethics: 'amber',
  learning: 'magenta',
};

export default function AboutPage() {
  const t = useTranslations('about');
  const common = useTranslations('common');
  const messages = useMessages();
  const hasPlaceholderTeam = team.some((member) => member.placeholder);

  return (
    <>
      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead')}
        hue="magenta"
        glow={['magenta', 'green']}
        actions={
          <>
            <Button asChild size="lg">
              <Link href="/request-quote">{common('requestQuote')}</Link>
            </Button>
            <BookCallButton size="lg" hue="magenta" />
          </>
        }
      />

      {/* Historia */}
      <Section labelledBy="story-title" hue="magenta">
        <SplitLayout
          aside={
            <SectionHeader id="story-title" eyebrow={t('story.eyebrow')} title={t('story.title')} />
          }
        >
          <div className="reveal max-w-2xl space-y-5 text-lead text-fg-muted">
            {messages.about.story.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <DraftNotice className="mt-8 max-w-2xl">{t('story.draftNote')}</DraftNotice>
        </SplitLayout>
      </Section>

      {/* Misión y visión */}
      <Section tone="raised" labelledBy="mission-title" hue="magenta" glow={['magenta', 'blue']}>
        <h2 id="mission-title" className="sr-only">
          {t('mission.eyebrow')}
        </h2>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2">
          <Card surface="glass" className="reveal">
            <IconBadge icon={Target} />
            <h3 className="mt-5 text-h3">{t('mission.missionTitle')}</h3>
            <p className="mt-3 text-lead text-fg-muted">{t('mission.missionText')}</p>
          </Card>
          <Card surface="glass" className="reveal">
            <IconBadge icon={Telescope} />
            <h3 className="mt-5 text-h3">{t('mission.visionTitle')}</h3>
            <p className="mt-3 text-lead text-fg-muted">{t('mission.visionText')}</p>
          </Card>
        </div>
      </Section>

      {/* Valores */}
      <Section labelledBy="values-title" hue="magenta">
        <SectionHeader id="values-title" eyebrow={t('values.eyebrow')} title={t('values.title')} />
        <CardGrid columns={3}>
          {valueKeys.map((key) => (
            <FeatureCard
              key={key}
              icon={valueIcons[key]}
              title={t(`values.items.${key}.title`)}
              text={t(`values.items.${key}.text`)}
              hue={valueHues[key]}
            />
          ))}
        </CardGrid>
      </Section>

      {/* Equipo (ejemplo) */}
      <Section tone="raised" labelledBy="team-title" hue="magenta" glow={['magenta', 'cyan']}>
        <SectionHeader
          id="team-title"
          eyebrow={t('team.eyebrow')}
          title={t('team.title')}
          lead={t('team.lead')}
        />
        {hasPlaceholderTeam && (
          <DraftNotice gated={false} className="mt-6 max-w-3xl">
            {t('team.notice')}
          </DraftNotice>
        )}
        <CardGrid columns={4} className="mt-6">
          {team.map((member) => (
            <TeamCard key={member.id} member={member} surface="glass" />
          ))}
        </CardGrid>

        {socialLinks.length > 0 && (
          <div className="mt-10">
            <h3 className="text-title">{t('social.title')}</h3>
            <ul className="mt-3.5 flex flex-wrap gap-2.5">
              {socialLinks.map((link) => (
                <li key={link.key}>
                  <Button asChild variant="secondary" size="sm">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${t('social.linkLabel', { name: link.label })} (${common('opensInNewTab')})`}
                    >
                      {link.label}
                      <ExternalLink aria-hidden className="size-3.5" />
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>

      <CtaBand title={t('cta.title')} lead={t('cta.lead')} />
    </>
  );
}
