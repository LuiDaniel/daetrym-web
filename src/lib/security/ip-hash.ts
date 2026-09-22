import { createHmac } from 'node:crypto';
import { headers } from 'next/headers';
import { env } from '@/env';

/**
 * IP nunca en claro (docs/ARCHITECTURE.md §3): HMAC-SHA256(ip, IP_HASH_SECRET), truncado a 16 bytes
 * (128 bits — de sobra para deduplicar/limitar sin poder revertirlo a la IP original).
 */
export function hashIp(ip: string) {
  return createHmac('sha256', env.IP_HASH_SECRET).update(ip).digest('hex').slice(0, 32);
}

/**
 * IP del cliente a partir de las cabeceras que pone el proxy de Vercel (`x-forwarded-for`, el primer
 * valor es el cliente original). Sin proxy conocido (dev), usa un valor fijo no enrutable.
 */
export async function getClientIp() {
  const headerList = await headers();
  const forwardedFor = headerList.get('x-forwarded-for');
  if (forwardedFor) {
    const [first] = forwardedFor.split(',');
    if (first?.trim()) return first.trim();
  }
  return headerList.get('x-real-ip') ?? '0.0.0.0';
}

export async function getClientIpHash() {
  return hashIp(await getClientIp());
}
