import { MessageCircle } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import { siteConfig } from '@/config/site';
import type { Locale } from '@/i18n/routing';

/**
 * Botón flotante de WhatsApp (solo enlace `wa.me`, sin widget embebido — docs/ARCHITECTURE.md §3, así
 * la CSP no necesita ningún origen nuevo). Se oculta por completo sin `NEXT_PUBLIC_WHATSAPP_NUMBER`.
 * Servidor: no hace falta ningún estado de cliente, es un enlace `<a>` llano.
 */
export async function WhatsAppButton({ locale }: { locale: Locale }) {
  const number = siteConfig.contact.whatsapp;
  if (!number) return null;

  const t = await getTranslations({ locale, namespace: 'common' });

  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${t('whatsapp')} (${t('opensInNewTab')})`}
      // `text-accent-text` (no `text-green-400`, fijo): ese paso concreto de la escala solo cumple
      // 3:1 sobre `material-thick` en tema oscuro — en claro, ese material es casi blanco y el icono
      // quedaba en 1.75:1. `accent-text` ya es el par correcto por tema (verificado en
      // `pnpm check:contrast`).
      className="press fixed right-4 bottom-4 z-40 grid size-13 place-items-center rounded-full material-thick text-accent-text sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-6" strokeWidth={1.75} fill="currentColor" />
    </a>
  );
}
