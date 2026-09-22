'use client';

import { useSyncExternalStore } from 'react';

export type Theme = 'dark' | 'light';

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  return () => observer.disconnect();
}

const getSnapshot = (): Theme =>
  document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';

/** El servidor siempre renderiza oscuro (tema por defecto); el cliente corrige tras hidratar. */
const getServerSnapshot = (): Theme => 'dark';

/** Tema actual del sitio (no el del sistema operativo): reactivo a `ThemeToggle` vía MutationObserver. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
