import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';
import { DraftNotice } from '@/components/ui/draft-notice';
import { Eyebrow } from '@/components/ui/eyebrow';
import { RichText } from '@/components/ui/rich-text';
import { hueClass, type Hue } from '@/config/hues';
import { cn } from '@/lib/cn';
import type { DocumentSection } from '@/schemas/page-content';

type Block = DocumentSection['blocks'][number];

type LegalDocumentProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  sections: DocumentSection[];
  /** Valores para los marcadores `{clave}` de los textos (correo, razón social…). */
  values: Record<string, string>;
  /** Fecha ya formateada de la última revisión. */
  updated?: string;
  /** Aviso de borrador (se oculta cuando siteConfig.draftNotices es false). */
  draft?: { title: string; body: string };
  /** Contenido extra tras el aviso, p. ej. un enlace a otra página. */
  children?: ReactNode;
  /**
   * Tono del documento (sobretítulo, marcadores de lista, índice activo). Restringido a esto: sin
   * `SectionGlow` — es texto largo para leer, prioriza la legibilidad sobre la decoración.
   */
  hue?: Hue;
};

function BlockView({ block, values }: { block: Block; values: Record<string, string> }) {
  switch (block.type) {
    case 'p':
      return (
        <p className="mt-4 text-prose text-fg-muted first:mt-0">
          <RichText text={block.text} values={values} />
        </p>
      );
    case 'ul':
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-prose text-fg-muted marker:text-h-fg first:mt-0">
          {block.items.map((item, itemIndex) => (
            <li key={`${itemIndex}:${item}`} className="pl-1">
              <RichText text={item} values={values} />
            </li>
          ))}
        </ul>
      );
    case 'table':
      // Los roles ARIA explícitos mantienen la semántica de tabla aunque el CSS cambie el display (en móvil
      // cada fila pasa a ser un bloque; sin ellos Safari/VoiceOver dejaría de anunciarla como tabla).
      // En móvil cada fila se convierte en una tarjeta con la cabecera como etiqueta de cada dato
      // (sin scroll horizontal); en pantallas anchas es una tabla normal.
      return (
        <table role="table" className="mt-4 w-full border-collapse text-left text-small first:mt-0">
          <caption className="mb-3 text-left text-label text-fg-subtle">{block.caption}</caption>
          <thead role="rowgroup" className="max-md:sr-only">
            <tr role="row">
              {block.headers.map((header, headerIndex) => (
                <th
                  key={`${headerIndex}:${header}`}
                  scope="col"
                  role="columnheader"
                  className="border-b border-hairline-strong px-3 py-2 font-semibold text-fg"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody role="rowgroup">
            {block.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                role="row"
                className="border-b border-hairline max-md:mb-3 max-md:block max-md:rounded-md max-md:border max-md:p-3"
              >
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    role="cell"
                    data-label={block.headers[cellIndex]}
                    className="px-3 py-2.5 align-top text-fg-muted max-md:block max-md:px-0 max-md:py-1 max-md:before:mb-0.5 max-md:before:block max-md:before:text-label max-md:before:text-fg-subtle max-md:before:content-[attr(data-label)]"
                  >
                    <RichText text={cell} values={values} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
  }
}

/**
 * Documento largo (privacidad, términos, cookies, política de divulgación): cabecera, aviso de borrador,
 * índice lateral fijo en escritorio y secciones con ancla. Sin animaciones: es texto para leer.
 */
export function LegalDocument({
  eyebrow,
  title,
  intro,
  sections,
  values,
  updated,
  draft,
  children,
  hue,
}: LegalDocumentProps) {
  const t = useTranslations('common');

  return (
    <div className={cn('container-page page-top pb-24', hue && hueClass[hue])}>
      <header className="max-w-3xl">
        {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
        <h1 id="page-title" className={eyebrow ? 'mt-3 text-h1' : 'text-h1'}>
          {title}
        </h1>
        <p className="mt-5 text-lead text-fg-muted">{intro}</p>
        {updated && (
          <p className="mt-4 text-small text-fg-subtle">{t('lastUpdated', { date: updated })}</p>
        )}
      </header>

      {draft && (
        <DraftNotice title={draft.title} className="mt-8 max-w-3xl">
          {draft.body}
        </DraftNotice>
      )}
      {children}

      <div className="mt-12 grid gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-16">
        <nav aria-label={t('onThisPage')} className="lg:sticky lg:top-24 lg:self-start">
          <p className="text-eyebrow text-fg-subtle">{t('onThisPage')}</p>
          <ol className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2 lg:grid-cols-1 lg:border-l lg:border-hairline">
            {sections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="block rounded-sm py-1.5 text-small text-fg-muted transition-colors hover:text-h-fg lg:pl-4"
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <div className="max-w-3xl space-y-14">
          {sections.map((section) => (
            <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`}>
              <h2 id={`${section.id}-title`} className="mb-4 text-h3">
                {section.title}
              </h2>
              {section.blocks.map((block, index) => (
                <BlockView key={index} block={block} values={values} />
              ))}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
