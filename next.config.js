/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  },
  // Enable static optimization
  reactStrictMode: true,
  poweredByHeader: false,
  // Configure image domains if needed
  images: {
    domains: ['localhost', 'offer.xvrbuyshouses.com'],
  },
  // Add domain for Maps API
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `frame-ancestors 'self' https://offer.xvrbuyshouses.com`
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig