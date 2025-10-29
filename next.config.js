/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para API routes
  async rewrites() {
    return [
      {
        source: '/api/users/:path*',
        destination: 'http://localhost:3001/api/users/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
