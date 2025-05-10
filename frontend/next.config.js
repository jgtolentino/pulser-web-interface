/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || '/api',
  },
  async rewrites() {
    return [
      // API mock routes for development and demo
      {
        source: '/api/health',
        destination: '/api/mock/health',
      },
      {
        source: '/api/message',
        destination: '/api/mock/message',
      },
      {
        source: '/api/sketch_generate',
        destination: '/api/mock/sketch_generate',
      },
      // If a real backend is available, uncomment and update this:
      // {
      //   source: '/api/:path*',
      //   destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://pulser-api.jgtolentino.com'}/api/:path*`,
      // },
    ];
  },
  // Output as standalone for easier deployment
  output: 'standalone',
  // Disable image optimization if needed
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig