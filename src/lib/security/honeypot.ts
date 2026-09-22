/**
 * Campo trampa: invisible para una persona, casi siempre relleno por un bot que autocompleta todo el
 * formulario. Un nombre creíble (`website`) en vez de algo obviamente falso como `honeypot`. Ver
 * `HoneypotField` (components/forms/honeypot-field.tsx) para el marcado accesible.
 */
export const HONEYPOT_FIELD = 'website';

export function isHoneypotFilled(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}
