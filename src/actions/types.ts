/**
 * Forma común de lo que devuelve cada Server Action de formulario (contact/quote/newsletter/
 * waitlist). Nunca lleva detalles internos (docs de Next § Security: "constrain return values") —
 * solo lo que la UI necesita para mostrar éxito o un error concreto y accionable.
 */
export type ActionResult =
  | { ok: true }
  | { ok: false; error: 'validation'; fieldErrors: Record<string, string[]> }
  | { ok: false; error: 'rate_limit' | 'turnstile' | 'unknown' };
