import { useFormatter, useMessages } from 'next-intl';
import type { Hue } from '@/config/hues';
import { siteConfig } from '@/config/site';
import { legalDocumentSchema, securityPolicySchema } from '@/schemas/page-content';
import { LegalDocument } from './legal-document';

const values = {
  legalName: siteConfig.legalName,
  email: siteConfig.contact.email,
  securityEmail: siteConfig.contact.securityEmail,
};

/** Un tono por documento: ayuda a distinguirlos de un vistazo (sobretítulo, marcadores, índice). */
const legalHues: Record<'privacy' | 'terms' | 'cookies', Hue> = {
  privacy: 'blue',
  terms: 'violet',
  cookies: 'amber',
};

/** Fecha de última revisión de los documentos legales, formateada según el idioma. */
function useUpdated() {
  const format = useFormatter();
  return format.dateTime(new Date(`${siteConfig.legalUpdated}T00:00:00Z`), {
    dateStyle: 'long',
    timeZone: 'UTC',
  });
}

/** Privacidad, términos o cookies: contenido validado con Zod desde src/messages/<locale>/legal.json. */
export function LegalPage({ docKey }: { docKey: 'privacy' | 'terms' | 'cookies' }) {
  const messages = useMessages();
  const updated = useUpdated();
  const doc = legalDocumentSchema.parse(messages.legal[docKey]);

  return (
    <LegalDocument
      title={doc.title}
      intro={doc.intro}
      sections={doc.sections}
      values={values}
      updated={updated}
      draft={messages.legal.draft}
      hue={legalHues[docKey]}
    />
  );
}

/** Política de divulgación responsable (/security): mismo tono que /cybersecurity. */
export function SecurityPolicyPage() {
  const messages = useMessages();
  const updated = useUpdated();
  const policy = securityPolicySchema.parse(messages.security);

  return (
    <LegalDocument
      eyebrow={policy.eyebrow}
      title={policy.title}
      intro={policy.intro}
      sections={policy.sections}
      values={values}
      updated={updated}
      draft={policy.draft}
      hue="green"
    />
  );
}
