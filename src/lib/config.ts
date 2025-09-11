// Centralized client-side configuration for environment variables
// This file uses static access, which Next.js can replace at build time

export const paddleConfig = {
  clientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
  environment: process.env.NEXT_PUBLIC_PADDLE_ENV,
};

// Validation function for Paddle configuration
export const validatePaddleConfig = (): boolean => {
  const isValid = !!(paddleConfig.clientToken && paddleConfig.environment);

  console.log('🔍 Paddle Config Validation:');
  console.log('Client Token:', paddleConfig.clientToken ? '✅ SET' : '❌ MISSING');
  console.log('Environment:', paddleConfig.environment ? '✅ SET' : '❌ MISSING');
  console.log('Overall Valid:', isValid ? '✅ YES' : '❌ NO');

  if (!isValid) {
    console.error('❌ Missing required Paddle configuration');
    console.error('Please check your environment variables in Vercel');
  }

  return isValid;
};

// Export individual values for convenience
export const PADDLE_CLIENT_TOKEN = paddleConfig.clientToken;
export const PADDLE_ENVIRONMENT = paddleConfig.environment;
