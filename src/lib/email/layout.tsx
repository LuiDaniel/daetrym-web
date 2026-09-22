import type { ReactNode } from 'react';

/**
 * Envoltorio compartido de los emails transaccionales. Sin `@react-email/components` (el paquete y
 * todos sus sub-paquetes están marcados "no longer supported" en npm desde el equipo de Resend — ver
 * docs/ARCHITECTURE.md §14): HTML llano + estilos en línea, que es lo único fiable entre clientes de
 * correo. Colores literales (un cliente de correo no entiende `var(--token)`, igual que `src/lib/og.tsx`
 * — el mismo motivo por el que ese archivo vive fuera de `src/components`/`src/app`).
 */
const bg = '#050807';
const surface = '#0a100d';
const fg = '#f3f8f5';
const fgMuted = 'rgba(243, 248, 245, 0.72)';
const accent = '#01bf63';
const onAccent = '#04110a';
const hairline = 'rgba(255, 255, 255, 0.12)';

export function EmailLayout({
  preview,
  title,
  children,
  footer,
}: {
  /** Texto de vista previa (no se ve en el cuerpo, solo en la bandeja de entrada). */
  preview: string;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{title}</title>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: bg, color: fg }}>
        <div
          style={{ display: 'none', overflow: 'hidden', lineHeight: 1, maxHeight: 0, opacity: 0 }}
        >
          {preview}
        </div>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '32px 16px' }}>
                <table
                  role="presentation"
                  width="100%"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: 480, width: '100%' }}
                >
                  <tbody>
                    <tr>
                      <td style={{ paddingBottom: 24 }}>
                        <span
                          style={{
                            fontFamily: 'system-ui, sans-serif',
                            fontSize: 15,
                            fontWeight: 700,
                            color: fg,
                            letterSpacing: '-0.01em',
                          }}
                        >
                          DaeTrym
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          backgroundColor: surface,
                          border: `1px solid ${hairline}`,
                          borderRadius: 12,
                          padding: 28,
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: 15,
                          lineHeight: 1.6,
                          color: fg,
                        }}
                      >
                        {children}
                      </td>
                    </tr>
                    <tr>
                      <td
                        style={{
                          paddingTop: 20,
                          fontFamily: 'system-ui, sans-serif',
                          fontSize: 12,
                          lineHeight: 1.6,
                          color: fgMuted,
                        }}
                      >
                        {footer}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

export function EmailButton({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      style={{
        display: 'inline-block',
        marginTop: 16,
        padding: '10px 20px',
        borderRadius: 8,
        backgroundColor: accent,
        color: onAccent,
        fontWeight: 600,
        fontSize: 14,
        textDecoration: 'none',
      }}
    >
      {children}
    </a>
  );
}
