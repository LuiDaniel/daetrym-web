// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
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
import { ComingSoon } from '@/components/sections/coming-soon';
import { Section, SectionHeader } from '@/components/sections/section';
import { SectionGlow } from '@/components/sections/section-glow';
import es from '@/messages/es/index';

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

describe('SectionGlow (resplandor por sección, Paso 2)', () => {
  it('pinta los dos tonos pedidos, cada uno a --glow-alpha, y nada más', () => {
    const { container } = render(<SectionGlow hues={['cyan', 'magenta']} />);
    const bg = (container.firstElementChild as HTMLElement).style.background;
    expect(bg).toContain('var(--c-cyan)');
    expect(bg).toContain('var(--c-magenta)');
    expect(bg).toContain('var(--glow-alpha)');
    // Solo esos dos tonos: ningún otro nombre de la paleta se cuela.
    for (const other of ['green', 'blue', 'violet', 'amber', 'red']) {
      expect(bg).not.toContain(`--c-${other})`);
    }
  });

  it('es puramente decorativo: aria-hidden y sin interceptar el puntero', () => {
    const { container } = render(<SectionGlow hues={['green', 'blue']} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.getAttribute('aria-hidden')).toBe('true');
    expect(el.className).toContain('pointer-events-none');
  });
});

describe('Section / SectionHeader (tono y resplandor por sección, Paso 2)', () => {
  it('sin hue ni glow: no añade clase .hue-* ni resplandor', () => {
    const { container } = render(
      <Section labelledBy="t">
        <SectionHeader id="t" title="Título" />
      </Section>,
    );
    const section = container.querySelector('section')!;
    expect(section.className).not.toMatch(/hue-\w+/);
    expect(section.querySelectorAll('[aria-hidden="true"]').length).toBe(0);
  });

  it('con hue: la sección lleva la clase .hue-<tono> (se hereda a los hijos)', () => {
    const { container } = render(
      <Section labelledBy="t" hue="violet">
        <SectionHeader id="t" title="Título" />
      </Section>,
    );
    expect(container.querySelector('section')!.className).toContain('hue-violet');
  });

  it('con glow: renderiza el SectionGlow con los dos tonos pedidos', () => {
    const { container } = render(
      <Section labelledBy="t" hue="amber" glow={['amber', 'red']}>
        <SectionHeader id="t" title="Título" />
      </Section>,
    );
    const glow = container.querySelector('section > [aria-hidden="true"]') as HTMLElement;
    expect(glow.style.background).toContain('var(--c-amber)');
    expect(glow.style.background).toContain('var(--c-red)');
  });
});

describe('ComingSoon (Paso 2: preparado para blog/proyectos)', () => {
  function renderComingSoon(props: Parameters<typeof ComingSoon>[0]) {
    return render(
      <NextIntlClientProvider
        locale="es"
        messages={{ comingSoon: es.comingSoon, common: es.common }}
      >
        <ComingSoon {...props} />
      </NextIntlClientProvider>,
    );
  }

  it('sin hue: usa el verde de marca por defecto', () => {
    const { container } = renderComingSoon({ title: 'Blog' });
    expect(container.querySelector('section')!.className).toContain('hue-green');
  });

  it('con hue y glow (el que tendrán blog/proyectos en la Fase 3): los aplica', () => {
    const { container } = renderComingSoon({
      title: 'Blog',
      hue: 'cyan',
      glow: ['cyan', 'magenta'],
    });
    const section = container.querySelector('section')!;
    expect(section.className).toContain('hue-cyan');
    const glow = section.querySelector('[aria-hidden="true"]') as HTMLElement;
    expect(glow.style.background).toContain('var(--c-cyan)');
    expect(glow.style.background).toContain('var(--c-magenta)');
  });
});
