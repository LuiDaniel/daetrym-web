import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/env'; // valida las variables de entorno al arrancar y al compilar
import { securityHeaders } from './src/lib/security/headers';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const isDev = process.env.NODE_ENV !== 'production';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    // La CSP (con nonce por petición) la añade src/proxy.ts; aquí, las cabeceras estáticas.
    return [{ source: '/:path*', headers: securityHeaders({ isDev }) }];
  },
};

export default withNextIntl(nextConfig);
