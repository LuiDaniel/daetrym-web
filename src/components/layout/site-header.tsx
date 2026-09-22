import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { mainNav } from '@/config/navigation';
import { Link } from '@/i18n/navigation';
import { LanguageSwitcher } from './language-switcher';
import { Logo } from './logo';
import { MobileMenu } from './mobile-menu';
import { NavLink } from './nav-link';
import { ScrollEdge } from './scroll-edge';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  const t = useTranslations();

  return (
    // Margen negativo: el header flota SOBRE el contenido (que pasa por debajo del material).
    // Las páginas compensan con `.page-top` (ver globals.css).
    <header className="sticky top-0 z-50 -mb-(--header-height) h-(--header-height)">
      <ScrollEdge />
      <div className="container-page relative flex h-full items-center justify-between gap-4">
        <Logo />

        <nav aria-label={t('header.mainNavLabel')} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.key}>
                <NavLink href={item.href}>{t(`nav.${item.key}`)}</NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* Idioma y tema visibles desde 640 px; por debajo, dentro del menú lateral. */}
          <div className="hidden items-center gap-2 sm:flex">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href="/request-quote">{t('common.requestQuote')}</Link>
          </Button>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
