import { Paddle, Environment, LogLevel } from '@paddle/paddle-node-sdk';

interface PaddleOptions {
  environment: Environment;
  logLevel: LogLevel;
}

/**
 * Creates and configures the Paddle SDK instance for backend operations
 * @returns Configured Paddle instance
 */
export function getPaddleInstance(): Paddle {
  const paddleOptions: PaddleOptions = {
    environment: (process.env.NEXT_PUBLIC_PADDLE_ENV as Environment) ?? Environment.sandbox,
    logLevel: LogLevel.error,
  };

  if (!process.env.PADDLE_API_KEY) {
    console.error('Paddle API key is missing');
    throw new Error('Paddle API key is required');
  }

  try {
    return new Paddle(process.env.PADDLE_API_KEY!, paddleOptions);
  } catch (error) {
    console.error('Failed to initialize Paddle instance:', error);
    throw new Error('Failed to initialize Paddle SDK');
  }
}
