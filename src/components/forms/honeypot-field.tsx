import type { FieldValues, UseFormRegister } from 'react-hook-form';
import { HONEYPOT_FIELD } from '@/lib/security/honeypot';

/**
 * Campo trampa (ver lib/security/honeypot.ts): fuera de la pantalla en vez de `display:none`/
 * `visibility:hidden` (algunos bots ya ignoran esos), pero `aria-hidden` + `tabIndex={-1}` +
 * `autoComplete="off"` para que una persona con lector de pantalla o tabulando nunca lo encuentre.
 * Los cuatro esquemas de src/schemas/forms.ts incluyen `website`, así que `register('website')`
 * tipa bien para cualquiera de los cuatro formularios.
 */
export function HoneypotField<TFieldValues extends FieldValues & { website?: string }>({
  register,
}: {
  register: UseFormRegister<TFieldValues>;
}) {
  return (
    <div className="absolute top-auto left-[-9999px] size-px overflow-hidden" aria-hidden="true">
      <label htmlFor={HONEYPOT_FIELD}>{'Website'}</label>
      <input
        id={HONEYPOT_FIELD}
        type="text"
        tabIndex={-1}
        autoComplete="off"
        {...register('website' as never)}
      />
    </div>
  );
}
