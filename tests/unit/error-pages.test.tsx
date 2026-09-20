// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import type { ComponentProps } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

// Fuera de Next no hay router: el Link localizado se sustituye por un <a> simple.
vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: ComponentProps<'a'> & { href: string }) => (
    <a href={typeof href === 'string' ? href : '#'} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('@/styles/globals.css', () => ({}));

import ErrorPage from '@/app/[locale]/error';
import GlobalError from '@/app/global-error';
import en from '@/messages/en/index';
import es from '@/messages/es/index';

const SECRET = 'postgres://user:hunter2@internal-db:5432/prod';

function renderPage(locale: 'es' | 'en', props: { digest?: string; reset?: () => void }) {
  const messages = locale === 'es' ? es : en;
  const error = Object.assign(new Error(SECRET), props.digest ? { digest: props.digest } : {});
  return render(
    <NextIntlClientProvider locale={locale} messages={{ errors: messages.errors }}>
      <ErrorPage error={error} reset={props.reset ?? (() => {})} />
    </NextIntlClientProvider>,
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('error.tsx (500 localizada)', () => {
  it.each([
    ['es', 'Algo ha salido mal', 'Reintentar'],
    ['en', 'Something went wrong', 'Try again'],
  ] as const)('muestra el mensaje y el botón en %s', (locale, title, retry) => {
    renderPage(locale, {});
    expect(screen.getByRole('heading', { level: 1, name: title })).toBeTruthy();
    expect(screen.getByRole('button', { name: retry })).toBeTruthy();
  });

  it('el botón de reintento llama a reset()', () => {
    const reset = vi.fn();
    renderPage('es', { reset });
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('muestra solo el digest como referencia, nunca el mensaje interno del error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = renderPage('en', { digest: 'abc123' });
    expect(container.textContent).toContain('Error reference: abc123');
    expect(container.textContent).not.toContain('hunter2');
    expect(container.textContent).not.toContain('postgres://');
  });

  it('registra únicamente el digest (sin el mensaje ni la pila del error)', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderPage('es', { digest: 'abc123' });
    expect(spy).toHaveBeenCalledWith('Error de página', 'abc123');
    expect(JSON.stringify(spy.mock.calls)).not.toContain('hunter2');
  });

  it('sin digest no muestra la línea de referencia', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { container } = renderPage('es', {});
    expect(container.textContent).not.toContain('Referencia del error');
  });
});

describe('global-error.tsx (último recurso, bilingüe)', () => {
  it('muestra español e inglés a la vez, cada bloque con su atributo lang', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {}); // <html> dentro de un <div> en el test
    const { container } = render(
      <GlobalError error={Object.assign(new Error(SECRET), { digest: 'zzz9' })} reset={() => {}} />,
    );
    const blocks = [...container.querySelectorAll('section[lang]')].map((s) =>
      s.getAttribute('lang'),
    );
    expect(blocks).toEqual(['es', 'en']);
    expect(container.textContent).toContain('Algo ha salido mal');
    expect(container.textContent).toContain('Something went wrong');
    expect(container.textContent).toContain('Referencia del error: zzz9');
    expect(container.textContent).toContain('Error reference: zzz9');
    expect(container.textContent).not.toContain('hunter2');
  });

  it('el botón recarga con reset()', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const reset = vi.fn();
    render(<GlobalError error={new Error(SECRET)} reset={reset} />);
    fireEvent.click(screen.getByRole('button'));
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
