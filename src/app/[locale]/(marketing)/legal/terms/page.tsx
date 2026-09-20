import type { Metadata } from 'next';
import { getMessages } from 'next-intl/server';
import { LegalPage } from '@/components/sections/legal-page';
import type { Locale } from '@/i18n/routing';
import { buildAlternates } from '@/lib/seo/alternates';

type Props = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const meta = (await getMessages({ locale })).legal.terms.meta;
  return {
    title: meta.title,
    description: meta.description,
    alternates: buildAlternates(locale, '/legal/terms'),
  };
}

export default function TermsPage() {
  return <LegalPage docKey="terms" />;
}
