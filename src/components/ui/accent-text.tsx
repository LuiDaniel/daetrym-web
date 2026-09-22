import { Fragment } from 'react';

/**
 * Acento editorial de los títulos: la palabra entre asteriscos (`Software seguro, desde el *diseño*.`)
 * se compone en la serif cursiva (`font-accent`). Solo una palabra destacada por título. Si el texto no
 * lleva marcas, se devuelve tal cual. Las marcas sin pareja se ignoran (nunca se muestran asteriscos).
 */
export function AccentText({ text }: { text: string }) {
  const parts = text.split('*');
  if (parts.length < 3 || parts.length % 2 === 0) return <>{parts.join('')}</>;

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <em key={index} className="pr-[0.04em] font-accent">
            {part}
          </em>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
