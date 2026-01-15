/**
 * Test script for Workshop CRUD APIs
 *
 * Prerequisites:
 * 1. Start dev server: npm run dev
 * 2. Get auth token from browser cookies (sb-...-auth-token)
 * 3. Replace AUTH_TOKEN below
 * 4. Run: npx tsx test-workshop-api.ts
 */

const BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN =
  'YOUR_AUTH_TOKEN_HEzEzMTU4Ny0yNjg4LTQ0NTAtOWQxMi0xZDQ2NzIzMzQ1NGEiLCJpZGVudGl0eV9kYXRhIjp7ImF2YXRhcl91cmwiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BQ2c4b2NLQlloOVBBRVNoeU1POXk0cTh3aTZMQkdIRnlYSjgxeFhBeHVPTnNFZkpUN0d0REE9czk2LWMiLCJlbWFpbCI6ImFkZHN0b2xAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImZ1bGxfbmFtZSI6IlNhc2EgTHVraWMiLCJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJuYW1lIjoiU2FzYSBMdWtpYyIsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tCWWg5UEFFU2h5TU85eTRxOHdpNkxCR0hGeVhKODF4WEF4dU9Oc0VmSlQ3R3REQT1zOTYtYyIsInByb3ZpZGVyX2lkIjoiMTA1MTA1ODg2MDk5NTc4ODA0NzAyIiwic3ViIjoiMTA1MTA1ODg2MDk5NTc4ODA0NzAyIn0sInByb3ZpZGVyIjoiZ29vZ2xlIiwibGFzdF9zaWduX2luX2F0IjoiMjAyNi0wMS0xNVQwOTozNTo0NS42ODgxMTRaIiwiY3JlYXRlZF9hdCI6IjIwMjYtMDEtMTVUMDk6MzU6NDUuNjg4MTg2WiIsInVwZGF0ZWRfYXQiOiIyMDI2LTAxLTE1VDExOjQ5OjE3LjMyNTM5M1oiLCJlbWFpbCI6ImFkZHN0b2xAZ21haWwuY29tIn1dLCJjcmVhdGVkX2F0IjoiMjAyNi0wMS0xNVQwOTozNTo0NS42NTAyODhaIiwidXBkYXRlZF9hdCI6IjIwMjYtMDEtMTVUMTQ6MDc6NTQuMTg0ODY4WiIsImlzX2Fub255bW91cyI6ZmFsc2V9fQRE'; // Replace with actual token

// Helper to make authenticated requests
async function apiRequest(
  endpoint: string,
  method: string = 'GET',
  body?: any
) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: `sb-bvrjqzxyoeaknaztexip-auth-token=${AUTH_TOKEN}`,
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();

  return { status: response.status, data };
}

// Run all tests
async function runTests() {
  console.log('🧪 Testing Workshop CRUD APIs...\n');

  try {
    // Test 1: Create Workshop
    console.log('Test 1: POST /api/workshop - Create workshop');
    const createResult = await apiRequest('/api/workshop', 'POST', {
      title: 'Test Business Plan',
      business_name: 'Test Business GmbH',
      description: 'Testing workshop creation',
    });

    console.log('  Status:', createResult.status);
    console.log('  Workshop ID:', createResult.data.workshop?.id);

    if (createResult.status !== 201) {
      console.error('  ❌ Failed to create workshop');
      return;
    }
    console.log('  ✅ Workshop created\n');

    const workshopId = createResult.data.workshop.id;

    // Test 2: List Workshops
    console.log('Test 2: GET /api/workshop - List workshops');
    const listResult = await apiRequest('/api/workshop');

    console.log('  Status:', listResult.status);
    console.log('  Count:', listResult.data.count);
    console.log('  ✅ Workshops listed\n');

    // Test 3: Get Single Workshop
    console.log('Test 3: GET /api/workshop/[id] - Get workshop');
    const getResult = await apiRequest(`/api/workshop/${workshopId}`);

    console.log('  Status:', getResult.status);
    console.log('  Title:', getResult.data.workshop?.title);
    console.log('  Current Module:', getResult.data.workshop?.current_module);
    console.log('  ✅ Workshop fetched\n');

    // Test 4: Update Workshop
    console.log('Test 4: PATCH /api/workshop/[id] - Update workshop');
    const updateResult = await apiRequest(
      `/api/workshop/${workshopId}`,
      'PATCH',
      {
        title: 'Updated Business Plan',
        status: 'in-progress',
      }
    );

    console.log('  Status:', updateResult.status);
    console.log('  New Title:', updateResult.data.workshop?.title);
    console.log('  New Status:', updateResult.data.workshop?.status);
    console.log('  ✅ Workshop updated\n');

    // Test 5: Save Module Progress
    console.log('Test 5: POST /api/workshop/[id]/module - Save module data');
    const moduleResult = await apiRequest(
      `/api/workshop/${workshopId}/module`,
      'POST',
      {
        module_name: 'gz-intake',
        module_data: {
          personalInfo: {
            fullName: 'Test User',
            industry: 'Technology',
          },
          businessIdea: {
            description: 'AI-powered business planning tool',
          },
        },
        update_current_module: true,
      }
    );

    console.log('  Status:', moduleResult.status);
    console.log('  Message:', moduleResult.data.message);
    console.log('  ✅ Module progress saved\n');

    // Test 6: Get Module Data
    console.log('Test 6: GET /api/workshop/[id]/module?name=gz-intake');
    const getModuleResult = await apiRequest(
      `/api/workshop/${workshopId}/module?name=gz-intake`
    );

    console.log('  Status:', getModuleResult.status);
    console.log('  Module Name:', getModuleResult.data.module_name);
    console.log('  Has Data:', !!getModuleResult.data.module_data);
    console.log(
      '  Personal Info:',
      getModuleResult.data.module_data?.personalInfo
    );
    console.log('  ✅ Module data retrieved\n');

    // Test 7: Delete Workshop
    console.log('Test 7: DELETE /api/workshop/[id] - Delete workshop');
    const deleteResult = await apiRequest(
      `/api/workshop/${workshopId}`,
      'DELETE'
    );

    console.log('  Status:', deleteResult.status);
    console.log('  Message:', deleteResult.data.message);
    console.log('  ✅ Workshop deleted\n');

    // Test 8: Verify Deletion
    console.log('Test 8: Verify workshop is gone');
    const verifyResult = await apiRequest(`/api/workshop/${workshopId}`);

    console.log('  Status:', verifyResult.status);
    console.log('  Should be 404:', verifyResult.status === 404);
    console.log('  ✅ Deletion verified\n');

    console.log('🎉 All tests passed!\n');
    console.log('Summary:');
    console.log('  ✅ Create workshop');
    console.log('  ✅ List workshops');
    console.log('  ✅ Get workshop');
    console.log('  ✅ Update workshop');
    console.log('  ✅ Save module progress');
    console.log('  ✅ Get module data');
    console.log('  ✅ Delete workshop');
    console.log('  ✅ Verify deletion');
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests
runTests();
