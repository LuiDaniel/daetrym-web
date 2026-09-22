import { siteConfig } from '@/config/site';
import { socialLinks } from '@/config/social';

/**
 * JSON-LD (schema.org), Fase 5. Funciones puras que devuelven objetos planos — se sirven con el
 * componente `<JsonLd>` (components/seo/json-ld.tsx), que añade el `<script type="application/ld+json">`
 * con el nonce de la CSP de esta petición.
 */

const origin = () => siteConfig.url.replace(/\/$/, '');

/**
 * Perfiles reales únicamente: `src/config/social.ts` está marcado PLACEHOLDER con las raíces de
 * github.com/linkedin.com (sin perfil concreto) hasta que el usuario las sustituya. Declarar esas
 * URLs como `sameAs` sería una afirmación de identidad falsa — se excluyen filtrando por que la URL
 * tenga más que la raíz del dominio, así que esto se corrige solo en cuanto haya enlaces reales.
 */
function realSocialLinks(): string[] {
  return socialLinks
    .filter((link) => {
      try {
        return new URL(link.href).pathname.replace(/\/$/, '').length > 0;
      } catch {
        return false;
      }
    })
    .map((link) => link.href);
}

export function organizationJsonLd() {
  const sameAs = realSocialLinks();
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteConfig.legalName,
    alternateName: siteConfig.name,
    url: origin(),
    logo: `${origin()}/icons/icon-512.png`,
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function websiteJsonLd(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteConfig.name,
    url: origin(),
    inLanguage: locale,
  };
}

export function serviceJsonLd({
  name,
  description,
  url,
  areaServed,
}: {
  name: string;
  description: string;
  url: string;
  /** Código de país ISO 3166-1 alpha-2, si se conoce el mercado; se omite si no. */
  areaServed?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: name,
    name,
    description,
    url,
    provider: { '@type': 'Organization', name: siteConfig.legalName, url: origin() },
    ...(areaServed ? { areaServed } : {}),
  };
}

export function blogPostingJsonLd({
  title,
  description,
  url,
  datePublished,
  imageUrl,
}: {
  title: string;
  description: string;
  url: string;
  /** Fecha ISO (AAAA-MM-DD, como el frontmatter). */
  datePublished: string;
  imageUrl?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    description,
    url,
    datePublished,
    author: { '@type': 'Organization', name: siteConfig.legalName, url: origin() },
    publisher: {
      '@type': 'Organization',
      name: siteConfig.legalName,
      logo: { '@type': 'ImageObject', url: `${origin()}/icons/icon-512.png` },
    },
    ...(imageUrl ? { image: imageUrl } : {}),
  };
}

export function breadcrumbListJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqPageJsonLd(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}
