import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { NotFoundView } from '@/components/sections/not-found-view';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('errors.notFound');
  return { title: t('title'), robots: { index: false, follow: true } };
}

/**
 * Destino al que src/proxy.ts reescribe las URLs desconocidas (con estado 404). Es una página normal,
 * así que se renderiza en servidor: el HTML ya trae el contenido, con o sin JavaScript.
 */
export default function NotFoundPage() {
  return <NotFoundView />;
}
