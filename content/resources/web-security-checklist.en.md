# Web security checklist

Essential controls to review before launching or auditing a web application. Based on the OWASP
Top 10 categories and NIST Cybersecurity Framework practices. This is general reference content:
review it with your own judgment before applying it to a production system — it does not replace a
security audit or a penetration test.

## Authentication and access control

- Passwords are stored with a slow hash (Argon2id or bcrypt), never in plain text or with MD5/SHA1.
- There's a limit on login attempts (rate limiting) and a temporary lockout after several failures.
- Logging out invalidates the token/cookie on the server, not just on the client.
- Every endpoint checks authorization (who can do WHAT), not just authentication (who you are).
- Resource identifiers (IDs) don't let you access another user's data by changing a number in the
  URL (insecure direct object reference, IDOR).
- Password recovery uses a single-use token with a short expiry, and doesn't reveal whether an email
  exists in the system.

## Data and storage

- All traffic goes over HTTPS, with HSTS enabled and no mixed content.
- Sensitive data (passwords, tokens, cards) never appears in logs or error messages.
- Backups are encrypted and their restoration is tested periodically.
- Personal data is collected with a clear legal basis and kept only as long as necessary.
- Environment variables holding secrets aren't in the code repository or the client bundle.

## Configuration and HTTP headers

- A Content-Security-Policy is defined (ideally without `unsafe-inline` on scripts).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy`, and `Permissions-Policy` are configured.
- Session cookies carry `HttpOnly`, `Secure`, and `SameSite`.
- Error messages don't reveal internal details (server paths, library versions, stack traces).
- Admin panels aren't publicly reachable without strengthened authentication.

## Dependencies and supply chain

- The project has a process to review known vulnerabilities in dependencies (e.g. `npm audit` or
  Dependabot) and update them regularly.
- Dependencies are installed via the lockfile (pinned versions), not open ranges left unreviewed.
- Third-party packages with access to sensitive data are justified and audited.

## Logging, monitoring, and response

- Relevant security events (failed logins, permission changes) are logged, without unnecessary
  personal data in the log.
- There's a way to report vulnerabilities (`/security`, `security.txt`) and someone reviews it.
- There's a minimal incident response plan: who to notify and what steps to follow if something fails.

---

Want us to review this with a pentest or a code audit on your actual application? Reach out from
DaeTrym's contact page.
