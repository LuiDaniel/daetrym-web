import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { BookCallButton } from './book-call-button';
import { Section } from './section';

/** Llamada a la acción final de cada página: propuesta (primaria) o llamada (secundaria). */
export function CtaBand({ title, lead }: { title: string; lead: string }) {
  const t = useTranslations('common');

  return (
    <Section labelledBy="cta-title">
      <div className="reveal relative isolate overflow-hidden rounded-xl border border-hairline bg-surface-1 px-6 py-14 text-center sm:px-12 sm:py-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(50%_80%_at_50%_0%,color-mix(in_srgb,var(--accent)_16%,transparent),transparent)]"
        />
        <h2 id="cta-title" className="mx-auto max-w-2xl text-h1">
          {title}
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-lead text-fg-muted">{lead}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/request-quote">{t('requestQuote')}</Link>
          </Button>
          <BookCallButton size="lg" />
        </div>
      </div>
    </Section>
  );
}
