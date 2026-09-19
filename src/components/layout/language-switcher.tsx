'use client';

import { motion } from 'motion/react';
import { useLocale, useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { routing, type Locale } from '@/i18n/routing';
import { cn } from '@/lib/cn';
import { spring } from '@/styles/motion';

/**
 * Selector de idioma como control segmentado. La píldora activa se desplaza con un spring
 * (layout animation, interrumpible). Con más de ~3 idiomas conviene cambiarlo por un popover.
 * La elección se persiste en la cookie NEXT_LOCALE (la gestiona next-intl).
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const t = useTranslations('language');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [pending, startTransition] = useTransition();

  function select(next: Locale) {
    if (next === locale) return;
    startTransition(() => {
      // El tipado estricto de rutas dinámicas exige `params`; se pasa tal cual (patrón de next-intl).
      router.replace({ pathname, params } as Parameters<typeof router.replace>[0], {
        locale: next,
      });
    });
  }

  return (
    <div
      role="group"
      aria-label={t('label')}
      aria-busy={pending}
      className={cn('inline-flex rounded-full p-1 material-thin', className)}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            lang={code}
            aria-pressed={active}
            aria-label={t('switchTo', { language: t(`names.${code}`) })}
            onClick={() => select(code)}
            className={cn(
              'press relative h-8 min-w-10 rounded-full px-2.5 text-label font-semibold uppercase',
              active ? 'text-on-accent' : 'text-fg-muted hover:text-fg',
            )}
          >
            {active && (
              <motion.span
                layoutId="language-pill"
                transition={spring.snappy}
                className="absolute inset-0 rounded-full bg-accent"
              />
            )}
            <span className="relative">{code}</span>
          </button>
        );
      })}
    </div>
  );
}
