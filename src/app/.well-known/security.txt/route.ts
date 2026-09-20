import { siteConfig } from '@/config/site';
import { getPathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { buildSecurityTxt } from '@/lib/seo/security-txt';

/**
 * /.well-known/security.txt (RFC 9116). Se genera en el build: el campo Expires se calcula a partir de
 * `siteConfig.securityTxtValidityDays`, así que hay que redesplegar al menos una vez al año para que no
 * caduque (un archivo caducado indica abandono, que es justo lo que este campo pretende señalar).
 */
export const dynamic = 'force-static';

export function GET() {
  const origin = siteConfig.url.replace(/\/$/, '');
  const expires = new Date(Date.now() + siteConfig.securityTxtValidityDays * 24 * 60 * 60 * 1000);

  const body = buildSecurityTxt({
    contactEmail: siteConfig.contact.securityEmail,
    expires,
    preferredLanguages: routing.locales,
    canonical: `${origin}/.well-known/security.txt`,
    policies: routing.locales.map(
      (locale) => `${origin}${getPathname({ locale, href: '/security' })}`,
    ),
  });

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
