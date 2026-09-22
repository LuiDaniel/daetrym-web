import { Link } from '@/i18n/navigation';
import { routing, type AppPathname } from '@/i18n/routing';
import { fillTokens, parseInline } from '@/lib/inline-markup';

type StaticPathname = Exclude<AppPathname, `${string}[${string}`>;

const linkClass =
  'text-h-fg underline decoration-hairline-strong underline-offset-4 transition-colors hover:decoration-current';

function isAppPathname(href: string): href is StaticPathname {
  return href in routing.pathnames && !href.includes('[');
}

/**
 * Renderiza un texto con el marcado en línea de `lib/inline-markup` (enlaces y marcadores de dato
 * pendiente). Los enlaces a rutas de la app usan el `Link` localizado; el resto (mailto, archivos
 * como /.well-known/security.txt) son enlaces normales.
 */
export function RichText({ text, values = {} }: { text: string; values?: Record<string, string> }) {
  const tokens = parseInline(fillTokens(text, values));

  return (
    <>
      {tokens.map((token, index) => {
        if (token.type === 'text') return token.text;
        if (token.type === 'placeholder') {
          return (
            <mark key={index} className="rounded bg-warning-bg px-1 text-warning">
              {token.text}
            </mark>
          );
        }
        return isAppPathname(token.href) ? (
          <Link key={index} href={token.href} className={linkClass}>
            {token.text}
          </Link>
        ) : (
          <a key={index} href={token.href} className={linkClass}>
            {token.text}
          </a>
        );
      })}
    </>
  );
}
