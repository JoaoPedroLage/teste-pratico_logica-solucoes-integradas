/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuração para API routes - procura backend em portas alternativas
  async rewrites() {
    // Usa variável de ambiente ou porta padrão
    const backendPort = process.env.NEXT_PUBLIC_BACKEND_PORT || process.env.BACKEND_PORT || '3001';
    const backendHost = process.env.NEXT_PUBLIC_BACKEND_HOST || 'localhost';
    const protocol = process.env.NEXT_PUBLIC_BACKEND_PROTOCOL || 'http';
    return [
      {
        source: '/api/users/:path*',
        destination: `${protocol}://${backendHost}:${backendPort}/api/users/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;