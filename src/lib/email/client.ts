import { render } from '@react-email/render';
import { Resend } from 'resend';
import type { ReactElement } from 'react';
import { env } from '@/env';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export type SendEmailInput = {
  to: string;
  subject: string;
  react: ReactElement;
  /** RFC 8058 (`List-Unsubscribe`/`List-Unsubscribe-Post`) en los emails de newsletter. */
  headers?: Record<string, string>;
};

/**
 * Envía con Resend si hay `RESEND_API_KEY`; si no (desarrollo sin cuenta, docs/ARCHITECTURE.md §8),
 * solo registra el asunto y el texto en consola — el flujo completo se puede seguir sin enviar nada
 * de verdad. Nunca lanza: un fallo de email no debe tumbar la acción que ya guardó los datos en BD;
 * se registra y la llamada devuelve si tuvo éxito para que el actor decida qué contar al usuario.
 */
export async function sendEmail({ to, subject, react, headers }: SendEmailInput) {
  if (!resend) {
    const text = await render(react, { plainText: true });
    console.info(`[email:log-mode] Para: ${to} · Asunto: ${subject}\n${text}`);
    return { success: true as const };
  }

  try {
    const text = await render(react, { plainText: true });
    const { error } = await resend.emails.send({
      from: env.EMAIL_FROM,
      to,
      subject,
      react,
      text,
      headers,
    });
    if (error) {
      console.error('[email] Resend devolvió un error', error.name, error.message);
      return { success: false as const };
    }
    return { success: true as const };
  } catch (error) {
    console.error('[email] fallo al enviar', error);
    return { success: false as const };
  }
}
