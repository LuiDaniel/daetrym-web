# Checklist de seguridad web

Controles esenciales que revisar antes de lanzar o auditar una aplicación web. Basada en las
categorías del OWASP Top 10 y en las prácticas del NIST Cybersecurity Framework. Es contenido de
referencia general: revísalo con tu propio criterio antes de aplicarlo a un sistema en producción —
no sustituye una auditoría de seguridad ni un pentest.

## Autenticación y control de acceso

- Las contraseñas se almacenan con un hash lento (Argon2id o bcrypt), nunca en claro ni con MD5/SHA1.
- Hay un límite de intentos de inicio de sesión (rate limiting) y bloqueo temporal tras varios fallos.
- El cierre de sesión invalida el token/cookie en el servidor, no solo en el cliente.
- Cada endpoint comprueba autorización (quién puede hacer QUÉ), no solo autenticación (quién eres).
- Los identificadores de recursos (IDs) no permiten acceder a datos de otro usuario cambiando un número
  en la URL (referencia directa a objetos insegura, IDOR).
- La recuperación de contraseña usa un token de un solo uso, con caducidad corta, y no revela si un
  email existe o no en el sistema.

## Datos y almacenamiento

- Todo el tráfico va por HTTPS, con HSTS activado y sin contenido mixto.
- Los datos sensibles (contraseñas, tokens, tarjetas) nunca aparecen en logs ni en mensajes de error.
- Las copias de seguridad están cifradas y se prueba su restauración periódicamente.
- Los datos personales se recogen con una base legal clara y se conservan solo el tiempo necesario.
- Las variables de entorno con secretos no están en el repositorio de código ni en el bundle del cliente.

## Configuración y cabeceras HTTP

- Content-Security-Policy definida (idealmente sin `unsafe-inline` en scripts).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy` y `Permissions-Policy` configuradas.
- Las cookies de sesión llevan `HttpOnly`, `Secure` y `SameSite`.
- Los mensajes de error no revelan detalles internos (rutas del servidor, versión de librerías, trazas).
- Los paneles de administración no son accesibles públicamente sin autenticación reforzada.

## Dependencias y cadena de suministro

- El proyecto tiene un proceso para revisar vulnerabilidades conocidas en dependencias (por ejemplo,
  `npm audit` o Dependabot) y actualizarlas con regularidad.
- Las dependencias se instalan con el lockfile (versiones fijadas), no con rangos abiertos sin revisar.
- Los paquetes de terceros con acceso a datos sensibles están justificados y auditados.

## Registro, monitorización y respuesta

- Los eventos de seguridad relevantes (inicios de sesión fallidos, cambios de permisos) quedan
  registrados, sin datos personales innecesarios en el log.
- Existe una forma de reportar vulnerabilidades (`/security`, `security.txt`) y alguien la revisa.
- Hay un plan mínimo de respuesta ante incidentes: a quién avisar y qué pasos seguir si algo falla.

---

¿Quieres que revisemos esto con un pentest o una auditoría de código sobre tu aplicación real?
Escríbenos desde la página de contacto de DaeTrym.
