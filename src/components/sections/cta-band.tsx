import { useTranslations } from 'next-intl';
import { AccentText } from '@/components/ui/accent-text';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { BookCallButton } from './book-call-button';
import { Section } from './section';

/**
 * Llamada a la acción final de cada página: propuesta (primaria, verde sólido — el único botón sólido
 * de la banda) o llamada (secundaria, con el acento magenta de este resplandor, no verde por defecto).
 * Vidrio con blur; resplandor propio verde + magenta (combinación que no se repite en ninguna otra
 * sección de la Home, ver docs/DESIGN.md).
 */
export function CtaBand({ title, lead }: { title: string; lead: string }) {
  const t = useTranslations('common');

  return (
    <Section labelledBy="cta-title">
      <div className="reveal relative isolate overflow-hidden rounded-xl material-regular px-6 py-12 text-center sm:px-12 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-56"
          style={{
            background:
              'radial-gradient(60% 100% at 28% 0%, color-mix(in srgb, var(--c-green) var(--glow-alpha), transparent), transparent 70%), radial-gradient(55% 100% at 80% 0%, color-mix(in srgb, var(--c-magenta) var(--glow-alpha), transparent), transparent 70%)',
          }}
        />
        <h2 id="cta-title" className="mx-auto max-w-xl text-h1">
          <AccentText text={title} />
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lead text-fg-muted">{lead}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-2.5">
          <Button asChild size="lg">
            <Link href="/request-quote">{t('requestQuote')}</Link>
          </Button>
          <BookCallButton size="lg" hue="magenta" />
        </div>
      </div>
    </Section>
  );
}
