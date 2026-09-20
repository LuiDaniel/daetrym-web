import { useTranslations } from 'next-intl';
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
    <section aria-labelledby="page-title" className="container-page page-top pb-24">
      <div className="max-w-2xl">
        <Eyebrow>{t('errors.notFound.code')}</Eyebrow>
        <h1 id="page-title" className="mt-4 text-h1">
          {t('errors.notFound.title')}
        </h1>
        <p className="mt-5 text-lead text-fg-muted">{t('errors.notFound.body')}</p>

        <div className="mt-9 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link href="/">{t('errors.notFound.home')}</Link>
          </Button>
        </div>

        <nav aria-label={t('errors.notFound.suggestions')} className="mt-12">
          <p className="text-eyebrow text-fg-subtle">{t('errors.notFound.suggestions')}</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
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
