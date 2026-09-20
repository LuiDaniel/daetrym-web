/**
 * Generador de /.well-known/security.txt conforme a RFC 9116.
 *  - Contact (obligatorio): URI `mailto:` o `https:`.
 *  - Expires (obligatorio, una sola vez): fecha ISO 8601 futura y a menos de un año.
 *  - Preferred-Languages (una sola vez), Canonical y Policy (pueden repetirse).
 * Módulo puro para poder probarlo sin Next.
 */

export type SecurityTxtInput = {
  /** Correo de contacto para reportes (se emite como `mailto:`). */
  contactEmail: string;
  expires: Date;
  preferredLanguages: readonly string[];
  /** URL absoluta donde se publica este archivo. */
  canonical: string;
  /** URLs absolutas de la política de divulgación (una por idioma). */
  policies: readonly string[];
};

const MAX_VALIDITY_MS = 365 * 24 * 60 * 60 * 1000;

export function buildSecurityTxt(input: SecurityTxtInput, now: Date = new Date()): string {
  const remaining = input.expires.getTime() - now.getTime();
  if (!(remaining > 0)) throw new Error('security.txt: Expires debe estar en el futuro');
  if (remaining >= MAX_VALIDITY_MS)
    throw new Error('security.txt: Expires debe ser inferior a un año (RFC 9116)');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.contactEmail)) {
    throw new Error('security.txt: Contact debe ser un correo válido');
  }

  const lines = [
    '# Política de divulgación responsable de DaeTrym / Responsible disclosure policy',
    `Contact: mailto:${input.contactEmail}`,
    `Expires: ${input.expires.toISOString()}`,
    `Preferred-Languages: ${input.preferredLanguages.join(', ')}`,
    `Canonical: ${input.canonical}`,
    ...input.policies.map((policy) => `Policy: ${policy}`),
  ];

  return `${lines.join('\n')}\n`;
}
