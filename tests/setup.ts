/**
 * Vitest global setup
 *
 * This file runs before all tests and sets up the test environment.
 */

import { beforeAll, afterAll, vi } from 'vitest';

// Mock environment variables for tests
beforeAll(() => {
  process.env.ANTHROPIC_API_KEY = 'test-api-key';
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';
});

// Clean up after all tests
afterAll(() => {
  vi.restoreAllMocks();
});
