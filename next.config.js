/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Remote patterns for external images (Supabase Storage)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    // Image formats - WebP is served by default with JPEG fallback
    formats: ['image/webp', 'image/avif'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different breakpoints
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL for optimized images (1 day)
    minimumCacheTTL: 86400,
    // Enable dangerous use of SVG (with sanitization)
    dangerouslyAllowSVG: false,
    // Content security policy for SVG
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Disable static image import optimization (use Image component)
    unoptimized: false,
  },
  typescript: {
    tsconfigPath: './tsconfig.json',
  },
  // Enable compression
  compress: true,
  // Production source maps
  productionBrowserSourceMaps: false,
  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn'] } : false,
  },
  // Experimental features for better performance
  experimental: {
    // Optimize package imports
    optimizePackageImports: ['lucide-react', 'recharts'],
    // Optimize CSS loading
    optimizeCss: true,
  },
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
        ],
      },
      // Cache static assets
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
