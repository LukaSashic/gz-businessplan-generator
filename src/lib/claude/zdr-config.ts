/**
 * Zero Data Retention (ZDR) Configuration for Claude API
 *
 * CRITICAL: This header ensures GDPR/DSGVO compliance by preventing
 * Anthropic from storing any user data from API requests.
 *
 * Without this header, data is retained for 90 days.
 * With this header, data is NOT stored at all.
 *
 * @see https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching#zero-data-retention
 */

/**
 * Zero Data Retention header value
 * Must be included in ALL Claude API calls for GDPR compliance
 */
export const ZDR_HEADER_VALUE = 'zdr-2024-10-22';

/**
 * Header name for Anthropic beta features
 */
export const ANTHROPIC_BETA_HEADER = 'anthropic-beta';

/**
 * Get the ZDR headers object for use in API calls
 *
 * @example
 * ```typescript
 * import { getZDRHeaders } from '@/lib/claude/zdr-config';
 *
 * const stream = await anthropic.messages.stream({
 *   model: 'claude-sonnet-4-20250514',
 *   messages,
 *   ...getZDRHeaders(),
 * });
 * ```
 */
export function getZDRHeaders(): { headers: Record<string, string> } {
  return {
    headers: {
      [ANTHROPIC_BETA_HEADER]: ZDR_HEADER_VALUE,
    },
  };
}

/**
 * Validate that ZDR headers are properly configured
 * Use this in tests to verify compliance
 *
 * @param headers - Headers object to validate
 * @returns true if ZDR header is present and correct
 */
export function validateZDRHeaders(headers: Record<string, string>): boolean {
  return headers[ANTHROPIC_BETA_HEADER] === ZDR_HEADER_VALUE;
}

/**
 * Claude model configuration
 */
export const CLAUDE_CONFIG = {
  /** Default model for chat completions */
  model: 'claude-sonnet-4-20250514' as const,

  /** Maximum tokens for response */
  maxTokens: 4096,

  /** Temperature for response generation (0.7 = balanced creativity/consistency) */
  temperature: 0.7,

  /** Retry configuration */
  retry: {
    maxRetries: 2,
    baseDelayMs: 1000,
  },
} as const;

/**
 * Create Anthropic client configuration with ZDR enabled
 *
 * @example
 * ```typescript
 * import { createAnthropicConfig } from '@/lib/claude/zdr-config';
 * import { Anthropic } from '@anthropic-ai/sdk';
 *
 * const anthropic = new Anthropic(createAnthropicConfig());
 * ```
 */
export function createAnthropicConfig() {
  return {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    defaultHeaders: {
      [ANTHROPIC_BETA_HEADER]: ZDR_HEADER_VALUE,
    },
  };
}
