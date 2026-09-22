import { useTranslations } from 'next-intl';
import { AccentText } from '@/components/ui/accent-text';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import { Link } from '@/i18n/navigation';

const suggestions = [
  { key: 'services', href: '/services' },
  { key: 'cybersecurity', href: '/cybersecurity' },
  { key: 'contact', href: '/contact' },
] as const;

/**
 * Contenido del 404. Se muestra dentro del layout normal (header y footer incluidos) para que el
 * visitante pueda seguir navegando. Lo usan la página /<idioma>/404 (a la que el proxy reescribe las
 * URLs desconocidas, con estado 404) y not-found.tsx (para `notFound()` lanzado desde una página).
 */
export function NotFoundView() {
  const t = useTranslations();

  return (
    <section aria-labelledby="page-title" className="hue-amber container-page page-top pb-20">
      <div className="max-w-xl">
        <Eyebrow>{t('errors.notFound.code')}</Eyebrow>
        <h1 id="page-title" className="mt-3 text-h1">
          <AccentText text={t('errors.notFound.title')} />
        </h1>
        <p className="mt-4 text-lead text-fg-muted">{t('errors.notFound.body')}</p>

        <div className="mt-7 flex flex-wrap gap-2.5">
          <Button asChild size="lg">
            <Link href="/">{t('errors.notFound.home')}</Link>
          </Button>
        </div>

        <nav aria-label={t('errors.notFound.suggestions')} className="mt-10">
          <p className="text-eyebrow text-fg-subtle">{t('errors.notFound.suggestions')}</p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
            {suggestions.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="text-body text-accent-text underline decoration-hairline-strong underline-offset-4 hover:decoration-current"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}
