import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Vercel handles this automatically; only needed for local dev
  ...(process.env.NODE_ENV === 'development' && {
    allowedDevOrigins: ['10.127.2.14'],
  }),
};

export default nextConfig;
