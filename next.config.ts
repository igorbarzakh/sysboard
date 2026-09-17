import type { NextConfig } from 'next'

const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] = []

if (process.env.AWS_ENDPOINT_URL_S3) {
  remotePatterns.push(new URL(
    `${process.env.AWS_ENDPOINT_URL_S3.replace(/\/$/, '')}/${encodeURIComponent(process.env.AWS_S3_BUCKET ?? 'avatars')}/**`,
  ))
}

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 90, 100],
    remotePatterns,
  },
}

export default nextConfig
