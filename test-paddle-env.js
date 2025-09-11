#!/usr/bin/env node

/**
 * Test script to verify Paddle environment variables are properly configured
 * Run with: node test-paddle-env.js
 */

console.log('🔍 Paddle Environment Variable Test\n');

// Check for required environment variables
const requiredVars = [
  'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN',
  'NEXT_PUBLIC_PADDLE_ENV',
  'PADDLE_API_KEY',
  'PADDLE_NOTIFICATION_WEBHOOK_SECRET'
];

const optionalVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
];

let allGood = true;

console.log('📋 Required Paddle Variables:');
requiredVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '❌ MISSING';

  if (!value) {
    allGood = false;
  }

  console.log(`  ${varName}: ${status}`);
  if (value) {
    // Show first 8 characters for security
    const preview = varName.includes('SECRET') || varName.includes('KEY') || varName.includes('TOKEN')
      ? `${value.substring(0, 8)}...`
      : value;
    console.log(`    Value: ${preview}`);
  }
});

console.log('\n📋 Optional Variables:');
optionalVars.forEach(varName => {
  const value = process.env[varName];
  const status = value ? '✅ SET' : '⚠️  MISSING';

  console.log(`  ${varName}: ${status}`);
  if (value && !varName.includes('SECRET') && !varName.includes('KEY')) {
    console.log(`    Value: ${value}`);
  }
});

// Check for common issues
console.log('\n🔧 Common Issues Check:');

// Check if client token looks valid (should start with pdl_)
const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
if (clientToken && !clientToken.startsWith('pdl_')) {
  console.log('  ⚠️  Warning: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN should start with "pdl_"');
  allGood = false;
}

// Check environment value
const env = process.env.NEXT_PUBLIC_PADDLE_ENV;
if (env && !['sandbox', 'production'].includes(env)) {
  console.log('  ⚠️  Warning: NEXT_PUBLIC_PADDLE_ENV should be "sandbox" or "production"');
  allGood = false;
}

// Final status
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('🎉 All required Paddle environment variables are properly configured!');
  console.log('\nNext steps:');
  console.log('1. Run: npm run dev (for local development)');
  console.log('2. Run: npm run build && npm start (for production test)');
  console.log('3. Deploy to Vercel with proper environment variables');
} else {
  console.log('❌ Some environment variables are missing or misconfigured!');
  console.log('\nPlease:');
  console.log('1. Copy env-example.txt to .env.local');
  console.log('2. Fill in all the required Paddle variables');
  console.log('3. Get your Paddle credentials from https://vendors.paddle.com/');
  console.log('4. Run this script again to verify');
}
console.log('='.repeat(50));


