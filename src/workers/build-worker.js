#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔨 Building background worker...');

try {
  // Build the worker TypeScript file
  console.log('📝 Compiling TypeScript worker...');
  execSync('npx tsc src/workers/job-processor.ts --outDir dist/workers --target es2020 --module commonjs --esModuleInterop --allowSyntheticDefaultImports', { 
    stdio: 'inherit' 
  });

  // Copy package.json to dist if it doesn't exist
  const distPackagePath = path.join(__dirname, '../../dist/workers/package.json');
  if (!fs.existsSync(distPackagePath)) {
    const packageContent = {
      "name": "reviewrepl-worker",
      "version": "1.0.0",
      "description": "Background job processor for ReviewRepl.ai",
      "main": "job-processor.js",
      "scripts": {
        "start": "node job-processor.js",
        "dev": "ts-node src/workers/job-processor.ts"
      },
      "dependencies": {
        "@supabase/supabase-js": "^2.x.x",
        "dotenv": "^16.x.x"
      },
      "devDependencies": {
        "typescript": "^5.x.x",
        "ts-node": "^10.x.x"
      }
    };

    fs.writeFileSync(distPackagePath, JSON.stringify(packageContent, null, 2));
    console.log('📦 Created package.json in dist/workers/');
  }

  console.log('✅ Worker build completed successfully!');
  console.log('📁 Output directory: dist/workers/');
  console.log('🚀 To run the worker: cd dist/workers && npm start');

} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
