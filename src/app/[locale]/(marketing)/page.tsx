import type { Metadata } from 'next';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { alternates: buildAlternates(locale, '/') };
}

const pillars = ['web', 'custom', 'security'] as const;

/**
 * Home PROVISIONAL de la Fase 1: solo demuestra tokens, tipografía, materiales y botones.
 * La Home real (servicios, proceso, proyectos, FAQ, CTA…) llega en la Fase 2.
 */
export default function HomePage() {
  const t = useTranslations('home');
  const common = useTranslations('common');

  return (
    <div className="relative isolate overflow-hidden">
      {/* Resplandor estático (sin fondos animados de viewport completo: apple-design §14) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(60%_50%_at_50%_0%,color-mix(in_srgb,var(--accent)_22%,transparent),transparent)]"
      />

      <section className="container-page page-top pb-16">
        <p className="font-mono text-label text-accent-text">{t('hero.eyebrow')}</p>
        <h1 className="mt-5 max-w-4xl text-display">{t('hero.title')}</h1>
        <p className="mt-6 max-w-2xl text-lead text-fg-muted">{t('hero.lead')}</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/request-quote">{common('requestQuote')}</Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link href="/contact">{common('bookCall')}</Link>
          </Button>
        </div>
      </section>

      <section className="container-page pb-8">
        <ul className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <li key={pillar} className="rounded-lg material-regular p-6">
              <h2 className="text-h3">{t(`pillars.${pillar}.title`)}</h2>
              <p className="mt-3 text-body text-fg-muted">{t(`pillars.${pillar}.description`)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
