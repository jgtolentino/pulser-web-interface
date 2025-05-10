/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || '/api',
    NEXT_PUBLIC_IS_MOCK_API: 'true',
  },
  async rewrites() {
    // API mock routes for development and demo with fallback routes
    return {
      beforeFiles: [
        // Direct access to mock APIs for testing
        {
          source: '/api/mock/:path*',
          destination: '/api/mock/:path*',
        },
      ],
      fallback: [
        // Primary API routes map to mocks
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
        // Catch-all for any other API requests
        {
          source: '/api/:path*',
          destination: '/api/mock/health',
        },
      ],
    };
  },
  // Output as standalone for easier deployment
  output: 'standalone',
  // Disable image optimization if needed
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig