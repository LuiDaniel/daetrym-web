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
      className="press fixed right-4 bottom-4 z-40 grid size-13 place-items-center rounded-full material-thick text-green-400 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-6" strokeWidth={1.75} fill="currentColor" />
    </a>
  );
}
