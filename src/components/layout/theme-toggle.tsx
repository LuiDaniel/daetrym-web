'use client';

import { motion } from 'motion/react';
import { Moon, Sun } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSyncExternalStore } from 'react';
import { THEME_STORAGE_KEY } from '@/lib/security/theme-script';
import { spring } from '@/styles/motion';

type Theme = 'dark' | 'light';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

/** El servidor siempre renderiza oscuro (tema por defecto); el cliente corrige tras hidratar. */
const getServerSnapshot = (): Theme => 'dark';

export function ThemeToggle() {
  const t = useTranslations('theme');
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next: Theme = theme === 'dark' ? 'light' : 'dark';

  function toggle() {
    const root = document.documentElement;
    // Transición de color breve para evitar un salto brusco de brillo.
    root.setAttribute('data-theme-transition', '');
    root.setAttribute('data-theme', next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* almacenamiento bloqueado: el tema solo dura esta sesión */
    }
    window.setTimeout(() => root.removeAttribute('data-theme-transition'), 350);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === 'dark' ? t('toLight') : t('toDark')}
      className="press relative inline-flex size-8 items-center justify-center rounded-full material-thin text-fg"
    >
      <motion.span
        aria-hidden
        className="absolute inline-flex"
        initial={false}
        animate={{
          opacity: theme === 'dark' ? 1 : 0,
          scale: theme === 'dark' ? 1 : 0.6,
          rotate: theme === 'dark' ? 0 : -90,
        }}
        transition={spring.snappy}
      >
        <Moon className="size-4" strokeWidth={1.5} />
      </motion.span>
      <motion.span
        aria-hidden
        className="absolute inline-flex"
        initial={false}
        animate={{
          opacity: theme === 'light' ? 1 : 0,
          scale: theme === 'light' ? 1 : 0.6,
          rotate: theme === 'light' ? 0 : 90,
        }}
        transition={spring.snappy}
      >
        <Sun className="size-4" strokeWidth={1.5} />
      </motion.span>
    </button>
  );
}
