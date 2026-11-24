/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'; form-action 'self'" },
];

const nextConfig = {
  poweredByHeader: false,
  compress: true,
  async redirects() {
    // หน้าติดตามเรื่องถูกนำออกแล้ว → ลิงก์เก่าพาไปหน้าแจ้งปัญหา
    return [
      { source: '/track', destination: '/report', permanent: false },
      { source: '/track/:code*', destination: '/report', permanent: false },
    ];
  },
  async rewrites() {
    return [{ source: '/favicon.ico', destination: '/api/icon' }];
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/fonts/:path*', headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }] },
      { source: '/(admin|scmember)', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }, { key: 'Cache-Control', value: 'no-store' }] },
      { source: '/api/((?!icon|blob/).*)', headers: [{ key: 'Cache-Control', value: 'no-store' }] },
    ];
  },
};
export default nextConfig;
