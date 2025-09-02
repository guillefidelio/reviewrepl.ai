#!/usr/bin/env node

// Simple test script to verify the complete job flow
// Run this with: node test-job-flow.js

const API_BASE = 'http://localhost:3000/api/v1';

async function testJobFlow() {
  console.log('🧪 Testing Complete Job Flow...\n');

  try {
    // Step 1: Create a test job
    console.log('📝 Step 1: Creating test job...');

    const jobPayload = {
      job_type: 'ai_generation',
      payload: {
        review_text: 'This is a test review for the AI response generator. The service was excellent and I highly recommend it!',
        review_rating: 5,
        business_profile: {
          business_name: 'Test Business',
          business_main_category: 'restaurant',
          response_tone: 'professional',
          language: 'en',
          greetings: 'Dear valued customer,',
          signatures: 'Best regards, Test Business Team'
        }
      }
    };

    const createResponse = await fetch(`${API_BASE}/jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: This test doesn't include authentication
        // In real usage, you'd need a valid JWT token
      },
      body: JSON.stringify(jobPayload)
    });

    if (!createResponse.ok) {
      console.log('❌ Job creation failed:', createResponse.status);
      const error = await createResponse.text();
      console.log('Error:', error);
      return;
    }

    const jobResult = await createResponse.json();
    console.log('✅ Job created successfully!');
    console.log('Job ID:', jobResult.job.id);
    console.log('Job Status:', jobResult.job.status);
    console.log();

    // Step 2: Poll for job status
    const jobId = jobResult.job.id;
    console.log('🔄 Step 2: Polling job status...');

    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      console.log(`Attempt ${attempts + 1}/${maxAttempts}...`);

      const statusResponse = await fetch(`${API_BASE}/jobs/${jobId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!statusResponse.ok) {
        console.log('❌ Status check failed:', statusResponse.status);
        break;
      }

      const statusData = await statusResponse.json();
      const job = statusData.job;

      console.log(`Job status: ${job.status}`);

      if (job.status === 'completed') {
        console.log('✅ Job completed!');
        console.log('Result:', JSON.stringify(job.result, null, 2));
        break;
      } else if (job.status === 'failed') {
        console.log('❌ Job failed!');
        console.log('Error:', job.error);
        break;
      } else {
        console.log('⏳ Job still processing...');
      }

      // Wait 3 seconds before next poll
      await new Promise(resolve => setTimeout(resolve, 3000));
      attempts++;
    }

    if (attempts >= maxAttempts) {
      console.log('⏰ Job polling timed out');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testJobFlow().then(() => {
  console.log('\n🏁 Test completed');
}).catch(error => {
  console.error('💥 Test crashed:', error);
});






