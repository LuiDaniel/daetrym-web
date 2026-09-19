/**
 * Script inline mínimo que fija el tema ANTES del primer pintado (evita el destello).
 * Se emite con el nonce de la CSP (ver app/[locale]/layout.tsx), por lo que no requiere 'unsafe-inline'.
 */
export const THEME_STORAGE_KEY = 'daetrym-theme';

export const THEME_SCRIPT = `(function(){var d=document.documentElement,t='dark';try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');if(s==='light'||s==='dark')t=s}catch(e){}d.setAttribute('data-theme',t)})()`;
