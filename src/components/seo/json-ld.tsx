import { headers } from 'next/headers';

/**
 * `<script type="application/ld+json">` con el nonce de la CSP de esta petición (igual que el script
 * de tema en layout.tsx) — sin nonce, la CSP estricta sin `unsafe-inline` (D1) lo bloquearía. Acepta
 * uno o varios objetos (varias entidades JSON-LD en una página: p. ej. Service + BreadcrumbList).
 */
export async function JsonLd({ data }: { data: object | object[] }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  const items = Array.isArray(data) ? data : [data];

  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </>
  );
}
