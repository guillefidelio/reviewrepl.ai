#!/usr/bin/env node

// Simple worker startup script
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting ReviewRepl.ai Worker...');
console.log('─'.repeat(60));

// Check if we're in the right directory
const currentDir = process.cwd();
console.log(`📁 Current directory: ${currentDir}`);

// Check if package.json exists
const packageJsonPath = path.join(currentDir, 'package.json');
try {
  require(packageJsonPath);
  console.log('✅ Found package.json');
} catch (error) {
  console.error('❌ package.json not found in current directory');
  console.error('Please run this script from the project root directory');
  process.exit(1);
}

// Check if .env.local exists
const envPath = path.join(currentDir, '.env.local');
try {
  require('fs').accessSync(envPath);
  console.log('✅ Found .env.local file');
} catch (error) {
  console.log('⚠️  .env.local file not found');
  console.log('📝 Please create .env.local with your environment variables');
  console.log('📋 Copy env-example.txt to .env.local and fill in your values');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

// Check required environment variables
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

if (!allGood) {
  console.log('⚠️  Some environment variables are missing!');
  console.log('📝 Please check your .env.local file');
  process.exit(1);
}

console.log('─'.repeat(60));
console.log('🎉 Environment check passed! Starting worker...');
console.log('─'.repeat(60));

// Start the worker using ts-node
const workerProcess = spawn('npx', [
  'ts-node', 
  '-r', 'tsconfig-paths/register',
  '-r', 'dotenv/config',
  'src/workers/job-processor.ts'
], {
  stdio: 'inherit',
  env: process.env
});

workerProcess.on('close', (code) => {
  console.log(`\n🛑 Worker process exited with code ${code}`);
  process.exit(code);
});

workerProcess.on('error', (error) => {
  console.error('❌ Failed to start worker:', error);
  process.exit(1);
});

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Received SIGINT, shutting down...');
  workerProcess.kill('SIGINT');
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Received SIGTERM, shutting down...');
  workerProcess.kill('SIGTERM');
});
