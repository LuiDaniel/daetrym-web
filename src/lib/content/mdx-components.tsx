import type { MDXComponents } from 'mdx/types';
import type { ComponentProps } from 'react';
import { AccentText } from '@/components/ui/accent-text';
import { cn } from '@/lib/cn';

const linkClass =
  'text-h-fg underline decoration-hairline-strong underline-offset-4 transition-colors hover:decoration-current';

/**
 * Mapeo de elementos Markdown/MDX a las utilidades de Glass + Primer (mismas reglas que
 * `LegalDocument`/`RichText`: `text-prose` para párrafos y listas, tono `text-h-fg` heredado de la
 * `Section` que envuelva el artículo). `pre`/`code` de bloque los pinta `src/styles/code.css`
 * (necesitan los atributos `data-*` que pone rehype-pretty-code, así que aquí solo se hace `cn`, nunca
 * se sustituye el `style` inline que trae cada token coloreado).
 */
export const mdxComponents: MDXComponents = {
  h2: ({ className, ...props }: ComponentProps<'h2'>) => (
    <h2 className={cn('group mt-12 scroll-mt-24 text-h2 first:mt-0', className)} {...props} />
  ),
  h3: ({ className, ...props }: ComponentProps<'h3'>) => (
    <h3 className={cn('group mt-8 scroll-mt-24 text-h3', className)} {...props} />
  ),
  p: ({ className, ...props }: ComponentProps<'p'>) => (
    <p className={cn('mt-4 text-prose text-fg-muted first:mt-0', className)} {...props} />
  ),
  a: ({ className, ...props }: ComponentProps<'a'>) => (
    <a className={cn(linkClass, className)} {...props} />
  ),
  ul: ({ className, ...props }: ComponentProps<'ul'>) => (
    <ul
      className={cn(
        'mt-4 list-disc space-y-2 pl-5 text-prose text-fg-muted marker:text-h-fg',
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: ComponentProps<'ol'>) => (
    <ol
      className={cn(
        'mt-4 list-decimal space-y-2 pl-5 text-prose text-fg-muted marker:text-h-fg',
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: ComponentProps<'li'>) => (
    <li className={cn('pl-1', className)} {...props} />
  ),
  blockquote: ({ className, ...props }: ComponentProps<'blockquote'>) => (
    <blockquote
      className={cn(
        'mt-4 border-l-2 border-h-line pl-4 text-prose text-fg-muted italic',
        className,
      )}
      {...props}
    />
  ),
  strong: ({ className, ...props }: ComponentProps<'strong'>) => (
    <strong className={cn('font-semibold text-fg', className)} {...props} />
  ),
  hr: () => <hr className="my-10 border-hairline" />,
  table: ({ className, ...props }: ComponentProps<'table'>) => (
    <div className="mt-4 overflow-x-auto">
      <table className={cn('w-full border-collapse text-left text-small', className)} {...props} />
    </div>
  ),
  th: ({ className, ...props }: ComponentProps<'th'>) => (
    <th
      className={cn('border-b border-hairline-strong px-3 py-2 font-semibold text-fg', className)}
      {...props}
    />
  ),
  td: ({ className, ...props }: ComponentProps<'td'>) => (
    <td className={cn('px-3 py-2.5 align-top text-fg-muted', className)} {...props} />
  ),
  // Sin envoltorio: src/styles/code.css distingue bloque ([data-rehype-pretty-code-figure] code, con
  // los `style` inline de cada token que pone Shiki) de línea (`:not(pre) > code`) por selector CSS,
  // así que aquí no hace falta tocar nada ni arriesgarse a pisar el `style` coloreado de un token.
  AccentText,
};
