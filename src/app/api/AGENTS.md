# API Routes - AGENTS.md

> This file accumulates learnings about API routes in the GZ project.
> Update this file whenever you discover important patterns or gotchas.

**Last Updated:** 2026-01-19

---

## Critical Rule: DSGVO Compliance

### Zero Data Retention (ZDR) Header

**ALL Claude API calls MUST include this header:**

```typescript
headers: {
  'anthropic-beta': 'zdr-2024-10-22'
}
```

**Why:**
- DSGVO compliance mandatory in EU
- Without header: User data retained 90 days
- With header: Data not stored at all
- User business plans contain PII

### Verification

```bash
# Must find ZDR header in all Claude API routes
grep -r "zdr-2024-10-22" src/app/api/
```

---

## Claude Streaming Pattern

### Basic Setup

```typescript
// app/api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk';
import { StreamingTextResponse } from 'ai';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { messages, moduleId } = await request.json();

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: getSystemPrompt(moduleId),
    messages,
  }, {
    headers: {
      'anthropic-beta': 'zdr-2024-10-22',  // CRITICAL!
    },
  });

  return new StreamingTextResponse(stream.toReadableStream());
}
```

### With Vercel AI SDK

```typescript
import { streamText } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = await streamText({
    model: anthropic('claude-sonnet-4-20250514'),
    messages,
    headers: {
      'anthropic-beta': 'zdr-2024-10-22',
    },
  });

  return result.toDataStreamResponse();
}
```

---

## Authentication Pattern

### Verify User Session

```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return Response.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // User is authenticated
  // RLS policies will filter by user.id automatically
}
```

---

## Row Level Security (RLS)

### Why RLS Matters

```typescript
// ✗ WRONG - Exposes all users' data
const supabase = createClient(url, SERVICE_ROLE_KEY);
const { data } = await supabase.from('workshops').select('*');

// ✓ CORRECT - RLS filters automatically
const supabase = createClient(); // Uses anon key
const { data } = await supabase.from('workshops').select('*');
// Only returns current user's workshops
```

### Server-Side with User Context

```typescript
// createClient() in server context uses cookies
// which contain the user's session token
// RLS policies check auth.uid() against user_id

const supabase = createClient();
const { data } = await supabase
  .from('workshops')
  .select('*')
  .eq('id', workshopId);
// RLS ensures user can only access their own workshop
```

---

## Error Handling

### Standard Error Response

```typescript
interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
}

function errorResponse(
  message: string,
  status: number,
  code?: string
): Response {
  return Response.json(
    { error: message, code } satisfies ApiError,
    { status }
  );
}

// Usage
if (!user) {
  return errorResponse('Unauthorized', 401, 'AUTH_REQUIRED');
}
```

### Try-Catch Pattern

```typescript
export async function POST(request: Request) {
  try {
    // ... implementation
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof z.ZodError) {
      return errorResponse('Validation failed', 400, 'VALIDATION_ERROR');
    }

    return errorResponse('Internal server error', 500);
  }
}
```

---

## Input Validation

### Zod Schemas

```typescript
import { z } from 'zod';

const ChatRequestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string().min(1).max(10000),
  })),
  moduleId: z.enum([
    'intake',
    'geschaeftsmodell',
    // ... all module IDs
  ]),
  workshopId: z.string().uuid(),
});

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = ChatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return errorResponse('Invalid request body', 400);
  }

  const { messages, moduleId, workshopId } = parsed.data;
  // ... continue with validated data
}
```

---

## Rate Limiting

### With Upstash Redis

```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
  const { success, limit, reset, remaining } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }

  // ... continue
}
```

---

## Gotchas

### 1. Never Log PII

```typescript
// ✗ WRONG - Logs user data
console.log('User message:', message.content);

// ✓ CORRECT - Log metadata only
console.log('Processing message', {
  moduleId,
  workshopId,
  messageLength: message.content.length
});
```

### 2. Handle Streaming Errors

```typescript
// Wrap stream in try-catch for error handling
try {
  const stream = await anthropic.messages.stream({...});
  return new StreamingTextResponse(stream.toReadableStream());
} catch (error) {
  if (error.status === 429) {
    return errorResponse('Rate limited by Claude API', 429);
  }
  throw error;
}
```

### 3. Timeout Handling

```typescript
// Set timeout for long-running operations
export const maxDuration = 60; // seconds (Vercel config)
```

---

## Learnings Log

### 2026-01-19: Initial Setup

- Documented ZDR header requirement
- Established authentication pattern
- Created error handling conventions
