import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';
import { MotionProvider } from '@/components/motion/motion-provider';
import { SiteFooter } from '@/components/layout/site-footer';
import { SiteHeader } from '@/components/layout/site-header';
import { SkipLink } from '@/components/layout/skip-link';
import { siteConfig } from '@/config/site';
import { routing } from '@/i18n/routing';
import { THEME_SCRIPT } from '@/lib/security/theme-script';
import { instrumentSerif, inter, jetbrainsMono } from '../fonts';
import '@/styles/globals.css';

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: 'meta' });

  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t('title'), template: t('titleTemplate') },
    description: t('description'),
    applicationName: siteConfig.name,
    openGraph: {
      type: 'website',
      siteName: siteConfig.name,
      locale,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  colorScheme: 'dark light',
  width: 'device-width',
  initialScale: 1,
};

/** Solo estos espacios de nombres llegan al cliente (el resto se queda en el servidor). */
const CLIENT_NAMESPACES = [
  'common',
  'nav',
  'header',
  'menu',
  'theme',
  'language',
  'errors',
] as const;

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Nonce de la CSP generado en src/proxy.ts. Leer headers() hace el render dinámico (ver D1).
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const messages = await getMessages();
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((namespace) => [namespace, messages[namespace]]),
  );

  return (
    <html
      lang={locale}
      data-theme="dark"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable}`}
    >
      <head>
        {/* Fija el tema antes del primer pintado. El navegador oculta el nonce tras ejecutarlo. */}
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }}
        />
      </head>
      <body>
        <NextIntlClientProvider messages={clientMessages}>
          <MotionProvider>
            <SkipLink />
            <SiteHeader />
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <SiteFooter />
          </MotionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
