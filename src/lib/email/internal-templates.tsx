import type { ReactNode } from 'react';
import { EmailLayout } from './layout';

/**
 * Avisos internos (al equipo de DaeTrym, no al visitante): no pasan por `src/messages` —igual que el
 * resto del sitio no tiene panel de administración (D7)— y siempre en español, el idioma de trabajo
 * del equipo, sea cual sea el idioma en el que escribió quien envió el formulario (ese dato se incluye
 * como un campo más, "Idioma").
 */

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <tr>
      <td
        style={{
          padding: '6px 0',
          borderTop: '1px solid rgba(255,255,255,.08)',
          fontSize: 13,
          color: 'rgba(243,248,245,.62)',
          verticalAlign: 'top',
          whiteSpace: 'nowrap',
          paddingRight: 16,
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: '6px 0',
          borderTop: '1px solid rgba(255,255,255,.08)',
          fontSize: 14,
        }}
      >
        {value}
      </td>
    </tr>
  );
}

export function ContactInternalEmail({
  name,
  email,
  company,
  subject,
  message,
  locale,
}: {
  name: string;
  email: string;
  company?: string | null;
  subject: string;
  message: string;
  locale: string;
}) {
  return (
    <EmailLayout preview={`${name}: ${subject}`} title="Nuevo mensaje de contacto" footer="">
      <p style={{ margin: '0 0 12px' }}>Nuevo mensaje desde el formulario de contacto.</p>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          <Row label="Nombre" value={name} />
          <Row label="Email" value={email} />
          {company && <Row label="Empresa" value={company} />}
          <Row label="Asunto" value={subject} />
          <Row label="Idioma" value={locale} />
        </tbody>
      </table>
      <p style={{ marginTop: 16, marginBottom: 0, whiteSpace: 'pre-wrap' }}>{message}</p>
    </EmailLayout>
  );
}

export function QuoteInternalEmail({
  name,
  email,
  company,
  projectType,
  services,
  budgetRange,
  timeline,
  description,
  locale,
}: {
  name: string;
  email: string;
  company?: string | null;
  projectType: string;
  services: string[];
  budgetRange: string;
  timeline: string;
  description: string;
  locale: string;
}) {
  return (
    <EmailLayout preview={`${name}: ${projectType}`} title="Nueva solicitud de propuesta" footer="">
      <p style={{ margin: '0 0 12px' }}>Nueva solicitud desde el formulario de propuesta.</p>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          <Row label="Nombre" value={name} />
          <Row label="Email" value={email} />
          {company && <Row label="Empresa" value={company} />}
          <Row label="Tipo de proyecto" value={projectType} />
          <Row label="Servicios" value={services.join(', ')} />
          <Row label="Presupuesto" value={budgetRange} />
          <Row label="Plazo" value={timeline} />
          <Row label="Idioma" value={locale} />
        </tbody>
      </table>
      <p style={{ marginTop: 16, marginBottom: 0, whiteSpace: 'pre-wrap' }}>{description}</p>
    </EmailLayout>
  );
}
