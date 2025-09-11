#!/usr/bin/env node

/**
 * Quick verification script for Paddle API key format
 * Run with: node verify-paddle-key.js
 */

console.log('🔍 Paddle API Key Verification\n');

const apiKey = process.env.PADDLE_API_KEY;

if (!apiKey) {
  console.log('❌ PADDLE_API_KEY environment variable is not set');
  process.exit(1);
}

console.log(`📏 Key Length: ${apiKey.length} characters`);
console.log(`🔤 Starts with 'pdl_': ${apiKey.startsWith('pdl_') ? '✅ YES' : '❌ NO'}`);
console.log(`🏖️  Contains 'sdbx': ${apiKey.includes('sdbx') ? '✅ YES (Sandbox)' : '❌ NO (Production)'}`);
console.log(`🔑 First 10 chars: ${apiKey.substring(0, 10)}...`);
console.log(`🔑 Last 10 chars: ...${apiKey.substring(apiKey.length - 10)}`);

console.log('\n📋 Expected Format:');
console.log('  Sandbox: pdl_sdbx_apikey_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
console.log('  Production: pdl_apikey_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');

if (apiKey.length < 50) {
  console.log('\n⚠️  WARNING: Your API key seems too short!');
  console.log('   Typical Paddle API keys are 50-60 characters long.');
  console.log('   Please double-check your key from Paddle dashboard.');
} else {
  console.log('\n✅ API key length looks good!');
}

console.log('\n🔗 Get your API key from:');
console.log('   Sandbox: https://sandbox-vendors.paddle.com → Settings → Developer Tools → API Keys');
console.log('   Production: https://vendors.paddle.com → Settings → Developer Tools → API Keys');
