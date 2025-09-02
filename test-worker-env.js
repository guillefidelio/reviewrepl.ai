#!/usr/bin/env node

// Simple test script to verify worker environment variables
console.log('🔍 Testing Worker Environment Variables');
console.log('─'.repeat(60));

// Check if environment variables are loaded
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'SUPABASE_SERVICE_ROLE_KEY', 
  'OPENAI_API_KEY',
  'OPENAI_PROJECT_ID'
];

let allGood = true;

requiredVars.forEach(varName => {
  const value = process.env[varName];
  if (value) {
    console.log(`✅ ${varName}: ${varName.includes('KEY') ? 'SET' : value}`);
  } else {
    console.log(`❌ ${varName}: NOT SET`);
    allGood = false;
  }
});

console.log('─'.repeat(60));

if (allGood) {
  console.log('🎉 All required environment variables are set!');
  console.log('🚀 You can now run: npm run worker:dev');
} else {
  console.log('⚠️  Some environment variables are missing!');
  console.log('📝 Please check your .env.local file or environment setup');
  console.log('📋 Copy env-example.txt to .env.local and fill in your values');
}

console.log('─'.repeat(60));
