import type { NextConfig } from 'next'

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = []

if (process.env.SUPABASE_URL) {
  remotePatterns.push({
    protocol: 'https',
    hostname: new URL(process.env.SUPABASE_URL).hostname,
    pathname: '/storage/v1/object/public/**',
  })
}

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 100],
    remotePatterns,
  },
}

export default nextConfig
