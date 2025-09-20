/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/ba-analyzer/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8085'}/ba-analyzer/v1/:path*`,
      },
    ]
  },
}

module.exports = nextConfig