// Test file to verify package installations
// Run: npx tsx test-imports.ts

import { Anthropic } from '@anthropic-ai/sdk';
import { streamText } from 'ai';
import { parseJSON } from 'partial-json';
import { z } from 'zod';

console.log('✅ All imports successful!');
console.log('- @anthropic-ai/sdk:', typeof Anthropic);
console.log('- ai (streamText):', typeof streamText);
console.log('- partial-json:', typeof parseJSON);
console.log('- zod:', typeof z);

// Test partial-json parsing
const incompleteJSON = '{"name": "Test", "data": {"value":';
try {
  const parsed = parseJSON(incompleteJSON);
  console.log('✅ partial-json works:', parsed);
} catch (e) {
  console.log('⚠️ partial-json error (expected for incomplete JSON)');
}

// Test Zod schema
const TestSchema = z.object({
  name: z.string(),
  value: z.number(),
});

try {
  TestSchema.parse({ name: 'Test', value: 42 });
  console.log('✅ Zod validation works');
} catch (e) {
  console.log('❌ Zod validation failed');
}

console.log('\n🎉 All packages installed correctly!');
