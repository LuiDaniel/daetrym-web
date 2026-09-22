import { expect, test, type Page } from '@playwright/test';
import { waitForHydration } from './helpers';

/**
 * Formularios de la Fase 4, de extremo a extremo contra un servidor real (`next start`): Turnstile
 * usa la clave de pruebas de Cloudflare (siempre aprueba, ver env.ts) y la base es Postgres embebido
 * en memoria (`@electric-sql/pglite`, ver src/db/index.ts) — cada envío inserta una fila de verdad.
 * Los emails van en modo log (sin `RESEND_API_KEY`), así que aquí solo se comprueba la UI: el envío
 * en sí (Server Action → Zod → Drizzle) lo prueba también tests/unit/db.test.ts contra el mismo motor.
 */

/**
 * El widget de Turnstile carga su script desde Cloudflare y se autorresuelve (clave de pruebas):
 * la petición completa (script + iframe del reto) tarda unos segundos de red real, así que se
 * espera un tiempo generoso en vez de buscar un selector concreto del iframe (anidado y sin un id
 * estable entre versiones del widget).
 */
async function waitForTurnstile(page: Page) {
  await page.waitForTimeout(5000);
}

test.describe('formulario de contacto', () => {
  test('se envía con datos válidos y muestra confirmación', async ({ page }) => {
    await page.goto('/es/contacto');
    await waitForHydration(page);

    await page.getByLabel('Nombre').fill('Ada Lovelace');
    await page.getByLabel('Email', { exact: true }).fill(`contact-${Date.now()}@example.com`);
    await page.getByLabel('Asunto').fill('Consulta de prueba e2e');
    await page
      .getByLabel('Mensaje')
      .fill('Este es un mensaje de prueba con más de diez caracteres.');
    await page.getByRole('checkbox').click();
    await waitForTurnstile(page);
    await page.getByRole('button', { name: 'Enviar' }).click();

    await expect(page.getByText('Enviado', { exact: true })).toBeVisible({ timeout: 15000 });
  });

  test('muestra errores de validación con campos vacíos', async ({ page }) => {
    await page.goto('/es/contacto');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Enviar' }).click();
    await expect(page.getByRole('alert').first()).toBeVisible();
  });
});

test.describe('asistente de propuesta', () => {
  test('recorre los cuatro pasos y se envía', async ({ page }) => {
    await page.goto('/es/solicitar-propuesta');
    await waitForHydration(page);

    // Paso 1: tipo de proyecto (radio) + servicios (casillas) — no comparten rol, aunque el texto
    // de algunas opciones coincida entre ambos grupos.
    await page.getByRole('radio', { name: 'Aplicación web' }).click();
    await page.getByRole('checkbox', { name: 'Ciberseguridad' }).click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Paso 2: presupuesto y plazo.
    await expect(page.getByText('Presupuesto y plazos')).toBeVisible();
    await page.getByRole('radio', { name: '5.000–15.000 USD' }).click();
    await page.getByRole('radio', { name: 'Lo antes posible' }).click();
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Paso 3: descripción.
    await expect(page.getByText('Cuéntanos más')).toBeVisible();
    await page
      .getByRole('textbox', { name: 'Cuéntanos sobre tu proyecto' })
      .fill('Necesitamos una aplicación web nueva con panel de administración.');
    await page.getByRole('button', { name: 'Siguiente' }).click();

    // Paso 4: datos de contacto + envío.
    await expect(page.getByText('Tus datos')).toBeVisible();
    await page.getByLabel('Nombre').fill('Grace Hopper');
    await page.getByLabel('Email', { exact: true }).fill(`quote-${Date.now()}@example.com`);
    await page.getByRole('checkbox', { name: /política de privacidad/ }).click();
    await waitForTurnstile(page);
    await page.getByRole('button', { name: 'Enviar' }).click();

    await expect(page.getByRole('status').first()).toBeVisible({ timeout: 15000 });
  });

  test('no deja avanzar del paso 1 sin elegir un tipo de proyecto', async ({ page }) => {
    await page.goto('/es/solicitar-propuesta');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(page.getByText('Tipo de proyecto', { exact: true })).toBeVisible();
    await expect(page.getByText('Presupuesto y plazos')).not.toBeVisible();
  });
});

test.describe('recursos (checklist)', () => {
  test('pide confirmación por email tras enviar el formulario', async ({ page }) => {
    await page.goto('/es/recursos');
    await waitForHydration(page);

    await page.getByLabel('Email', { exact: true }).fill(`checklist-${Date.now()}@example.com`);
    await page.getByRole('checkbox').click();
    await waitForTurnstile(page);
    await page.getByRole('button', { name: 'Enviarme la checklist' }).click();

    await expect(page.getByText('Revisa tu email')).toBeVisible({ timeout: 15000 });
  });
});

test.describe('confirmación y baja de newsletter', () => {
  test('sin token: la página de confirmación muestra enlace no válido', async ({ page }) => {
    await page.goto('/es/newsletter/confirm');
    await expect(page.getByText('Enlace no válido')).toBeVisible();
  });

  test('sin token: la página de baja muestra enlace no válido', async ({ page }) => {
    await page.goto('/es/newsletter/unsubscribe');
    await expect(page.getByText('Enlace no válido')).toBeVisible();
  });
});

test.describe('recursos de la Fase 4 en el resto del sitio', () => {
  test('la descarga de la checklist rechaza un token inválido', async ({ request }) => {
    const response = await request.get('/api/resources/download?token=invalido');
    expect(response.status()).toBe(403);
  });

  test('el cron de retención exige el secreto', async ({ request }) => {
    const response = await request.get('/api/cron/retention');
    expect(response.status()).toBe(401);
  });
});
