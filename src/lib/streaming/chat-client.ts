import { StreamParser } from './parser';
import type {
  ChatRequest,
  ChatErrorResponse,
  RateLimitInfo,
} from '@/types/chat';

/**
 * Callback types for streaming events
 */
export interface StreamCallbacks {
  onStart?: (data: { model: string; role: string }) => void;
  onText?: (data: { text: string; fullText: string }) => void;
  onJSON?: (data: { json: any; isComplete: boolean; fullText: string }) => void;
  onDone?: (data: { fullText: string }) => void;
  onError?: (error: string) => void;
  onRateLimit?: (info: RateLimitInfo) => void;
}

/**
 * Chat streaming client
 */
export class ChatClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api/chat') {
    this.baseUrl = baseUrl;
  }

  /**
   * Send a chat message and stream the response
   */
  async stream(
    request: ChatRequest,
    callbacks: StreamCallbacks
  ): Promise<void> {
    const parser = new StreamParser();

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      // Check for rate limiting
      const rateLimitHeader = response.headers.get('X-RateLimit-Remaining');
      if (rateLimitHeader !== null && callbacks.onRateLimit) {
        callbacks.onRateLimit({
          limit: parseInt(
            response.headers.get('X-RateLimit-Limit') || '10',
            10
          ),
          remaining: parseInt(rateLimitHeader, 10),
          reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0', 10),
        });
      }

      // Handle non-OK responses
      if (!response.ok) {
        const error: ChatErrorResponse = await response.json();
        callbacks.onError?.(error.error || 'Request failed');
        return;
      }

      // Handle streaming response
      if (!response.body) {
        callbacks.onError?.('No response body');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const events = parser.parseChunk(chunk);

        for (const event of events) {
          switch (event.type) {
            case 'start':
              callbacks.onStart?.(event.data);
              break;

            case 'text':
              callbacks.onText?.({
                text: event.data.text,
                fullText: event.data.fullText || parser.getFullText(),
              });
              break;

            case 'json':
              callbacks.onJSON?.({
                json: event.data.json,
                isComplete: event.data.jsonComplete,
                fullText: event.data.fullText || parser.getFullText(),
              });
              break;

            case 'done':
              callbacks.onDone?.({
                fullText: event.data.fullText || parser.getFullText(),
              });
              break;

            case 'error':
              callbacks.onError?.(event.data.error || 'Stream error');
              break;
          }
        }
      }
    } catch (error) {
      console.error('Chat stream error:', error);
      callbacks.onError?.(
        error instanceof Error ? error.message : 'Network error'
      );
    }
  }

  /**
   * Send a single message (convenience method)
   */
  async sendMessage(
    message: string,
    options: Partial<Omit<ChatRequest, 'messages'>> = {},
    callbacks: StreamCallbacks
  ): Promise<void> {
    const request: ChatRequest = {
      messages: [{ role: 'user', content: message }],
      ...options,
    };

    return this.stream(request, callbacks);
  }

  /**
   * Continue a conversation with message history
   */
  async continueConversation(
    messages: ChatRequest['messages'],
    options: Partial<Omit<ChatRequest, 'messages'>> = {},
    callbacks: StreamCallbacks
  ): Promise<void> {
    const request: ChatRequest = {
      messages,
      ...options,
    };

    return this.stream(request, callbacks);
  }
}

/**
 * Create a default chat client instance
 */
export const chatClient = new ChatClient();

/**
 * Utility: Convert callbacks to Promise (for simpler usage)
 */
export function streamToPromise(
  request: ChatRequest,
  client: ChatClient = chatClient
): Promise<{ fullText: string; json: any[] }> {
  return new Promise((resolve, reject) => {
    const jsonBlocks: any[] = [];
    let fullText = '';

    client.stream(request, {
      onText: (data) => {
        fullText = data.fullText;
      },
      onJSON: (data) => {
        if (data.isComplete) {
          jsonBlocks.push(data.json);
        }
      },
      onDone: () => {
        resolve({ fullText, json: jsonBlocks });
      },
      onError: (error) => {
        reject(new Error(error));
      },
    });
  });
}
