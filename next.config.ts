import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Expose environment variables to the client
  env: {
    NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
    NEXT_PUBLIC_PADDLE_ENV: process.env.NEXT_PUBLIC_PADDLE_ENV,
  },

  webpack: (config) => {
    // Validate required environment variables at build time
    const requiredEnvVars = [
      'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN',
      'NEXT_PUBLIC_PADDLE_ENV'
    ];

    const missing = requiredEnvVars.filter(key => !process.env[key]);

    if (missing.length > 0) {
      console.error('❌ Missing required Paddle environment variables:');
      missing.forEach(key => console.error(`   - ${key}`));
      console.error('Please set these in your .env.local file or Vercel environment variables');
      // Don't throw in development, but warn
      if (process.env.NODE_ENV === 'production') {
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
      }
    } else {
      console.log('✅ All required Paddle environment variables are set');
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });
    return config;
  },
};

export default nextConfig;
