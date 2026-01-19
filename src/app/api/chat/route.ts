import { NextRequest, NextResponse } from 'next/server';
import { Anthropic } from '@anthropic-ai/sdk';
import { z } from 'zod';
import { createClient } from '@/root-lib/supabase/server';
import {
  getContextualPrompt,
  buildIntakePhasePrompt,
  buildGeschaeftsmodellPhasePrompt,
  type GZModule,
} from '@/lib/prompts/prompt-loader';
import { chatRateLimiter, createRateLimitHeaders, createRateLimitError } from '@/lib/rate-limit';
import { createAnthropicConfig, getZDRHeaders, CLAUDE_CONFIG } from '@/lib/claude/zdr-config';
import { IntakePhase as IntakePhaseSchema } from '@/types/modules/intake';
import { GeschaeftsmodellPhase as GeschaeftsmodellPhaseSchema } from '@/types/modules/geschaeftsmodell';

// Initialize Anthropic client with ZDR (Zero Data Retention) headers for GDPR compliance
const anthropic = new Anthropic(createAnthropicConfig());

// Zod schema for request validation
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, 'Message content cannot be empty'),
});

const IntakeContextSchema = z.object({
  elevatorPitch: z.string().optional(),
  problem: z.string().optional(),
  solution: z.string().optional(),
  targetAudience: z.string().optional(),
}).optional();

const ChatRequestSchema = z.object({
  messages: z.array(MessageSchema).min(1, 'At least one message is required'),
  workshopId: z.string().uuid().optional(),
  currentModule: z.string().optional(),
  phase: z.enum(['intake', 'module', 'validation', 'document']).default('module'),
  includeCoaching: z.boolean().default(true),
  // Phase-locked intake support - use actual IntakePhase enum
  intakePhase: IntakePhaseSchema.optional(),
  previousPhaseData: z.record(z.unknown()).optional(),
  // Phase-locked geschaeftsmodell support (Module 02) - use actual GeschaeftsmodellPhase enum
  geschaeftsmodellPhase: GeschaeftsmodellPhaseSchema.optional(),
  previousGeschaeftsmodellData: z.record(z.unknown()).optional(),
  // Context from previous modules
  intakeContext: IntakeContextSchema,
  // Coaching state for quality tracking
  coachingState: z.record(z.unknown()).optional(),
});

type ChatRequestBody = z.infer<typeof ChatRequestSchema>;

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

    // 3. Parse and validate request body with Zod
    let body: ChatRequestBody;
    try {
      const rawBody = await request.json();
      body = ChatRequestSchema.parse(rawBody);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: 'Invalid request body',
            details: error.errors.map(e => ({
              path: e.path.join('.'),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const {
      messages,
      workshopId,
      currentModule,
      phase,
      includeCoaching,
      intakePhase,
      previousPhaseData,
      geschaeftsmodellPhase,
      previousGeschaeftsmodellData,
      intakeContext,
    } = body;

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
      // Check if this is a phase-locked request
      const effectiveModule = body.currentModule || 'gz-intake';
      const isIntakeModule = effectiveModule === 'gz-intake';
      const isGeschaeftsmodellModule = effectiveModule === 'gz-geschaeftsmodell';

      if (isIntakeModule && intakePhase) {
        // Use phase-specific prompt for intake module
        systemPrompt = await buildIntakePhasePrompt(intakePhase, {
          includeCoaching,
          previousPhaseData,
        });
        console.log(`[Chat API] Loaded phase-specific prompt for intake phase: ${intakePhase}`);
      } else if (isGeschaeftsmodellModule && geschaeftsmodellPhase) {
        // Use phase-specific prompt for geschaeftsmodell module (Module 02)
        systemPrompt = await buildGeschaeftsmodellPhasePrompt(geschaeftsmodellPhase, {
          includeCoaching,
          previousPhaseData: previousGeschaeftsmodellData,
          intakeData: intakeContext,
        });
        console.log(`[Chat API] Loaded phase-specific prompt for geschaeftsmodell phase: ${geschaeftsmodellPhase}`);
      } else {
        // Use standard contextual prompt (backward compatible)
        systemPrompt = await getContextualPrompt({
          currentModule: body.currentModule,
          phase,
          includeCoaching,
        });
      }
    } catch (error) {
      console.error('Failed to load system prompt:', error);
      return NextResponse.json(
        { error: 'Failed to load system configuration' },
        { status: 500 }
      );
    }

    // 6. Create streaming response with retry logic
    // CRITICAL: ZDR headers are set in the Anthropic client via createAnthropicConfig()
    // This ensures GDPR/DSGVO compliance - user data is NOT retained by Anthropic
    let stream;
    let retries = 0;
    const { maxRetries, baseDelayMs } = CLAUDE_CONFIG.retry;

    while (retries <= maxRetries) {
      try {
        stream = await anthropic.messages.stream({
          model: CLAUDE_CONFIG.model,
          max_tokens: CLAUDE_CONFIG.maxTokens,
          temperature: CLAUDE_CONFIG.temperature,
          system: systemPrompt,
          messages: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
          // Explicit ZDR headers for this request (redundant with client defaults, but explicit is better)
          ...getZDRHeaders(),
        });
        break; // Success, exit retry loop
      } catch (error) {
        retries++;
        if (retries > maxRetries) {
          throw error; // Re-throw after max retries
        }
        console.warn(`Retry ${retries}/${maxRetries} after error:`, error);
        await new Promise(resolve => setTimeout(resolve, baseDelayMs * retries)); // Exponential backoff
      }
    }

    if (!stream) {
      throw new Error('Failed to create stream after retries');
    }

    // 7. Set up headers for streaming response
    // Note: ZDR headers are sent TO Claude API (in step 6), not in response to client
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
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
