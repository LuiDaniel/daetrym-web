import { EmailButton, EmailLayout } from './layout';

/**
 * Plantillas de los emails de usuario (bilingües: el texto llega ya traducido desde
 * `src/actions/*`, que lo resuelve con `getTranslations({ locale, namespace: 'emails' })` antes de
 * renderizar — así el texto vive en src/messages como el resto del sitio, y estas plantillas son
 * presentacionales puras. Las notificaciones INTERNAS (al equipo, no al visitante) están en
 * `internal-templates.tsx`: no necesitan traducción, así que llevan el texto en español directamente
 * (docs/ARCHITECTURE.md §14).
 */

export function ContactConfirmationEmail({
  greeting,
  body,
  footer,
}: {
  /** Ya interpolado (`t('contact.confirmationGreeting', { name })`), sin `{name}` sin resolver. */
  greeting: string;
  body: string;
  footer: string;
}) {
  return (
    <EmailLayout preview={body} title={greeting} footer={footer}>
      <p style={{ margin: 0 }}>{greeting}</p>
      <p style={{ marginTop: 12, marginBottom: 0 }}>{body}</p>
    </EmailLayout>
  );
}

export function QuoteConfirmationEmail({
  greeting,
  body,
  footer,
}: {
  greeting: string;
  body: string;
  footer: string;
}) {
  return (
    <EmailLayout preview={body} title={greeting} footer={footer}>
      <p style={{ margin: 0 }}>{greeting}</p>
      <p style={{ marginTop: 12, marginBottom: 0 }}>{body}</p>
    </EmailLayout>
  );
}

export function WaitlistConfirmationEmail({ greeting, body }: { greeting: string; body: string }) {
  return (
    <EmailLayout preview={body} title={greeting} footer="">
      <p style={{ margin: 0 }}>{greeting}</p>
      <p style={{ marginTop: 12, marginBottom: 0 }}>{body}</p>
    </EmailLayout>
  );
}

export function NewsletterConfirmEmail({
  greeting,
  body,
  buttonLabel,
  confirmUrl,
  expiry,
}: {
  greeting: string;
  body: string;
  buttonLabel: string;
  confirmUrl: string;
  expiry: string;
}) {
  return (
    <EmailLayout preview={body} title={greeting} footer={expiry}>
      <p style={{ margin: 0 }}>{greeting}</p>
      <p style={{ marginTop: 12, marginBottom: 0 }}>{body}</p>
      <EmailButton href={confirmUrl}>{buttonLabel}</EmailButton>
    </EmailLayout>
  );
}

export function NewsletterWelcomeEmail({
  greeting,
  body,
  downloadUrl,
  downloadButtonLabel,
  downloadExpiry,
  unsubscribeFooter,
  unsubscribeLabel,
  unsubscribeUrl,
}: {
  greeting: string;
  body: string;
  /** Solo si la suscripción viene del lead magnet (`source: 'checklist'`). */
  downloadUrl?: string;
  downloadButtonLabel: string;
  downloadExpiry: string;
  unsubscribeFooter: string;
  unsubscribeLabel: string;
  unsubscribeUrl: string;
}) {
  return (
    <EmailLayout
      preview={body}
      title={greeting}
      footer={
        <>
          {unsubscribeFooter}{' '}
          <a href={unsubscribeUrl} style={{ color: 'inherit' }}>
            {unsubscribeLabel}
          </a>
        </>
      }
    >
      <p style={{ margin: 0 }}>{greeting}</p>
      <p style={{ marginTop: 12, marginBottom: 0 }}>{body}</p>
      {downloadUrl && (
        <>
          <EmailButton href={downloadUrl}>{downloadButtonLabel}</EmailButton>
          <p
            style={{ marginTop: 12, marginBottom: 0, fontSize: 13, color: 'rgba(243,248,245,.62)' }}
          >
            {downloadExpiry}
          </p>
        </>
      )}
    </EmailLayout>
  );
}
