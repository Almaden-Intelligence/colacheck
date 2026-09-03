/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk'],
    outputFileTracingIncludes: {
      '/api/check': ['./lib/cfr/**/*.md'],
    },
  },
}

module.exports = nextConfig
