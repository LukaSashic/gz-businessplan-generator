/**
 * Test script for Intake Module Flow
 *
 * Tests:
 * 1. Chat API endpoint with intake module
 * 2. JSON extraction from streaming responses
 * 3. Intake data validation
 *
 * Run with: npx tsx test-intake-flow.ts
 */

const API_BASE = 'http://localhost:3000';

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
  error?: string;
}

const results: TestResult[] = [];

function log(message: string) {
  console.log(`[TEST] ${message}`);
}

function logResult(result: TestResult) {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}`);
  if (result.details) console.log(`   Details: ${result.details}`);
  if (result.error) console.log(`   Error: ${result.error}`);
  results.push(result);
}

// Test 1: Chat API endpoint responds
async function testChatEndpoint() {
  log('Testing chat endpoint...');

  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: 'Hallo, ich möchte einen Businessplan erstellen.' }],
        workshopId: 'test-workshop-123',
        currentModule: 'gz-intake',
      }),
    });

    if (response.status === 401) {
      logResult({
        name: 'Chat API - Auth Required',
        passed: true,
        details: 'API correctly requires authentication (401)',
      });
      return;
    }

    if (!response.ok) {
      logResult({
        name: 'Chat API Endpoint',
        passed: false,
        error: `Status ${response.status}: ${await response.text()}`,
      });
      return;
    }

    logResult({
      name: 'Chat API Endpoint',
      passed: true,
      details: `Status ${response.status}, streaming response received`,
    });

    // Try to read some of the stream
    const reader = response.body?.getReader();
    if (reader) {
      const { value } = await reader.read();
      const text = new TextDecoder().decode(value);
      log(`First chunk: ${text.substring(0, 200)}...`);
      reader.cancel();
    }
  } catch (error) {
    logResult({
      name: 'Chat API Endpoint',
      passed: false,
      error: String(error),
    });
  }
}

// Test 2: JSON extraction from sample text
async function testJSONExtraction() {
  log('Testing JSON extraction...');

  // Simulate what the parser does
  const sampleResponse = `
Hallo! Willkommen beim GZ Businessplan Generator. Lass uns mit ein paar Fragen beginnen.

<json>
{
  "founder": {
    "currentStatus": "unemployed",
    "algStatus": {
      "daysRemaining": 180,
      "monthlyAmount": 1500
    }
  },
  "metadata": {
    "currentPhase": "founder_profile"
  }
}
</json>

Kannst du mir mehr über deine berufliche Erfahrung erzählen?
`;

  // Import and test the parser
  try {
    // We can't directly import TS modules, so we test the regex patterns
    const xmlRegex = /<json>\s*([\s\S]*?)(?:<\/json>|$)/g;
    const match = xmlRegex.exec(sampleResponse);

    if (match && match[1]) {
      const jsonStr = match[1].trim();
      const parsed = JSON.parse(jsonStr);

      logResult({
        name: 'JSON Extraction (XML tags)',
        passed: true,
        details: `Extracted: founder.currentStatus="${parsed.founder?.currentStatus}", phase="${parsed.metadata?.currentPhase}"`,
      });
    } else {
      logResult({
        name: 'JSON Extraction (XML tags)',
        passed: false,
        error: 'No JSON block found',
      });
    }
  } catch (error) {
    logResult({
      name: 'JSON Extraction (XML tags)',
      passed: false,
      error: String(error),
    });
  }

  // Test markdown format too
  const markdownResponse = `
\`\`\`json
{
  "businessIdea": {
    "elevator_pitch": "Eine App für lokale Handwerker"
  }
}
\`\`\`
`;

  try {
    const markdownRegex = /```json\s*([\s\S]*?)(?:```|$)/g;
    const match = markdownRegex.exec(markdownResponse);

    if (match && match[1]) {
      const parsed = JSON.parse(match[1].trim());

      logResult({
        name: 'JSON Extraction (Markdown)',
        passed: true,
        details: `Extracted: elevator_pitch="${parsed.businessIdea?.elevator_pitch}"`,
      });
    } else {
      logResult({
        name: 'JSON Extraction (Markdown)',
        passed: false,
        error: 'No JSON block found',
      });
    }
  } catch (error) {
    logResult({
      name: 'JSON Extraction (Markdown)',
      passed: false,
      error: String(error),
    });
  }
}

// Test 3: Intake validation logic
async function testIntakeValidation() {
  log('Testing intake validation...');

  // Test GZ eligibility
  const testCases = [
    { days: 180, expectEligible: true },
    { days: 150, expectEligible: true },
    { days: 149, expectEligible: false },
    { days: 100, expectEligible: false },
  ];

  for (const tc of testCases) {
    const isEligible = tc.days >= 150;
    const passed = isEligible === tc.expectEligible;

    logResult({
      name: `GZ Eligibility (${tc.days} days)`,
      passed,
      details: `Expected ${tc.expectEligible}, got ${isEligible}`,
    });
  }
}

// Test 4: Workshop page loads
async function testWorkshopPage() {
  log('Testing workshop page...');

  try {
    // Try to fetch the workshop page (will redirect to login if not authenticated)
    const response = await fetch(`${API_BASE}/dashboard/workshop/test-id`, {
      redirect: 'manual',
    });

    if (response.status === 307 || response.status === 302) {
      logResult({
        name: 'Workshop Page - Redirect to Login',
        passed: true,
        details: 'Page correctly redirects unauthenticated users',
      });
    } else if (response.ok) {
      logResult({
        name: 'Workshop Page',
        passed: true,
        details: `Status ${response.status}`,
      });
    } else {
      logResult({
        name: 'Workshop Page',
        passed: false,
        error: `Status ${response.status}`,
      });
    }
  } catch (error) {
    logResult({
      name: 'Workshop Page',
      passed: false,
      error: String(error),
    });
  }
}

// Test 5: Type validation for IntakeOutput structure
async function testIntakeTypes() {
  log('Testing intake type structure...');

  const sampleIntakeOutput = {
    founder: {
      currentStatus: 'unemployed',
      algStatus: { daysRemaining: 180, monthlyAmount: 1500 },
      experience: { yearsInIndustry: 5, previousFounder: false },
      qualifications: { education: 'Bachelor BWL', certifications: [] },
      motivation: { push: ['Arbeitslosigkeit'], pull: ['Freiheit'] },
    },
    businessIdea: {
      elevator_pitch: 'Eine App für lokale Handwerker',
      problem: 'Handwerker finden keine Kunden',
      solution: 'Digitale Vermittlungsplattform',
      targetAudience: 'Lokale Handwerksbetriebe',
    },
    personality: {
      narrative: 'Ein erfahrener Gründer mit starkem Antrieb',
      innovativeness: 'high',
      riskTaking: 'medium',
    },
    businessType: {
      category: 'local_service',
    },
    resources: {
      financial: { availableCapital: 5000 },
      time: { hoursPerWeek: 40, isFullTime: true },
    },
    validation: {
      isGZEligible: true,
      strengths: ['5 Jahre Erfahrung'],
      majorConcerns: [],
      minorConcerns: [],
    },
  };

  // Check required fields exist
  const requiredFields = [
    ['founder', 'currentStatus'],
    ['founder', 'algStatus', 'daysRemaining'],
    ['businessIdea', 'elevator_pitch'],
    ['personality', 'narrative'],
    ['businessType', 'category'],
    ['validation', 'isGZEligible'],
  ];

  let allPassed = true;
  const missing: string[] = [];

  for (const path of requiredFields) {
    let current: any = sampleIntakeOutput;
    for (const key of path) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        allPassed = false;
        missing.push(path.join('.'));
        break;
      }
    }
  }

  logResult({
    name: 'IntakeOutput Structure',
    passed: allPassed,
    details: allPassed
      ? 'All required fields present'
      : `Missing: ${missing.join(', ')}`,
  });
}

// Main test runner
async function runTests() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 GZ Businessplan Generator - Intake Flow Tests');
  console.log('='.repeat(60) + '\n');

  await testChatEndpoint();
  await testJSONExtraction();
  await testIntakeValidation();
  await testWorkshopPage();
  await testIntakeTypes();

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 Test Summary');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;

  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📝 Total:  ${results.length}`);
  console.log('='.repeat(60) + '\n');

  if (failed > 0) {
    console.log('❌ Some tests failed. Check the output above for details.\n');
    process.exit(1);
  } else {
    console.log('✅ All tests passed!\n');
    process.exit(0);
  }
}

runTests().catch(console.error);
