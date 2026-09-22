'use client';

import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { SideSheet } from '@/components/ui/side-sheet';
import { mainNav } from '@/config/navigation';
import { Link, usePathname } from '@/i18n/navigation';
import { LanguageSwitcher } from './language-switcher';
import { ThemeToggle } from './theme-toggle';

/** Menú móvil: un sheet lateral con gestos (ver components/ui/side-sheet.tsx). */
export function MobileMenu() {
  const t = useTranslations();
  const pathname = usePathname();
  // Se recuerda en qué ruta se abrió: navegar (o volver atrás) lo cierra sin usar efectos.
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  if (openedAt !== null && openedAt !== pathname) setOpenedAt(null);
  const open = openedAt !== null;
  const setOpen = (next: boolean) => setOpenedAt(next ? pathname : null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={t('header.openMenu')}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="press inline-flex size-9 items-center justify-center rounded-full material-thin text-fg lg:hidden"
      >
        <Menu aria-hidden className="size-5" strokeWidth={1.5} />
      </button>

      <SideSheet
        open={open}
        onOpenChange={setOpen}
        title={t('menu.title')}
        description={t('menu.description')}
        closeLabel={t('menu.close')}
        returnFocusRef={triggerRef}
      >
        <nav aria-label={t('header.mainNavLabel')}>
          <ul className="flex flex-col">
            {mainNav.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className="press block rounded-md px-3 py-2.5 text-h3 text-fg hover:bg-glass-hover"
                >
                  {t(`nav.${item.key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 flex flex-col gap-3">
          <Button asChild size="lg">
            <Link href="/request-quote">{t('common.requestQuote')}</Link>
          </Button>
        </div>

        <div className="mt-8 flex items-center justify-between">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </SideSheet>
    </>
  );
}
