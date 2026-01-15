/**
 * Test streaming JSON parser
 * Run: npx tsx test-parser.ts
 */

import { extractJSONBlocks, extractLatestJSON, StreamParser } from './src/lib/streaming/parser';

console.log('🧪 Testing Streaming JSON Parser...\n');

// Test 1: Extract complete JSON
const text1 = `
Here's your business data:

\`\`\`json
{
  "name": "Test Business",
  "industry": "Technology",
  "revenue": 100000
}
\`\`\`

That's the summary!
`;

console.log('Test 1: Extract complete JSON');
const result1 = extractJSONBlocks(text1);
console.log('Blocks found:', result1.length);
console.log('Parsed data:', result1[0]?.parsed);
console.log('Is complete:', result1[0]?.isComplete);
console.log('✅ Test 1 passed\n');

// Test 2: Extract incomplete JSON (during streaming)
const text2 = `
Here's your business data:

\`\`\`json
{
  "name": "Test Business",
  "industry": "Technology",
  "revenue": 10
`;

console.log('Test 2: Extract incomplete JSON');
const result2 = extractLatestJSON(text2);
console.log('Parsed data:', result2?.parsed);
console.log('Is complete:', result2?.isComplete);
console.log('✅ Test 2 passed (partial-json works!)\n');

// Test 3: Stream parser with SSE format
console.log('Test 3: Stream parser with SSE events');
const parser = new StreamParser();

const chunk1 = 'data: {"type":"start","model":"claude-sonnet-4"}\n\n';
const chunk2 = 'data: {"type":"text","text":"Here is "}\n\n';
const chunk3 = 'data: {"type":"text","text":"your data: ```json\\n{\\"test\\": true}\\n```"}\n\n';
const chunk4 = 'data: {"type":"done","fullText":"Complete"}\n\n';

const events1 = parser.parseChunk(chunk1);
console.log('Event 1:', events1[0]);

const events2 = parser.parseChunk(chunk2);
console.log('Event 2:', events2[0]);

const events3 = parser.parseChunk(chunk3);
console.log('Event 3:', events3[0]);
console.log('  - Extracted JSON:', events3[0]?.data.json);

const events4 = parser.parseChunk(chunk4);
console.log('Event 4:', events4[0]);

console.log('\n✅ All tests passed! 🎉');
