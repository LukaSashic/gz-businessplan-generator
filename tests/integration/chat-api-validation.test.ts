/**
 * Integration Tests for Chat API Inline Validation (GZ-801)
 *
 * Tests the full integration of the inline validation system with the chat API route.
 * Verifies that unrealistic inputs trigger Socratic challenges through the API flow.
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';

// Mock external dependencies
vi.mock('@/root-lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn(() => Promise.resolve({
        data: { user: { id: 'test-user-123' } },
        error: null
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({
            data: { id: 'test-workshop', current_module: 'finanzplanung', data: {} },
            error: null
          }))
        }))
      }))
    }))
  }))
}));

vi.mock('@/lib/rate-limit', () => ({
  chatRateLimiter: {
    check: vi.fn(() => ({ success: true, remaining: 100, reset: Date.now() + 60000 }))
  },
  createRateLimitHeaders: vi.fn(() => ({})),
  createRateLimitError: vi.fn(() => ({ error: 'Rate limited' }))
}));

vi.mock('@anthropic-ai/sdk', () => {
  class MockStream {
    async *[Symbol.asyncIterator]() {
      yield { type: 'message_start', message: { model: 'claude-3', role: 'assistant' } };
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Das ist ' } };
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'eine Antwort' } };
      yield { type: 'message_stop' };
    }
  }

  return {
    Anthropic: class MockAnthropic {
      constructor() {}
      messages = {
        stream: vi.fn(() => Promise.resolve(new MockStream()))
      }
    }
  };
});

vi.mock('@/lib/prompts/prompt-loader', () => ({
  getContextualPrompt: vi.fn(() => Promise.resolve('System prompt for testing')),
  buildIntakePhasePrompt: vi.fn(() => Promise.resolve('Intake phase prompt')),
  buildGeschaeftsmodellPhasePrompt: vi.fn(() => Promise.resolve('Geschäftsmodell phase prompt')),
}));

vi.mock('@/lib/claude/zdr-config', () => ({
  createAnthropicConfig: vi.fn(() => ({ apiKey: 'test-key' })),
  getZDRHeaders: vi.fn(() => ({ 'anthropic-beta': 'zdr-2024-10-22' })),
  CLAUDE_CONFIG: {
    model: 'claude-3-sonnet-20240229',
    maxTokens: 4000,
    temperature: 0.3,
    retry: { maxRetries: 3, baseDelayMs: 1000 }
  }
}));

// ============================================================================
// Helper Functions
// ============================================================================

function createMockRequest(body: any): NextRequest {
  return new NextRequest('http://localhost:3000/api/chat', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

async function getStreamContent(response: Response): Promise<string> {
  if (!response.body) return '';

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let result = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      result += chunk;
    }
  } finally {
    reader.releaseLock();
  }

  return result;
}

function extractSystemPromptFromMock(): string {
  // Get the system prompt that was passed to the Anthropic mock
  const { Anthropic } = require('@anthropic-ai/sdk');
  const anthropicMock = vi.mocked(Anthropic);
  const streamCall = anthropicMock.prototype.messages.stream as any;
  const lastCall = streamCall.mock.calls[streamCall.mock.calls.length - 1];
  return lastCall ? lastCall[0].system : '';
}

// ============================================================================
// Integration Tests
// ============================================================================

describe('Chat API Inline Validation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Validation Trigger Detection', () => {
    test('triggers validation for unrealistic single-person revenue', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Ich plane 500.000€ Umsatz im ersten Jahr als Einzelperson' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung',
          elevatorPitch: 'IT-Beratung'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      // Check that the system prompt was injected with validation challenge
      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).toContain('INLINE VALIDATION CHALLENGE');
      expect(systemPrompt).toContain('500.000,00 € Jahresumsatz als Einzelperson');
      expect(systemPrompt).toContain('Wie stellst du dir das konkret vor');
      expect(systemPrompt).toContain('Socratic challenge');
    });

    test('triggers validation for hockey stick growth pattern', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Meine Planung: 50.000€ Jahr 1, 200.000€ Jahr 2, 800.000€ Jahr 3' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).toContain('INLINE VALIDATION CHALLENGE');
      expect(systemPrompt).toContain('Lass uns gemeinsam rechnen');
      expect(systemPrompt).toContain('Welche konkreten Maßnahmen');
    });

    test('triggers validation for time overload', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Ich werde 80 Stunden pro Woche arbeiten müssen' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Freiberufler'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).toContain('INLINE VALIDATION CHALLENGE');
      expect(systemPrompt).toContain('80 Stunden pro Woche');
      expect(systemPrompt).toContain('Work-Life-Balance');
    });

    test('triggers validation for no competition claims', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Das ist eine einzigartige Marktlücke, es gibt keine Konkurrenz' }
        ],
        currentModule: 'markt',
        includeCoaching: true,
        intakeContext: {
          businessType: 'E-Commerce'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).toContain('INLINE VALIDATION CHALLENGE');
      expect(systemPrompt).toContain('keine Konkurrenz');
      expect(systemPrompt).toContain('warum ist noch niemand da');
    });
  });

  describe('Validation Bypass Scenarios', () => {
    test('does not trigger validation for realistic inputs', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Ich plane 120.000€ Umsatz als Berater mit 40 Stunden pro Woche' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).not.toContain('INLINE VALIDATION CHALLENGE');
    });

    test('does not trigger validation for estimation language', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Ungefähr 500.000€ vielleicht, nur grob geschätzt' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).not.toContain('INLINE VALIDATION CHALLENGE');
    });

    test('does not trigger validation for hypothetical scenarios', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Wenn ich 500.000€ machen würde, wäre das hypothetisch möglich?' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).not.toContain('INLINE VALIDATION CHALLENGE');
    });

    test('does not trigger validation for acknowledgment responses', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Ja stimmt, das ist zu optimistisch und unrealistisch' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung'
        }
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).not.toContain('INLINE VALIDATION CHALLENGE');
    });

    test('does not trigger validation for short inputs', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Ja' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).not.toContain('INLINE VALIDATION CHALLENGE');
    });
  });

  describe('Business Type Adaptation', () => {
    test('adapts validation thresholds for different business types', async () => {
      // Test with Restaurant (strict growth limits)
      const restaurantRequest = createMockRequest({
        messages: [
          { role: 'user', content: '50% Wachstum pro Jahr für mein Restaurant' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Restaurant'
        }
      });

      const restaurantResponse = await POST(restaurantRequest);
      expect(restaurantResponse.status).toBe(200);

      const restaurantPrompt = extractSystemPromptFromMock();
      expect(restaurantPrompt).toContain('INLINE VALIDATION CHALLENGE'); // Should trigger for restaurant

      vi.clearAllMocks();

      // Test with SaaS (higher growth allowed)
      const saasRequest = createMockRequest({
        messages: [
          { role: 'user', content: '50% Wachstum pro Jahr für mein SaaS' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'SaaS'
        }
      });

      const saasResponse = await POST(saasRequest);
      expect(saasResponse.status).toBe(200);

      const saasPrompt = extractSystemPromptFromMock();
      expect(saasPrompt).not.toContain('INLINE VALIDATION CHALLENGE'); // Should not trigger for SaaS
    });

    test('uses default thresholds when business type is unknown', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: '400.000€ Umsatz als Einzelperson' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {} // No business type
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).toContain('INLINE VALIDATION CHALLENGE'); // Should use default threshold
    });
  });

  describe('Error Handling', () => {
    test('handles validation errors gracefully without breaking chat flow', async () => {
      // Create a scenario that might cause validation to throw an error
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Test with potentially problematic input: null revenue' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: null // Potentially problematic data
        }
      });

      const response = await POST(request);

      // Should still return success even if validation fails
      expect(response.status).toBe(200);

      // Should still stream content
      const content = await getStreamContent(response);
      expect(content).toBeTruthy();
    });

    test('continues normal flow when no user message is present', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'assistant', content: 'Only assistant message' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true
      });

      const response = await POST(request);
      expect(response.status).toBe(200);

      const systemPrompt = extractSystemPromptFromMock();
      expect(systemPrompt).not.toContain('INLINE VALIDATION CHALLENGE');
    });
  });

  describe('Logging and Monitoring', () => {
    test('logs validation triggers for monitoring', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const request = createMockRequest({
        messages: [
          { role: 'user', content: '600.000€ Umsatz als Einzelperson' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung'
        }
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/\[Inline Validation\] Triggered capacity validation \(high priority\)/)
      );

      consoleSpy.mockRestore();
    });

    test('logs validation warnings when errors occur', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Mock the validation function to throw an error
      vi.doMock('@/lib/validation/inline-validator', () => ({
        getInlineValidationPrompt: vi.fn(() => {
          throw new Error('Validation error for testing');
        })
      }));

      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Any input that might cause validation error' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true
      });

      await POST(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        '[Inline Validation] Validation error:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Question-First Approach Verification', () => {
    test('ensures all validation challenges are questions, not statements', async () => {
      const testCases = [
        {
          input: '500.000€ als Einzelperson',
          businessType: 'Beratung'
        },
        {
          input: '100 Stunden pro Woche',
          businessType: 'Freiberufler'
        },
        {
          input: 'Keine Konkurrenz vorhanden',
          businessType: 'E-Commerce'
        },
        {
          input: '100.000€ Jahr 1, 500.000€ Jahr 2',
          businessType: 'Beratung'
        }
      ];

      for (const testCase of testCases) {
        vi.clearAllMocks();

        const request = createMockRequest({
          messages: [
            { role: 'user', content: testCase.input }
          ],
          currentModule: 'finanzplanung',
          includeCoaching: true,
          intakeContext: {
            businessType: testCase.businessType
          }
        });

        const response = await POST(request);
        expect(response.status).toBe(200);

        const systemPrompt = extractSystemPromptFromMock();

        if (systemPrompt.includes('INLINE VALIDATION CHALLENGE')) {
          // Extract the challenge text
          const challengeMatch = systemPrompt.match(/=== INLINE VALIDATION CHALLENGE ===\s*([\s\S]*?)\s*Note:/);
          const challengeText = challengeMatch ? challengeMatch[1].trim() : '';

          // Verify it contains question marks (German questions)
          expect(challengeText).toMatch(/\?/);

          // Verify it doesn't start with directive language
          expect(challengeText).not.toMatch(/^(Das ist|Du solltest|Ich empfehle|Das geht nicht)/);

          // Verify it contains interrogative words
          expect(challengeText).toMatch(/(Wie|Was|Welche|Warum|Kennst|Lass uns|Siehst)/i);
        }
      }
    });
  });

  describe('Module-Specific Validation', () => {
    test('applies validation in financial planning module', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: '500.000€ Umsatz geplant' }
        ],
        currentModule: 'finanzplanung',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung'
        }
      });

      const response = await POST(request);
      const systemPrompt = extractSystemPromptFromMock();

      expect(systemPrompt).toContain('INLINE VALIDATION CHALLENGE');
    });

    test('applies validation in market module', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: 'Es gibt keine direkten Konkurrenten' }
        ],
        currentModule: 'markt',
        includeCoaching: true,
        intakeContext: {
          businessType: 'E-Commerce'
        }
      });

      const response = await POST(request);
      const systemPrompt = extractSystemPromptFromMock();

      expect(systemPrompt).toContain('INLINE VALIDATION CHALLENGE');
    });

    test('works with unknown modules', async () => {
      const request = createMockRequest({
        messages: [
          { role: 'user', content: '500.000€ als Einzelperson' }
        ],
        currentModule: 'unknown-module',
        includeCoaching: true,
        intakeContext: {
          businessType: 'Beratung'
        }
      });

      const response = await POST(request);

      // Should still work and return success
      expect(response.status).toBe(200);
    });
  });
});