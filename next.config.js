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
};

module.exports = nextConfig;
