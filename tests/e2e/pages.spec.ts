import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import {
  allContentRoutes,
  comingSoonRoutes,
  isSheetLayout,
  waitForHydration,
  watchForProblems,
} from './helpers';

/** Con menos movimiento no hay revelados: todo está en su estado final y los contrastes son medibles. */
async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
}

/* ───────────── Estructura, SEO y salud de cada página (ES y EN, 3 viewports) ───────────── */

test.describe('cada página de contenido', () => {
  for (const route of allContentRoutes) {
    test.describe(route, () => {
      test('responde 200 con estructura, metadatos y sin errores', async ({ page }) => {
        const watcher = await watchForProblems(page);
        const response = await page.goto(route);
        expect(response?.status()).toBe(200);
        await waitForHydration(page);

        const locale = route.startsWith('/es') ? 'es' : 'en';
        await expect(page.locator('html')).toHaveAttribute('lang', locale);

        // Un único h1 y un único landmark principal.
        await expect(page.locator('h1')).toHaveCount(1);
        await expect(page.locator('main')).toHaveCount(1);

        // Título propio (no el genérico) y descripción.
        const title = await page.title();
        expect(title.length).toBeGreaterThan(8);
        await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{40,}/);

        // Canonical del propio idioma + hreflang de ambos + x-default.
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          'href',
          new RegExp(`/${locale}`),
        );
        const alternates = await page
          .locator('link[rel="alternate"][hreflang]')
          .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('hreflang')));
        expect(alternates).toEqual(expect.arrayContaining(['es', 'en', 'x-default']));

        // Jerarquía de encabezados sin saltos (h1 → h2 → h3, nunca h2 → h4).
        const levels = await page
          .locator('main h1, main h2, main h3, main h4')
          .evaluateAll((nodes) => nodes.map((n) => Number(n.tagName.slice(1))));
        expect(levels[0]).toBe(1);
        for (let i = 1; i < levels.length; i++) {
          expect(
            levels[i]! - levels[i - 1]!,
            `salto de encabezado en la posición ${i}`,
          ).toBeLessThanOrEqual(1);
        }

        // Sin ids duplicados (rompen aria-labelledby y los anclajes).
        const duplicates = await page.evaluate(() => {
          const seen = new Map<string, number>();
          for (const el of document.querySelectorAll('[id]'))
            seen.set(el.id, (seen.get(el.id) ?? 0) + 1);
          return [...seen].filter(([, n]) => n > 1).map(([id]) => id);
        });
        expect(duplicates).toEqual([]);

        expect(await watcher.collect()).toEqual([]);
      });

      test('no desborda horizontalmente (responsive)', async ({ page }) => {
        await page.goto(route);
        await waitForHydration(page);
        const overflow = await page.evaluate(() => ({
          scroll: document.documentElement.scrollWidth,
          client: document.documentElement.clientWidth,
        }));
        expect(overflow.scroll).toBeLessThanOrEqual(overflow.client);
      });

      test('axe: sin violaciones WCAG 2.x A/AA (modo oscuro)', async ({ page }) => {
        await settle(page);
        await page.goto(route);
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

      test('axe: sin violaciones WCAG 2.x A/AA (modo claro)', async ({
        page,
        browserName,
      }, testInfo) => {
        // El modo claro se verifica en escritorio (el CSS de color no depende del viewport).
        test.skip(testInfo.project.name !== 'desktop', 'Solo escritorio.');
        expect(browserName).toBe('chromium');
        await settle(page);
        await page.addInitScript(() => localStorage.setItem('daetrym-theme', 'light'));
        await page.goto(route);
        await waitForHydration(page);
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(
          results.violations.map(
            (v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(' | ')}`,
          ),
        ).toEqual([]);
      });
    });
  }
});

/* ───────────── Navegación: ningún enlace interno está roto ───────────── */

test('todos los enlaces internos de cada página resuelven (sin 404 ni redirecciones perdidas)', async ({
  page,
  request,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Basta con una pasada.');
  const checked = new Set<string>();
  const broken: string[] = [];

  for (const route of allContentRoutes) {
    await page.goto(route);
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
      );
    for (const href of hrefs) {
      if (!href.startsWith('/') || href.startsWith('//')) continue; // externos y mailto
      const path = href.split('#')[0] ?? '';
      if (!path || checked.has(path)) continue;
      checked.add(path);
      const status = (await request.get(path)).status();
      if (status >= 400) broken.push(`${route} → ${href} (${status})`);
    }
  }
  expect(broken).toEqual([]);
  expect(checked.size).toBeGreaterThan(20);
});

test('los enlaces con ancla apuntan a un id que existe en la página de destino', async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', 'Basta con una pasada.');
  const missing: string[] = [];
  for (const route of allContentRoutes) {
    await page.goto(route);
    const anchors = await page
      .locator('a[href*="#"]')
      .evaluateAll((nodes) =>
        nodes.map((n) => (n as HTMLAnchorElement).getAttribute('href') ?? ''),
      );
    for (const href of anchors) {
      const [path, hash] = href.split('#');
      if (!hash) continue;
      if (path) {
        const target = await page.context().newPage();
        await target.goto(path);
        if ((await target.locator(`[id="${hash}"]`).count()) === 0)
          missing.push(`${route} → ${href}`);
        await target.close();
      } else if ((await page.locator(`[id="${hash}"]`).count()) === 0) {
        missing.push(`${route} → ${href}`);
      }
    }
  }
  expect(missing).toEqual([]);
});

/* ───────────── Home ───────────── */

test.describe('Home', () => {
  test('tiene todas las secciones pedidas y los distintivos de ejemplo', async ({ page }) => {
    await page.goto('/es');
    await waitForHydration(page);
    const headings = await page.locator('main h2').allTextContents();
    expect(headings.length).toBeGreaterThanOrEqual(8); // servicios, por qué, proceso, proyectos, stack, FAQ, próximamente, CTA
    // Los 3 proyectos de ejemplo llevan el distintivo y el aviso.
    await expect(page.getByText('Ejemplo', { exact: true })).toHaveCount(3);
    await expect(page.getByRole('note').filter({ hasText: 'Casos de ejemplo' })).toBeVisible();
    // 4 servicios enlazados a su página.
    for (const name of [
      'Desarrollo de aplicaciones web',
      'Software a medida',
      'Ciberseguridad',
      'Consultoría técnica',
    ]) {
      await expect(
        page.locator('main').getByRole('link', { name, exact: true }).first(),
      ).toBeVisible();
    }
  });

  test('el CTA de propuesta y el de llamada llevan a páginas que existen', async ({ page }) => {
    await page.goto('/es');
    await waitForHydration(page);
    await page.locator('main').getByRole('link', { name: 'Solicitar propuesta' }).first().click();
    await expect(page).toHaveURL(/\/es\/solicitar-propuesta$/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('la lista de espera abre el correo con asunto precompletado', async ({ page }) => {
    await page.goto('/es');
    const href = await page
      .getByRole('link', { name: 'Avísame del lanzamiento' })
      .getAttribute('href');
    expect(href).toMatch(/^mailto:[^?]+\?subject=/);
    expect(decodeURIComponent(href ?? '')).toContain('recursos gratuitos');
  });
});

/* ───────────── FAQ (acordeón) ───────────── */

test.describe('FAQ', () => {
  test('se abre y se cierra con ratón y teclado, y solo hay una respuesta abierta', async ({
    page,
  }) => {
    await page.goto('/es');
    await waitForHydration(page);
    const questions = page.locator('#home-faq-question-0, #home-faq-question-1');
    const first = questions.nth(0);
    const second = questions.nth(1);

    await first.scrollIntoViewIfNeeded();
    await expect(first).toHaveAttribute('aria-expanded', 'false');
    // Cerrada: la respuesta no es visible ni enfocable (inert).
    await expect(page.locator('#home-faq-answer-0')).toBeHidden();

    await first.click();
    await expect(first).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#home-faq-answer-0')).toBeVisible();

    // Abrir otra cierra la anterior.
    await second.click();
    await expect(second).toHaveAttribute('aria-expanded', 'true');
    await expect(first).toHaveAttribute('aria-expanded', 'false');

    // Teclado: Enter y Espacio alternan.
    await second.focus();
    await page.keyboard.press('Enter');
    await expect(second).toHaveAttribute('aria-expanded', 'false');
    await page.keyboard.press('Space');
    await expect(second).toHaveAttribute('aria-expanded', 'true');
  });

  test('con prefers-reduced-motion la respuesta aparece sin animar la altura', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/es/servicios/web-apps');
    await waitForHydration(page);
    const question = page.locator('#faq-web-apps-question-0');
    await question.scrollIntoViewIfNeeded();
    await question.click();
    // Sin muelle: la altura final se alcanza de inmediato (no hay estado intermedio a medio abrir).
    const panel = page.locator('#faq-web-apps-answer-0');
    await expect(panel).toBeVisible();
    const heights = [];
    for (let i = 0; i < 3; i++) {
      heights.push(await panel.evaluate((el) => el.getBoundingClientRect().height));
    }
    expect(new Set(heights.map((h) => Math.round(h))).size).toBe(1);
  });
});

/* ───────────── Servicios ───────────── */

test.describe('Servicios', () => {
  test('el detalle sigue problema → solución → proceso → entregables → FAQ → CTA', async ({
    page,
  }) => {
    await page.goto('/es/servicios/cybersecurity');
    await waitForHydration(page);
    const eyebrows = await page.locator('main .text-eyebrow').allTextContents();
    const order = [
      'El problema',
      'Nuestra solución',
      'Cómo lo hacemos',
      'Qué recibes',
      'Preguntas frecuentes',
    ];
    const positions = order.map((label) =>
      eyebrows.findIndex((t) => t.trim().toLowerCase() === label.toLowerCase()),
    );
    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
    await expect(page.locator('#cta-title')).toBeVisible();
    // Migas de pan con la página actual marcada.
    await expect(
      page.getByRole('navigation', { name: 'Ruta de navegación' }).locator('[aria-current="page"]'),
    ).toBeVisible();
  });

  test('el selector de idioma conserva el servicio (misma ruta, otro idioma)', async ({ page }) => {
    test.skip(isSheetLayout(page), 'En móvil el selector vive en el menú.');
    await page.goto('/es/servicios/custom-software');
    await waitForHydration(page);
    await page.getByRole('button', { name: /english/i }).click();
    await expect(page).toHaveURL(/\/en\/services\/custom-software$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Custom software');
  });

  test('el índice enlaza a los cuatro servicios', async ({ page }) => {
    await page.goto('/en/services');
    const links = await page
      .locator('main a[href*="/en/services/"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('href')));
    expect(new Set(links)).toEqual(
      new Set([
        '/en/services/web-apps',
        '/en/services/custom-software',
        '/en/services/cybersecurity',
        '/en/services/consulting',
      ]),
    );
  });
});

/* ───────────── Ciberseguridad ───────────── */

test.describe('Ciberseguridad', () => {
  test('destaca la autorización por escrito y enlaza a la política de divulgación', async ({
    page,
  }) => {
    await page.goto('/es/ciberseguridad');
    const section = page.locator('#authorization');
    await expect(section.getByRole('heading', { level: 2 })).toHaveText(
      'Toda prueba requiere autorización por escrito',
    );
    await expect(section.getByRole('link', { name: /divulgación responsable/i })).toHaveAttribute(
      'href',
      '/es/seguridad',
    );
  });

  test('presenta OWASP, NIST y PTES', async ({ page }) => {
    await page.goto('/en/cybersecurity');
    for (const name of ['OWASP', 'NIST', 'PTES']) {
      await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    }
  });

  test('la Home enlaza a la sección de autorización', async ({ page }) => {
    await page.goto('/es');
    await page.getByRole('link', { name: 'Cómo trabajamos en seguridad' }).click();
    await expect(page).toHaveURL(/\/es\/ciberseguridad#authorization$/);
    await expect(page.locator('#authorization')).toBeInViewport();
  });
});

/* ───────────── Nosotros y proceso ───────────── */

test('Nosotros: el equipo de ejemplo está claramente marcado como placeholder', async ({
  page,
}) => {
  await page.goto('/es/nosotros');
  await expect(page.getByText('Ejemplo', { exact: true })).toHaveCount(4);
  await expect(page.getByRole('note').filter({ hasText: 'Equipo de ejemplo' })).toBeVisible();
  // El aviso de historia pendiente también es visible mientras siteConfig.draftNotices sea true.
  await expect(page.getByRole('note').filter({ hasText: 'historia real' })).toBeVisible();
});

test('Proceso: seis etapas en orden con duración orientativa y entregables', async ({ page }) => {
  await page.goto('/es/proceso');
  const titles = await page
    .locator('main ol > li h3')
    .evaluateAll((nodes) =>
      nodes.map((n) => (n.textContent ?? '').replace(/^Etapa \d+:\s*/, '').trim()),
    );
  expect(titles).toEqual([
    'Descubrimiento',
    'Diseño',
    'Desarrollo',
    'Pruebas y seguridad',
    'Entrega',
    'Soporte',
  ]);
  await expect(page.getByText(/Duración orientativa/)).toHaveCount(6);
  await expect(page.getByText('Entregables', { exact: true })).toHaveCount(6);
});

/* ───────────── Legales y política de divulgación ───────────── */

test.describe('documentos legales', () => {
  for (const route of [
    '/es/legal/privacidad',
    '/es/legal/terminos',
    '/es/legal/cookies',
    '/es/seguridad',
    '/en/legal/privacy',
    '/en/security',
  ]) {
    test(`${route}: aviso de revisión legal, fecha, índice y marcadores resaltados`, async ({
      page,
    }) => {
      await page.goto(route);
      const isEs = route.startsWith('/es');
      await expect(page.getByRole('note').first()).toContainText(
        isEs ? /pendiente|Compromisos/ : /pending|Commitments/,
      );
      await expect(page.getByText(isEs ? /Última actualización/ : /Last updated/)).toBeVisible();
      // Índice con un enlace por sección y anclas funcionales.
      const toc = page.getByRole('navigation', { name: isEs ? 'En esta página' : 'On this page' });
      const links = toc.getByRole('link');
      expect(await links.count()).toBeGreaterThanOrEqual(5);
      const first = links.first();
      const hash = (await first.getAttribute('href'))!.slice(1);
      await first.click();
      await expect(page).toHaveURL(new RegExp(`#${hash}$`));
      // Los datos pendientes se ven resaltados (mark), nunca como texto suelto.
      expect(await page.locator('main mark').count()).toBeGreaterThan(0);
    });
  }

  test('la política de privacidad sustituye correo y razón social (sin {claves} a la vista)', async ({
    page,
  }) => {
    await page.goto('/es/legal/privacidad');
    const text = await page.locator('main').innerText();
    expect(text).not.toMatch(/\{\w+\}/);
    expect(text).toContain('DAETRYM Systems');
    await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible();
  });

  test('las tablas son accesibles: caption, cabeceras de columna y lectura móvil', async ({
    page,
  }) => {
    await page.goto('/es/legal/cookies');
    const table = page.getByRole('table');
    await expect(table).toHaveCount(1);
    await expect(table.locator('caption')).toContainText('Cookies y almacenamiento');
    expect(await table.locator('th[scope="col"]').count()).toBe(4);
  });
});

/* ───────────── 404 ───────────── */

test.describe('404 personalizada', () => {
  for (const [url, lang, heading] of [
    ['/es/esto-no-existe', 'es', 'Página no encontrada'],
    ['/en/this-does-not-exist', 'en', 'Page not found'],
    ['/es/servicios/inexistente', 'es', 'Página no encontrada'],
    ['/en/services/nope', 'en', 'Page not found'],
  ] as const) {
    test(`${url}: estado 404, noindex y contenido en servidor (con y sin JavaScript)`, async ({
      browser,
    }) => {
      for (const javaScriptEnabled of [true, false]) {
        const context = await browser.newContext({ javaScriptEnabled });
        const page = await context.newPage();
        const response = await page.goto(url);
        expect(response?.status()).toBe(404);
        expect(response?.headers()['x-robots-tag']).toContain('noindex');
        await expect(page.locator('html')).toHaveAttribute('lang', lang);
        await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);
        // Sigue habiendo navegación: el visitante no queda atrapado.
        await expect(page.locator('header')).toBeVisible();
        await expect(page.locator('footer')).toBeVisible();
        await expect(page.getByRole('link', { name: /inicio|home/i }).first()).toBeVisible();
        await context.close();
      }
    });
  }

  test('pasa axe en oscuro y claro', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'Basta con escritorio.');
    for (const theme of ['dark', 'light']) {
      await page.addInitScript((value) => localStorage.setItem('daetrym-theme', value), theme);
      await page.goto('/es/no-existe');
      await waitForHydration(page);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
        .analyze();
      expect(
        results.violations.map((v) => v.id),
        theme,
      ).toEqual([]);
    }
  });
});

/* ───────────── security.txt (RFC 9116) ───────────── */

test('security.txt: campos obligatorios, Expires válido y política enlazada', async ({
  request,
}) => {
  const response = await request.get('/.well-known/security.txt');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('text/plain');
  const body = await response.text();

  expect(body).toMatch(/^Contact: mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/m);
  const expires = /^Expires: (.+)$/m.exec(body)?.[1];
  expect(expires, 'Expires es obligatorio').toBeTruthy();
  const remaining = new Date(expires!).getTime() - Date.now();
  expect(remaining).toBeGreaterThan(0);
  expect(remaining).toBeLessThan(365 * 24 * 60 * 60 * 1000);
  expect(body).toMatch(/^Preferred-Languages: es, en$/m);
  expect(body).toMatch(/^Canonical: https?:\/\/.+\/\.well-known\/security\.txt$/m);
  expect(body.match(/^Policy: /gm)).toHaveLength(2);

  // Las políticas enlazadas existen.
  for (const [, url] of body.matchAll(/^Policy: (.+)$/gm)) {
    const path = new URL(url!).pathname;
    expect((await request.get(path)).status(), path).toBe(200);
  }
});

/* ───────────── Secciones provisionales ───────────── */

test.describe('secciones que llegan en fases posteriores', () => {
  for (const route of comingSoonRoutes) {
    test(`${route} no es un 404: muestra «en construcción» con contacto y sin indexar`, async ({
      page,
    }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('main a[href^="mailto:"]').first()).toBeVisible();
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });
  }
});

/* ───────────── Movimiento y accesibilidad de la interacción ───────────── */

test.describe('movimiento', () => {
  test('el revelado al hacer scroll se desactiva con prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/es');
    const names = await page
      .locator('.reveal')
      .evaluateAll((nodes) => nodes.map((n) => getComputedStyle(n).animationName));
    expect(names.length).toBeGreaterThan(5);
    expect(new Set(names)).toEqual(new Set(['none']));
  });

  test('el hero nunca se revela con animación (es el LCP)', async ({ page }) => {
    await page.goto('/es');
    const hero = page.locator('section[aria-labelledby="page-title"]');
    expect(await hero.locator('.reveal').count()).toBe(0);
    expect(await hero.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
  });
});

test.describe('layout responsive', () => {
  test('el header muestra el menú lateral por debajo de 1024 px (móvil y tablet) y la navegación completa a partir de ahí', async ({
    page,
  }) => {
    await page.goto('/es');
    const width = page.viewportSize()!.width;
    const desktopNav = page.getByRole('navigation', { name: 'Navegación principal' }).first();
    const menuButton = page.getByRole('button', { name: 'Abrir menú' });
    if (width >= 1024) {
      await expect(desktopNav).toBeVisible();
      await expect(menuButton).toBeHidden();
    } else {
      await expect(menuButton).toBeVisible();
      await expect(desktopNav).toBeHidden();
    }
  });

  test('las rejillas de tarjetas pasan de 1 a 2 y a más columnas según el ancho', async ({
    page,
  }) => {
    await page.goto('/es/servicios');
    const tops = await page
      .locator('main article')
      .evaluateAll((nodes) =>
        nodes.map((n) => Math.round(n.getBoundingClientRect().top + window.scrollY)),
      );
    const columns = tops.filter((top) => top === tops[0]).length;
    const width = page.viewportSize()!.width;
    if (width < 640) expect(columns).toBe(1);
    else expect(columns).toBe(2);
  });
});
