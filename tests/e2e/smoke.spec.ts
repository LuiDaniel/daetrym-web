import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

/** Espera a que React haya hidratado (React marca los nodos con __reactFiber$...). */
async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const main = document.querySelector('main');
    return !!main && Object.keys(main).some((key) => key.startsWith('__reactFiber'));
  });
}

/** Registra violaciones de CSP y errores de consola: el sitio debe cargar SIN ninguna. */
async function watchForProblems(page: Page) {
  const problems: string[] = [];
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => {
      (window as unknown as { __csp: string[] }).__csp ??= [];
      (window as unknown as { __csp: string[] }).__csp.push(
        `${event.violatedDirective} → ${event.blockedURI || 'inline'} (${event.sample ?? ''})`,
      );
    });
  });
  page.on('console', (message) => {
    // Los enlaces del header hacen prefetch de páginas que llegan en la Fase 2 (404 esperado).
    if (message.type() === 'error' && !/status of 404/.test(message.text())) {
      problems.push(`console: ${message.text()}`);
    }
  });
  page.on('pageerror', (error) => problems.push(`pageerror: ${error.message}`));
  return {
    async collect() {
      const csp = await page.evaluate(
        () => (window as unknown as { __csp?: string[] }).__csp ?? [],
      );
      return [...problems, ...csp.map((v) => `csp: ${v}`)];
    },
  };
}

test.describe('carga y seguridad', () => {
  test('la Home carga sin violaciones de CSP ni errores', async ({ page }) => {
    const watcher = await watchForProblems(page);
    const response = await page.goto('/es');
    expect(response?.status()).toBe(200);

    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await waitForHydration(page);

    expect(await watcher.collect()).toEqual([]);
  });

  test('envía las cabeceras de seguridad', async ({ request }) => {
    const response = await request.get('/es');
    const headers = response.headers();
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['content-security-policy']).not.toMatch(/script-src[^;]*'unsafe-inline'/);
    expect(headers['strict-transport-security']).toContain('preload');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['cross-origin-opener-policy']).toBe('same-origin');
    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('la CSP usa un nonce distinto en cada petición y los scripts lo llevan', async ({
    request,
  }) => {
    const nonceOf = async () => {
      const response = await request.get('/es');
      const csp = response.headers()['content-security-policy'] ?? '';
      const nonce = /'nonce-([^']+)'/.exec(csp)?.[1];
      expect(nonce, 'la CSP debe incluir un nonce').toBeTruthy();
      const html = await response.text();
      // Todo <script> con contenido inline o src debe llevar el nonce de ESTA respuesta.
      const scripts = [...html.matchAll(/<script\b[^>]*>/g)].map((m) => m[0]);
      expect(scripts.length).toBeGreaterThan(0);
      for (const tag of scripts) {
        expect(tag, `script sin nonce: ${tag}`).toContain(`nonce="${nonce}"`);
      }
      return nonce;
    };

    const [first, second] = [await nonceOf(), await nonceOf()];
    expect(first).not.toBe(second);
  });
});

test.describe('idioma', () => {
  test('la raíz redirige según Accept-Language', async ({ browser }) => {
    const context = await browser.newContext({
      locale: 'en-US',
      extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
    });
    const page = await context.newPage();
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
    await context.close();
  });

  test('el selector cambia de idioma y lo recuerda', async ({ page, isMobile }) => {
    test.skip(isMobile, 'En móvil el selector vive dentro del menú (ver test del menú).');
    await page.goto('/es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await page.getByRole('button', { name: /english/i }).click();
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Secure software');

    // Persistencia: la raíz respeta la elección manual (cookie NEXT_LOCALE)
    await page.goto('/');
    await expect(page).toHaveURL(/\/en$/);
  });

  test('cada página declara hreflang y canonical', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/es$/);
    const alternates = await page
      .locator('link[rel="alternate"][hreflang]')
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('hreflang')));
    expect(alternates).toEqual(expect.arrayContaining(['es', 'en', 'x-default']));
  });
});

test.describe('tema', () => {
  test('es oscuro por defecto y el modo claro persiste sin destello', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'En móvil el toggle vive dentro del menú.');
    await page.goto('/es');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: /modo claro/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    // Tras recargar, el script inline fija el tema ANTES de hidratar (sin destello oscuro).
    await page.reload({ waitUntil: 'commit' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  });
});

test.describe('menú móvil (sheet)', () => {
  test('se abre, atrapa el foco y se cierra con Esc devolviendo el foco', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Solo viewport móvil.');
    await page.goto('/es');
    await waitForHydration(page);
    const trigger = page.getByRole('button', { name: 'Abrir menú' });
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Menú' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Servicios' })).toBeVisible();
    // Selector de idioma y tema accesibles desde el sheet
    await expect(dialog.getByRole('button', { name: /english/i })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('al abrir, el panel termina dentro del viewport y el botón de cierre es alcanzable', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Solo viewport móvil.');
    await page.goto('/es');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Abrir menú' }).click();

    const dialog = page.getByRole('dialog', { name: 'Menú' });
    const viewport = page.viewportSize()!;
    // Cuando el spring asienta, el panel (88 % del ancho) empieza a la izquierda del 20 % del viewport.
    // Regresión: antes se quedaba en x ≈ 9999 porque Radix Portal monta tras el primer commit.
    await expect
      .poll(async () => (await dialog.boundingBox())?.x ?? Infinity, { timeout: 3000 })
      .toBeLessThan(viewport.width * 0.2);
    await expect(page.getByRole('button', { name: 'Cerrar menú' })).toBeInViewport();
  });

  /** Arrastra dentro de la zona vacía del panel (abajo), lejos de enlaces y botones. */
  async function dragSheet(
    page: Page,
    { dx, steps, pauseBeforeRelease }: { dx: number; steps: number; pauseBeforeRelease: number },
  ) {
    const box = (await page.getByRole('dialog', { name: 'Menú' }).boundingBox())!;
    const startX = box.x + 60;
    const y = page.viewportSize()!.height - 60;
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(startX + dx, y, { steps });
    if (pauseBeforeRelease) await page.waitForTimeout(pauseBeforeRelease);
    await page.mouse.up();
  }

  test('un lanzamiento hacia la derecha lo cierra (proyección de momentum)', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Solo viewport móvil.');
    await page.goto('/es');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await expect(page.getByRole('dialog', { name: 'Menú' })).toBeInViewport();
    await page.waitForTimeout(600); // deja asentar la entrada

    // 70 px muy rápidos: menos de la mitad del ancho, pero con velocidad suficiente para proyectarse fuera.
    await dragSheet(page, { dx: 70, steps: 3, pauseBeforeRelease: 0 });
    await expect(page.getByRole('dialog')).toBeHidden();
  });

  test('un arrastre corto y quieto vuelve a abrir (sin velocidad no hay lanzamiento)', async ({
    page,
    isMobile,
  }) => {
    test.skip(!isMobile, 'Solo viewport móvil.');
    await page.goto('/es');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await expect(page.getByRole('dialog', { name: 'Menú' })).toBeInViewport();
    await page.waitForTimeout(600);

    await dragSheet(page, { dx: 70, steps: 12, pauseBeforeRelease: 250 });
    await page.waitForTimeout(700); // deja asentar el spring de vuelta
    const dialog = page.getByRole('dialog', { name: 'Menú' });
    await expect(dialog).toBeVisible();
    await expect
      .poll(async () => Math.round((await dialog.boundingBox())!.x))
      .toBeLessThan(page.viewportSize()!.width * 0.2);
  });

  test('se cierra con el botón de cierre', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Solo viewport móvil.');
    await page.goto('/es');
    await page.getByRole('button', { name: 'Abrir menú' }).click();
    await page.getByRole('button', { name: 'Cerrar menú' }).click();
    await expect(page.getByRole('dialog')).toBeHidden();
  });
});

test.describe('accesibilidad', () => {
  test('skip-link es el primer elemento enfocable y lleva al contenido', async ({ page }) => {
    await page.goto('/es');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Saltar al contenido' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main$/);
  });

  for (const theme of ['dark', 'light'] as const) {
    test(`axe: sin violaciones WCAG A/AA en la Home (${theme})`, async ({ page }) => {
      await page.addInitScript((value) => localStorage.setItem('daetrym-theme', value), theme);
      await page.goto('/es');
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await waitForHydration(page);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map(
          (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
        ),
      ).toEqual([]);
    });
  }
});
