/**
 * Chat API Types for GZ Businessplan Generator
 */

import type { GZModule } from '@/lib/prompts/prompt-loader';
import type { IntakePhase, PartialIntakeOutput } from '@/types/modules/intake';
import type { GeschaeftsmodellPhase, PartialGeschaeftsmodellOutput } from '@/types/modules/geschaeftsmodell';

/**
 * Union type for module data that can be passed to API
 */
export type ModuleData = PartialIntakeOutput | PartialGeschaeftsmodellOutput | null;

/**
 * Message format for chat
 */
export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

/**
 * Request body for /api/chat
 */
export interface ChatRequest {
  messages: ChatMessage[];
  workshopId?: string;
  currentModule?: GZModule;
  phase?: 'intake' | 'module' | 'validation' | 'document';
  includeCoaching?: boolean;
  // Phase-locked intake support
  intakePhase?: IntakePhase;
  // Geschaeftsmodell phase support
  geschaeftsmodellPhase?: GeschaeftsmodellPhase;
  // Module data from previous phases (union type for all modules)
  previousPhaseData?: ModuleData;
}

/**
 * Streaming event types
 */
export type StreamEventType = 'start' | 'text' | 'json' | 'done' | 'error';

/**
 * Base stream event
 */
export interface StreamEvent {
  type: StreamEventType;
}

/**
 * Start event (metadata about the stream)
 */
export interface StartEvent extends StreamEvent {
  type: 'start';
  model: string;
  role: string;
}

/**
 * Text chunk event
 */
export interface TextEvent extends StreamEvent {
  type: 'text';
  text: string;
  fullText: string; // Accumulated text so far
}

/**
 * JSON extraction event (parsed structured data)
 */
export interface JSONEvent extends StreamEvent {
  type: 'json';
  data: Record<string, any>;
  isComplete: boolean; // Whether JSON parsing is complete
}

/**
 * Completion event
 */
export interface DoneEvent extends StreamEvent {
  type: 'done';
  fullText: string;
}

/**
 * Error event
 */
export interface ErrorEvent extends StreamEvent {
  type: 'error';
  error: string;
}

/**
 * Union type of all stream events
 */
export type ChatStreamEvent = 
  | StartEvent 
  | TextEvent 
  | JSONEvent 
  | DoneEvent 
  | ErrorEvent;

/**
 * Error response from API
 */
export interface ChatErrorResponse {
  error: string;
  message?: string;
  status?: number;
}

/**
 * Rate limit headers
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Parse rate limit info from response headers
 */
export function parseRateLimitHeaders(headers: Headers): RateLimitInfo | null {
  const limit = headers.get('X-RateLimit-Limit');
  const remaining = headers.get('X-RateLimit-Remaining');
  const reset = headers.get('X-RateLimit-Reset');

  if (!limit || !remaining || !reset) {
    return null;
  }

  return {
    limit: parseInt(limit, 10),
    remaining: parseInt(remaining, 10),
    reset: parseInt(reset, 10),
  };
}
