/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'inmobiliariaacropolis.s3.us-east-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Optimize images
    unoptimized: false,
    // Configure image sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Use modern formats
    formats: ['image/webp'],
    // Set minimum cache TTL
    minimumCacheTTL: 60,
  },
};

export default config;
