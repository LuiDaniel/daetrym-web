import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { LegalPage } from '@/components/sections/legal-page';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = (await getMessages({ locale })).legal.cookies.meta;
  return {
    title: meta.title,
    description: meta.description,
    alternates: buildAlternates(locale, '/legal/cookies'),
  };
}

export default function CookiesPage() {
  return <LegalPage docKey="cookies" />;
}
