/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://pulser-api.jgtolentino.com',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://pulser-api.jgtolentino.com',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://pulser-api.jgtolentino.com'}/api/:path*`,
      },
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