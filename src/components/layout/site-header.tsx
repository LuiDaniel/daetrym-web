import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { mainNav } from '@/config/navigation';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { MobileMenu } from './mobile-menu';
import { NavLink } from './nav-link';
import { ThemeToggle } from './theme-toggle';

/**
 * Header flotante en forma de píldora de vidrio. Flota SOBRE el contenido (margen negativo): las
 * páginas compensan con `.page-top` (ver globals.css). El contenedor no captura el puntero; solo la píldora.
 */
export function SiteHeader() {
  const t = useTranslations();

  return (
    <header className="pointer-events-none sticky top-0 z-50 -mb-(--header-height) h-(--header-height) px-(--gutter) pt-3">
      <div className="pointer-events-auto mx-auto flex h-13 max-w-(--header-width) items-center justify-between gap-3 rounded-full material-regular py-1.5 pr-1.5 pl-4">
        <Logo />

        <nav aria-label={t('header.mainNavLabel')} className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {mainNav.map((item) => (
              <li key={item.key}>
                <NavLink href={item.href}>{t(`nav.${item.key}`)}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          {/* Idioma y tema visibles desde 640 px; por debajo, dentro del menú lateral. */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {/* rounded-full: dentro del header flotante, todo adopta el radio de píldora del contenedor. */}
          <Button asChild size="sm" className="hidden rounded-full sm:inline-flex">
            <Link href="/request-quote">{t('common.requestQuote')}</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
