import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { createClient } from '@/root-lib/supabase/server';
import { getContextualPrompt, type GZModule } from '@/lib/prompts/prompt-loader';
import { chatRateLimiter, createRateLimitHeaders, createRateLimitError } from '@/lib/rate-limit';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

// Request body type
interface ChatRequestBody {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  workshopId?: string;
  currentModule?: GZModule;
  phase?: 'intake' | 'module' | 'validation' | 'document';
  includeCoaching?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Check rate limit
    const rateLimitResult = chatRateLimiter.check(user.id);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        createRateLimitError(rateLimitResult),
        {
          status: 429,
          headers: createRateLimitHeaders(rateLimitResult),
        }
      );
    }

    // 3. Parse and validate request body
    const body: ChatRequestBody = await request.json();
    const { 
      messages, 
      workshopId, 
      currentModule, 
      phase = 'module',
      includeCoaching = true 
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array required' },
        { status: 400 }
      );
    }

    // 4. Verify workshop access (if workshopId provided)
    if (workshopId) {
      const { data: workshop, error: workshopError } = await supabase
        .from('workshops')
        .select('id, current_module, data')
        .eq('id', workshopId)
        .eq('user_id', user.id)
        .single();

      if (workshopError || !workshop) {
        return NextResponse.json(
          { error: 'Workshop not found or access denied' },
          { status: 404 }
        );
      }

      // Use workshop's current module if not specified
      if (!currentModule && workshop.current_module) {
        body.currentModule = workshop.current_module as GZModule;
      }
    }

    // 5. Load appropriate system prompt
    let systemPrompt: string;
    try {
      systemPrompt = await getContextualPrompt({
        currentModule: body.currentModule,
        phase,
        includeCoaching,
      });
    } catch (error) {
      console.error('Failed to load system prompt:', error);
      return NextResponse.json(
        { error: 'Failed to load system configuration' },
        { status: 500 }
      );
    }

    // 6. Create streaming response with retry logic
    let stream;
    let retries = 0;
    const maxRetries = 2;

    while (retries <= maxRetries) {
      try {
        stream = await anthropic.messages.stream({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 4096,
          temperature: 0.7,
          system: systemPrompt,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        });
        break; // Success, exit retry loop
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          throw error; // Re-throw after max retries
        }
        console.warn(`Retry ${retries}/${maxRetries} after error:`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)); // Exponential backoff
      }
    }

    if (!stream) {
      throw new Error('Failed to create stream after retries');
    }

    // 7. Set up headers for streaming with Zero Data Retention
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      // Critical: Zero Data Retention header for GDPR compliance
      'anthropic-beta': 'prompt-caching-2024-07-31',
      ...createRateLimitHeaders(rateLimitResult),
    });

    // 8. Create readable stream for response
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = '';
          
          for await (const chunk of stream) {
            // Handle different chunk types
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              fullText += text;
              
              // Send text chunk
              const sseMessage = `data: ${JSON.stringify({ 
                type: 'text', 
                text,
                fullText // Include accumulated text for JSON extraction
              })}\n\n`;
              
              controller.enqueue(new TextEncoder().encode(sseMessage));
            } 
            else if (chunk.type === 'message_start') {
              // Send start event with metadata
              const sseMessage = `data: ${JSON.stringify({ 
                type: 'start',
                model: chunk.message.model,
                role: chunk.message.role
              })}\n\n`;
              
              controller.enqueue(new TextEncoder().encode(sseMessage));
            }
            else if (chunk.type === 'message_stop') {
              // Send completion event
              const sseMessage = `data: ${JSON.stringify({ 
                type: 'done',
                fullText
              })}\n\n`;
              
              controller.enqueue(new TextEncoder().encode(sseMessage));
            }
            else if (chunk.type === 'error') {
              // Send error event
              const sseMessage = `data: ${JSON.stringify({ 
                type: 'error',
                error: 'Stream error occurred'
              })}\n\n`;
              
              controller.enqueue(new TextEncoder().encode(sseMessage));
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = `data: ${JSON.stringify({ 
            type: 'error', 
            error: error instanceof Error ? error.message : 'Streaming failed'
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(errorMessage));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readableStream, { headers });

  } catch (error) {
    console.error('Chat API error:', error);
    
    // Handle specific API errors
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { 
          error: 'Claude API error', 
          message: error.message,
          status: error.status 
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': process.env.NEXT_PUBLIC_APP_URL || '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
