#!/usr/bin/env node

/**
 * Environment Variable Verification Script
 * Helps verify that all required variables are properly configured for Vercel
 */

console.log('🔍 Vercel Environment Variable Verification\n');

// Check if we're in development (local) or production (Vercel)
const isProduction = process.env.NODE_ENV === 'production';
const isVercel = process.env.VERCEL === '1';

console.log(`📍 Environment: ${isProduction ? 'Production' : 'Development'}`);
console.log(`🏗️  Platform: ${isVercel ? 'Vercel' : 'Local'}\n`);

// Required environment variables
const requiredVars = [
  {
    name: 'NEXT_PUBLIC_PADDLE_CLIENT_TOKEN',
    type: 'Client-side',
    description: 'Paddle client token for frontend'
  },
  {
    name: 'NEXT_PUBLIC_PADDLE_ENV',
    type: 'Client-side',
    description: 'Paddle environment (sandbox/production)'
  },
  {
    name: 'PADDLE_API_KEY',
    type: 'Server-side',
    description: 'Paddle API key for backend operations'
  },
  {
    name: 'PADDLE_NOTIFICATION_WEBHOOK_SECRET',
    type: 'Server-side',
    description: 'Webhook signature verification secret'
  }
];

let allGood = true;

console.log('📋 Environment Variables Check:\n');

requiredVars.forEach(({ name, type, description }) => {
  const value = process.env[name];
  const exists = !!value;
  const status = exists ? '✅ SET' : '❌ MISSING';

  console.log(`${name}:`);
  console.log(`  Status: ${status}`);
  console.log(`  Type: ${type}`);
  console.log(`  Purpose: ${description}`);

  if (exists) {
    if (name.includes('SECRET') || name.includes('KEY') || name.includes('TOKEN')) {
      console.log(`  Value: ${value.substring(0, 8)}...${value.substring(value.length - 4)}`);
    } else {
      console.log(`  Value: ${value}`);
    }
  } else {
    allGood = false;
    console.log(`  ❌ NOT FOUND - This will cause errors!`);
  }

  console.log('');
});

console.log('='.repeat(60));

if (allGood) {
  console.log('🎉 All required environment variables are configured!');
  console.log('\n✅ Build should succeed');
  console.log('✅ Runtime should work correctly');
} else {
  console.log('❌ Missing environment variables detected!');
  console.log('\n🔧 Solutions:');

  if (isVercel) {
    console.log('1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables');
    console.log('2. Add the missing variables listed above');
    console.log('3. Redeploy your application');
  } else {
    console.log('1. Copy env-example.txt to .env.local');
    console.log('2. Fill in the missing values');
    console.log('3. Restart your development server');
  }

  console.log('\n📖 Remember:');
  console.log('- Client-side variables need NEXT_PUBLIC_ prefix');
  console.log('- Server-side variables stay private');
  console.log('- Vercel only uses its dashboard env vars, not your local .env files');
}

console.log('\n🔗 Useful Links:');
console.log('- Vercel Env Vars: https://vercel.com/docs/concepts/projects/environment-variables');
console.log('- Paddle Dashboard: https://sandbox-vendors.paddle.com (or production)');

console.log('\n' + '='.repeat(60));
