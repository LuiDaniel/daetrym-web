import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';

/**
 * Tokens de un solo uso (confirmación/baja de newsletter, descarga de recursos): el valor crudo va
 * en el enlace del email y NUNCA se guarda; en la base solo vive su hash SHA-256
 * (docs/ARCHITECTURE.md §3). `verifyToken` compara en tiempo constante.
 */
export function generateToken() {
  return randomBytes(32).toString('base64url');
}

export function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyToken(token: string, hash: string) {
  const candidate = Buffer.from(hashToken(token), 'hex');
  const expected = Buffer.from(hash, 'hex');
  if (candidate.length !== expected.length) return false;
  return timingSafeEqual(candidate, expected);
}
