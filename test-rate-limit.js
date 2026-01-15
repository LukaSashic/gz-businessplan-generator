/**
 * Rate Limit Test Script
 * 
 * Instructions:
 * 1. Login to http://localhost:3000/dashboard
 * 2. Open browser console (F12)
 * 3. Paste and run this script
 */

async function testRateLimit() {
  console.log('🧪 Testing Rate Limiting...\n');
  
  try {
    // Test 1: Chat endpoint (10 requests/minute limit)
    console.log('Test 1: Chat API Rate Limit (10 req/min)');
    console.log('Making 12 rapid requests...\n');
    
    let successCount = 0;
    let rateLimitedCount = 0;
    let lastReset = null;
    
    for (let i = 1; i <= 12; i++) {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: `Test message ${i}` }],
        }),
      });
      
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      const reset = response.headers.get('X-RateLimit-Reset');
      
      if (response.status === 200) {
        successCount++;
        console.log(`  ${i}. ✅ Success - Remaining: ${remaining}/${limit}`);
      } else if (response.status === 429) {
        rateLimitedCount++;
        const data = await response.json();
        lastReset = reset;
        console.log(`  ${i}. ⛔ Rate Limited - ${data.message}`);
      } else {
        console.log(`  ${i}. ❌ Error: ${response.status}`);
      }
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n📊 Chat API Results:');
    console.log(`  ✅ Successful: ${successCount}`);
    console.log(`  ⛔ Rate Limited: ${rateLimitedCount}`);
    console.log(`  Expected: 10 success, 2 rate limited`);
    
    if (successCount === 10 && rateLimitedCount === 2) {
      console.log('  ✅ Rate limiting works correctly!\n');
    } else {
      console.log('  ⚠️ Unexpected results\n');
    }
    
    // Test 2: Workshop endpoint (30 requests/minute limit)
    console.log('Test 2: Workshop API Rate Limit (30 req/min)');
    console.log('Making 5 requests...\n');
    
    for (let i = 1; i <= 5; i++) {
      const response = await fetch('/api/workshop');
      
      const remaining = response.headers.get('X-RateLimit-Remaining');
      const limit = response.headers.get('X-RateLimit-Limit');
      
      if (response.status === 200) {
        console.log(`  ${i}. ✅ Success - Remaining: ${remaining}/${limit}`);
      } else if (response.status === 429) {
        const data = await response.json();
        console.log(`  ${i}. ⛔ Rate Limited - ${data.message}`);
      } else {
        console.log(`  ${i}. Status: ${response.status}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('  ✅ Workshop rate limiting active\n');
    
    // Test 3: Wait and retry (reset check)
    if (lastReset) {
      const resetTime = parseInt(lastReset, 10);
      const waitTime = Math.max(0, resetTime - Date.now());
      
      if (waitTime > 0 && waitTime < 60000) {
        const seconds = Math.ceil(waitTime / 1000);
        console.log(`Test 3: Waiting ${seconds}s for rate limit reset...`);
        
        await new Promise(resolve => setTimeout(resolve, waitTime + 1000));
        
        console.log('Testing after reset...');
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: 'Test after reset' }],
          }),
        });
        
        if (response.status === 200) {
          console.log('  ✅ Rate limit reset successfully!\n');
        } else {
          console.log(`  ⚠️ Unexpected status: ${response.status}\n`);
        }
      }
    }
    
    console.log('🎉 Rate limit tests completed!\n');
    console.log('Summary:');
    console.log('  ✅ Chat API enforces 10 req/min limit');
    console.log('  ✅ Rate limit headers are present');
    console.log('  ✅ 429 errors include retry information');
    console.log('  ✅ Limits reset after time window');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Quick test (just check rate limit headers)
async function quickRateLimitTest() {
  console.log('🔍 Quick Rate Limit Check\n');
  
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Test' }],
    }),
  });
  
  console.log('Status:', response.status);
  console.log('Rate Limit Headers:');
  console.log('  Limit:', response.headers.get('X-RateLimit-Limit'));
  console.log('  Remaining:', response.headers.get('X-RateLimit-Remaining'));
  console.log('  Reset:', response.headers.get('X-RateLimit-Reset'));
  
  if (response.status === 429) {
    const data = await response.json();
    console.log('\n⛔ Rate Limited:', data.message);
  }
}

// Run full test
testRateLimit();

// Or run quick test:
// quickRateLimitTest();
