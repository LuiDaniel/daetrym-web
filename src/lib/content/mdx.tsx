import { MDXRemote } from 'next-mdx-remote/rsc';
import { getTranslations } from 'next-intl/server';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug';
import remarkGfm from 'remark-gfm';
import { mdxComponents } from './mdx-components';
import { cssVariablesShikiTheme } from './shiki-theme';

/**
 * Compila y renderiza el cuerpo Markdown/MDX de un post o un caso (Fase 3): tablas y listas de tareas
 * (`remark-gfm`), id en cada h2/h3 (`rehype-slug`, en el mismo orden que `extractHeadings` — así el
 * enlace de la tabla de contenidos apunta al título real), un enlace ancla tras cada título
 * (`rehype-autolink-headings`) y bloques de código resaltados con la paleta del sitio
 * (`rehype-pretty-code` + el tema de `shiki-theme.ts`). Server Component: la compilación ocurre en el
 * servidor, no se manda MDX sin compilar al cliente ni hace falta relajar la CSP.
 *
 * Se comparte entre el blog y los proyectos, por eso la etiqueta del enlace ancla vive en
 * `common.content` (genérica) y no en `blog.detail`.
 */
export async function Mdx({ source }: { source: string }) {
  const t = await getTranslations('common.content');

  return (
    <MDXRemote
      source={source}
      components={mdxComponents}
      options={{
        mdxOptions: {
          remarkPlugins: [remarkGfm],
          rehypePlugins: [
            rehypeSlug,
            [
              rehypeAutolinkHeadings,
              {
                behavior: 'append',
                properties: { className: ['heading-anchor'], ariaLabel: t('headingAnchor') },
                content: { type: 'text', value: ' #' },
              },
            ],
            [rehypePrettyCode, { theme: cssVariablesShikiTheme, keepBackground: false }],
          ],
        },
      }}
    />
  );
}
