// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/i18n/navigation', () => ({
  Link: ({ href, children, ...props }: Record<string, unknown>) => (
    <a href={typeof href === 'string' ? href : '#'} {...props}>
      {children as never}
    </a>
  ),
}));

import { AccentText } from '@/components/ui/accent-text';
import { Badge } from '@/components/ui/badge';
import { Banner } from '@/components/ui/banner';
import { Field, Input } from '@/components/ui/field';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MetricCard, PostCard } from '@/components/sections/cards';

afterEach(cleanup);

describe('AccentText (acento editorial)', () => {
  it('compone la palabra entre asteriscos en la serif cursiva', () => {
    const { container } = render(<AccentText text="Software seguro, desde el *diseño*." />);
    const em = container.querySelector('em');
    expect(em?.textContent).toBe('diseño');
    expect(em?.className).toContain('font-accent');
    expect(container.textContent).toBe('Software seguro, desde el diseño.');
  });

  it('sin marcas devuelve el texto tal cual', () => {
    const { container } = render(<AccentText text="Página no encontrada" />);
    expect(container.querySelector('em')).toBeNull();
    expect(container.textContent).toBe('Página no encontrada');
  });

  it('nunca muestra asteriscos sueltos', () => {
    const { container } = render(<AccentText text="Un *título sin cerrar" />);
    expect(container.textContent).toBe('Un título sin cerrar');
    expect(container.querySelector('em')).toBeNull();
  });
});

describe('Badge y Banner (colores semánticos)', () => {
  it.each([
    ['success', 'hue-green'],
    ['info', 'hue-cyan'],
    ['low', 'hue-blue'],
    ['medium', 'hue-amber'],
    ['critical', 'hue-red'],
    ['placeholder', 'hue-amber'],
  ] as const)('la etiqueta %s usa el tono %s', (variant, hue) => {
    render(<Badge variant={variant}>estado</Badge>);
    expect(screen.getByText('estado').className).toContain(hue);
  });

  it('el banner informa sin interrumpir (note) y admite alert', () => {
    render(
      <>
        <Banner tone="warning" title="Aviso">
          cuerpo
        </Banner>
        <Banner tone="critical" role="alert">
          fallo
        </Banner>
      </>,
    );
    expect(screen.getByRole('note').textContent).toContain('Aviso');
    expect(screen.getByRole('alert').textContent).toContain('fallo');
  });
});

describe('Field / Input', () => {
  it('asocia etiqueta, ayuda y error con el control', () => {
    render(
      <Field
        id="email"
        label="Correo"
        hint="Lo usamos solo para responderte"
        error="Correo no válido"
      >
        <Input id="email" aria-invalid aria-describedby="email-hint email-error" />
      </Field>,
    );
    const input = screen.getByLabelText('Correo');
    expect(input.getAttribute('aria-describedby')).toBe('email-hint email-error');
    expect(screen.getByRole('alert').id).toBe('email-error');
    expect(document.getElementById('email-hint')?.textContent).toContain('responderte');
  });
});

describe('Tabs', () => {
  it('cambia de panel al pulsar una pestaña', () => {
    render(
      <Tabs defaultValue="a">
        <TabsList aria-label="Secciones">
          <TabsTrigger value="a">Uno</TabsTrigger>
          <TabsTrigger value="b">Dos</TabsTrigger>
        </TabsList>
        <TabsContent value="a">Panel uno</TabsContent>
        <TabsContent value="b">Panel dos</TabsContent>
      </Tabs>,
    );
    expect(screen.getByRole('tab', { name: 'Uno' }).getAttribute('aria-selected')).toBe('true');
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Dos' }));
    fireEvent.focus(screen.getByRole('tab', { name: 'Dos' }));
    expect(screen.getByRole('tabpanel').textContent).toBe('Panel dos');
  });
});

describe('Tarjetas nuevas', () => {
  it('MetricCard muestra el distintivo de ejemplo solo cuando es un dato de ejemplo', () => {
    const { rerender } = render(
      <MetricCard label="Vulnerabilidades" value="12" placeholder placeholderLabel="Ejemplo" />,
    );
    expect(screen.getByText('Ejemplo')).toBeTruthy();
    rerender(<MetricCard label="Vulnerabilidades" value="12" />);
    expect(screen.queryByText('Ejemplo')).toBeNull();
  });

  it('PostCard enlaza desde el título (enlace extendido)', () => {
    render(
      <PostCard href="/blog" title="Título" excerpt="Extracto" category="Seguridad" meta="1 min" />,
    );
    expect(screen.getByRole('link', { name: 'Título' })).toBeTruthy();
    expect(screen.getByText('Seguridad')).toBeTruthy();
  });
});
