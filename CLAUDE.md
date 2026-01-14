# GZ Businessplan Generator - Project Guide

**Version:** 2.0  
**Last Updated:** 2026-01-14  
**Status:** Implementation Ready

---

## Quick Start

**New to this project? Start here:**

1. **Read this file completely** (15 minutes)
2. **Check PROGRESS.md** for current status
3. **Read SCRATCHPAD.md** for latest session context
4. **Review relevant skill files** in `/mnt/skills/user/gz-*`
5. **Start implementing** with context from above

**Resuming work?**
```bash
# Always start by reading:
view /home/claude/SCRATCHPAD.md

# Then check what was done:
git log --oneline -10

# Continue from where you left off
```

---

## Project Overview

### What We're Building

An AI-powered business plan generator for German **Gründungszuschuss (GZ)** startup grant applications. Creates BA-compliant business plans that meet **Tragfähigkeitsbescheinigung** certification requirements.

### Success Criteria

- ✅ **90%+ BA approval rate** for generated business plans
- ✅ **DSGVO-compliant** (Zero Data Retention for Claude API, EU hosting)
- ✅ **WCAG 2.2 AA accessibility** (EAA June 2025 deadline)
- ✅ **Exact financial calculations** (decimal.js, no floating point errors)
- ✅ **10-15 hour workshop completion** (vs. 40-60 hours manual)

### Core Value Proposition

**For:** Gründungszuschuss applicants (unemployed starting businesses in Germany)  
**Who:** Need BA-approved business plans for €18,000 grant  
**The Product:** AI coaching system that guides through 10 modules  
**That:** Combines evidence-based coaching (MI, CBC, SDT, AI) with financial precision  
**Unlike:** Generic business plan templates or expensive consultants  
**Our Product:** Provides personalized, BA-compliant plans at 95% cost reduction

---

## System Architecture

### High-Level Components

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERFACE                            │
│  ┌──────────────────┬──────────────────────────────────┐    │
│  │  💬 Chat Panel   │  📄 Live Document Preview        │    │
│  │  (Left/Mobile)   │  (Right/Mobile Tabs)             │    │
│  │                  │                                   │    │
│  │  - Message input │  - Module cards (13 total)       │    │
│  │  - AI streaming  │  - Progress indicators           │    │
│  │  - Coaching UI   │  - Real-time updates             │    │
│  └──────────────────┴──────────────────────────────────┘    │
│                    Canvas Pattern (Split-View)              │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   STATE MANAGEMENT                           │
│  ┌──────────┬──────────────┬─────────────┬───────────────┐  │
│  │  Jotai   │  IndexedDB   │  URL State  │  Server State │  │
│  │  Atoms   │  (Offline)   │  (nuqs)     │  (RSC)        │  │
│  └──────────┴──────────────┴─────────────┴───────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  /api/chat (Claude streaming with ZDR header)       │    │
│  │  /api/workshop/* (CRUD with RLS)                    │    │
│  │  /api/export/* (Document generation queue)          │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌───────────────────┬─────────────────┬──────────────────────┐
│    SUPABASE       │   CLAUDE API    │   SUPABASE STORAGE   │
│   (Frankfurt)     │   (Anthropic)   │   (Documents)        │
│                   │                 │                      │
│  - PostgreSQL     │  - Sonnet 4.5   │  - .docx/.pdf files  │
│  - Auth (Google)  │  - ZDR enabled  │  - User-owned only   │
│  - RLS policies   │  - Streaming    │                      │
└───────────────────┴─────────────────┴──────────────────────┘
```

### Technology Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| **Frontend** | Next.js 15 (App Router) | RSC, PPR, Vercel-optimized |
| **Language** | TypeScript (strict) | Type safety mandatory |
| **Styling** | Tailwind CSS + shadcn/ui | Utility-first, accessible |
| **State** | Jotai (atoms) | Lightweight, atomic updates |
| **Persistence** | IndexedDB (idb-keyval) | Offline-first, fast |
| **URL State** | nuqs | Type-safe query params |
| **Database** | Supabase (PostgreSQL) | EU-hosted, Auth+RLS included |
| **Auth** | Supabase Auth (Google OAuth) | DSGVO-compliant |
| **AI** | Claude Sonnet 4.5 | Best reasoning, German support |
| **AI SDK** | Vercel AI SDK | Streaming, tool calling |
| **Math** | decimal.js | Exact arithmetic (CRITICAL) |
| **Hosting** | Vercel (Frankfurt fra1) | Next.js-optimized, EU region |
| **Monitoring** | Sentry + Langfuse | Errors + LLM observability |
| **Testing** | Vitest + Playwright | Unit + E2E coverage |

---

## Workshop Modules

### The 13-Module System

| # | Module | Skill File | Duration | Dependencies |
|---|--------|-----------|----------|--------------|
| 1 | Intake & Assessment | `gz-module-01-intake-STREAMLINED.md` | 45min | None (entry point) |
| 2 | Geschäftsmodell | `gz-module-02-geschaeftsmodell-STREAMLINED.md` | 60min | 01 |
| 3 | Unternehmen | `gz-module-03-unternehmen-STREAMLINED.md` | 60min | 01, 02 |
| 4 | Markt & Wettbewerb | `gz-module-04-markt-wettbewerb-STREAMLINED.md` | 90min | 01-03 |
| 5 | Marketing | `gz-module-05-marketing-STREAMLINED.md` | 90min | 01-04 |
| 6 | Finanzplanung | `gz-module-06-finanzplanung-STREAMLINED.md` | 180min | 02-05 (CRITICAL) |
| 7 | SWOT | `gz-module-07-swot-STREAMLINED.md` | 45min | 01-06 |
| 8 | Meilensteine | `gz-module-08-meilensteine-STREAMLINED.md` | 45min | 01-07 |
| 9 | KPIs | `gz-module-09-kpi-STREAMLINED.md` | 45min | 01-08 |
| 10 | Zusammenfassung | `gz-module-10-zusammenfassung-STREAMLINED.md` | 30min | 01-09 (final) |
| 11 | Validator | `gz-validator/SKILL.md` | N/A | Cross-module checks |
| 12 | Document Generator | `gz-document-generator/SKILL.md` | N/A | Export to .docx/.pdf |
| 13 | Orchestrator | `gz-orchestrator/SKILL.md` | N/A | Master controller |

**Total Workshop Time:** 10-15 hours over 2-4 weeks

### Module Implementation Order

**CRITICAL:** Build in dependency order, not numerical order!

```
Phase 1: Foundation (No Dependencies)
└── Module 01: Intake

Phase 2: Core Business Model
├── Module 02: Geschäftsmodell (needs 01)
└── Module 03: Unternehmen (needs 01, 02)

Phase 3: Market & Marketing  
├── Module 04: Markt & Wettbewerb (needs 01-03)
└── Module 05: Marketing (needs 01-04)

Phase 4: Finance (INTEGRATION POINT)
└── Module 06: Finanzplanung (needs 02-05) ⭐ CRITICAL

Phase 5: Strategic Analysis
├── Module 07: SWOT (needs 01-06)
├── Module 08: Meilensteine (needs 01-07)
└── Module 09: KPIs (needs 01-08)

Phase 6: Synthesis
└── Module 10: Zusammenfassung (needs 01-09)

Phase 7: Infrastructure
├── Validator (cross-module checks)
├── Document Generator (.docx/.pdf export)
└── Orchestrator (state machine)
```

---

## Coaching Methodology

### Evidence-Based Frameworks

The system integrates **4 coaching methodologies** scientifically proven for behavioral change:

#### 1. Motivational Interviewing (MI)
- **When:** User shows ambivalence, resistance, overwhelm
- **How:** Express empathy, develop discrepancy, roll with resistance, support self-efficacy
- **Skill:** `gz-coaching-mi.md`
- **Used in:** 7/10 modules (most common)

#### 2. Cognitive Behavioral Coaching (CBC)
- **When:** User has limiting beliefs, unrealistic assumptions, vague statements
- **How:** Identify belief → Gather evidence → Challenge gently → Reframe → Action
- **Skill:** `gz-coaching-cbc.md`
- **Used in:** 8/10 modules (most common)

#### 3. Appreciative Inquiry (AI)
- **When:** Module start, after setbacks, building confidence
- **How:** DISCOVER strengths → DREAM ideal state → DESIGN path → DELIVER action
- **Skill:** `gz-coaching-ai.md`
- **Used in:** 3/10 modules (synthesis focus)

#### 4. Self-Determination Theory (SDT)
- **When:** Building autonomy, competence, relatedness
- **How:** Support intrinsic motivation through autonomy, mastery, purpose
- **Skill:** `gz-coaching-sdt.md`
- **Used in:** 3/10 modules

#### 5. Stage-Based Adaptation
- **When:** Intake (detecting readiness)
- **How:** Adapt approach to Precontemplation → Contemplation → Preparation → Action
- **Skill:** `gz-coaching-stage.md`
- **Used in:** Module 01, 08

### Coaching Integration Pattern

Each module loads:
1. **Always:** `gz-system-coaching-core.md` (GROW, Socratic, Clean Language)
2. **Primary:** Main methodology for that module (e.g., CBC for Module 06)
3. **Secondary:** Supporting methodology (e.g., MI for budget concerns)
4. **Tertiary:** Optional third methodology (e.g., SDT for confidence)

**Example from Module 06 (Finanzplanung):**
```yaml
always:
  - gz-system-coaching-core

contextual:
  - gz-coaching-cbc (PRIMARY)
    # Challenge unrealistic revenue, fantasy projections
    
  - gz-coaching-mi (SECONDARY)
    # Handle financial anxiety, budget constraints
    
  - gz-coaching-sdt (TERTIARY)
    # Build financial competence, autonomous decisions
```

---

## File Structure

### Current Project Layout

```
gz-businessplan-generator/
├── .git/                          # Version control
├── .gitignore                     # Git ignore rules
├── .env.local                     # Environment variables (NEVER commit)
│
├── CLAUDE.md                      # 👈 THIS FILE - Project guide
├── PROGRESS.md                    # Overall project status
├── SCRATCHPAD.md                  # Current session notes
├── PLAN.md                        # Feature architecture (created per feature)
│
├── README.md                      # Public project description
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript config
├── tailwind.config.ts             # Tailwind config
├── next.config.js                 # Next.js config
│
├── src/
│   ├── app/                       # Next.js 15 App Router
│   │   ├── layout.tsx             # Root layout
│   │   ├── page.tsx               # Homepage
│   │   ├── (auth)/                # Auth routes
│   │   ├── (workshop)/            # Workshop routes
│   │   │   ├── @chat/             # Chat panel (Parallel Route)
│   │   │   ├── @preview/          # Preview panel (Parallel Route)
│   │   │   └── layout.tsx         # Canvas Pattern layout
│   │   └── api/                   # API routes
│   │       ├── chat/              # Claude streaming endpoint
│   │       ├── workshop/          # Workshop CRUD
│   │       └── export/            # Document generation
│   │
│   ├── components/                # React components
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── chat/                  # Chat interface components
│   │   ├── preview/               # Preview panel components
│   │   └── workshop/              # Workshop-specific components
│   │
│   ├── lib/                       # Utilities
│   │   ├── supabase/              # Supabase client + helpers
│   │   ├── claude/                # Claude API integration
│   │   ├── state/                 # Jotai atoms
│   │   ├── storage/               # IndexedDB wrappers
│   │   ├── finance/               # Financial math (decimal.js)
│   │   ├── validation/            # Zod schemas + validators
│   │   ├── env.ts                 # Environment validation
│   │   └── utils.ts               # Shared utilities
│   │
│   └── types/                     # TypeScript types
│       ├── workshop.ts            # Workshop types
│       ├── modules.ts             # Module output types
│       └── database.ts            # Supabase generated types
│
├── public/                        # Static assets
│   ├── skills/                    # Skill files (copied from /mnt/skills/user/)
│   └── fonts/                     # Custom fonts
│
├── supabase/                      # Supabase project files
│   ├── migrations/                # Database migrations
│   └── seed.sql                   # Test data (dev only)
│
├── tests/                         # Test files
│   ├── unit/                      # Vitest unit tests
│   ├── integration/               # Integration tests
│   └── e2e/                       # Playwright E2E tests
│
└── scripts/                       # Automation scripts
    ├── ralph/                     # Ralph autonomous development
    │   ├── ralph.sh               # Main Ralph script
    │   └── prd.json               # Task definitions
    └── compliance/                # Compliance checks (ast-grep)
```

---

## Development Workflow

### Starting a New Feature

```bash
# 1. Read relevant context
view /mnt/skills/user/gz-[module-name]/SKILL.md
view /home/claude/SCRATCHPAD.md
view /home/claude/PROGRESS.md

# 2. Create architecture plan
# Create PLAN.md with:
# - Problem statement
# - Architecture decisions
# - API contracts
# - Database schema
# - State management approach

# 3. Break into atomic tasks
# Use /plan command in Claude Code
# OR manually break into <30k token stories

# 4. Implement incrementally
# Start with types/interfaces
# Then database schema
# Then API route
# Then UI components
# Test each layer before moving on

# 5. Update documentation
# Update PROGRESS.md with completion status
# Write SCRATCHPAD.md for next session
# Commit with descriptive message
```

### During Implementation

**DO:**
- ✅ Commit frequently with clear messages
- ✅ Run `npm run type-check` after changes
- ✅ Test in browser, not just "looks correct"
- ✅ Check Network tab for API errors
- ✅ Use decimal.js for ALL financial arithmetic
- ✅ Include `'anthropic-beta': 'zdr-2024-10-22'` header for Claude API

**DON'T:**
- ❌ Use `any` type (use `unknown` + type guards)
- ❌ Bypass RLS policies with service role key in client
- ❌ Let Claude calculate financial numbers (use decimal.js + user input)
- ❌ Create monolithic components (>300 lines means split)
- ❌ Optimize prematurely (measure first, then optimize)
- ❌ Use floating-point arithmetic for money

### Before Declaring "Done"

- [ ] Financial math validated with test cases
- [ ] Accessibility audit (keyboard nav, screen reader, ARIA labels)
- [ ] Mobile responsive (Canvas Pattern switches to tabs)
- [ ] Offline handling (queue messages, show status)
- [ ] RLS policies tested (no unauthorized data access)
- [ ] DSGVO compliance verified (no PII in logs, ZDR header)
- [ ] TypeScript strict mode errors: 0
- [ ] Tests pass (unit + integration)

---

## Critical Implementation Patterns

### 1. Financial Calculations (CRITICAL)

**NEVER use JavaScript number type for money. ALWAYS use decimal.js.**

```typescript
// ❌ WRONG - Floating point errors
const revenue = 2500.50;
const months = 12;
const annual = revenue * months; // 30006.000000000004

// ✅ CORRECT - Exact arithmetic
import Decimal from 'decimal.js';

const revenue = new Decimal('2500.50');
const months = new Decimal('12');
const annual = revenue.times(months); // 30006.00 (exact)
```

**Why this matters:**
- BA will reject plans with arithmetic errors
- Financial credibility destroyed by $0.01 discrepancies
- German regulations require exact calculations

**Compliance check:**
```bash
# NO floating point arithmetic allowed in lib/finance/*
ast-grep --lang typescript -p '$A + $B' lib/finance
ast-grep --lang typescript -p '$A * $B' lib/finance
# Both must return ZERO results
```

### 2. Claude API with Zero Data Retention (DSGVO)

```typescript
// lib/claude/stream.ts
import Anthropic from '@anthropic-ai/sdk';

export async function streamChatCompletion(messages: Message[]) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  
  return anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8000,
    system: systemPrompt, // From skill files
    messages,
    // 🔴 CRITICAL: Zero Data Retention header
    headers: {
      'anthropic-beta': 'zdr-2024-10-22',
    },
  });
}
```

**Why this matters:**
- DSGVO compliance mandatory in EU
- Users' business data is PII
- Without ZDR header, data retained 90 days
- With ZDR header, data not stored at all

**Compliance check:**
```bash
# ALL Claude API calls must have ZDR header
ast-grep --lang typescript -p 'anthropic.messages.$$$' \
  --not -p 'anthropic-beta'
# Must return ZERO results
```

### 3. Row Level Security (RLS) Policies

```typescript
// lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Public key, RLS enforced
);

// ✅ CORRECT - RLS automatically filters by user_id
const { data } = await supabase
  .from('workshops')
  .select('*');
// Returns only current user's workshops

// ❌ WRONG - Never use service role key on client
// const supabaseAdmin = createClient(url, SERVICE_ROLE_KEY);
// This bypasses RLS and exposes all users' data!
```

**RLS Policy Example:**
```sql
-- supabase/migrations/001_workshops_rls.sql
CREATE POLICY "Users can only see their own workshops"
ON workshops
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own workshops"
ON workshops
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 4. Canvas Pattern (Split-View UI)

```typescript
// src/app/(workshop)/layout.tsx
export default function WorkshopLayout({
  chat,    // From @chat parallel route
  preview, // From @preview parallel route
}: {
  chat: React.ReactNode;
  preview: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      {/* Desktop: Side-by-side */}
      <div className="hidden lg:flex w-full">
        <div className="w-1/2 border-r">{chat}</div>
        <div className="w-1/2">{preview}</div>
      </div>
      
      {/* Mobile: Tabs */}
      <div className="lg:hidden w-full">
        <Tabs defaultValue="chat">
          <TabsList>
            <TabsTrigger value="chat">💬 Chat</TabsTrigger>
            <TabsTrigger value="preview">📄 Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="chat">{chat}</TabsContent>
          <TabsContent value="preview">{preview}</TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
```

### 5. State Management (Jotai + IndexedDB)

```typescript
// lib/state/workshop.ts
import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// IndexedDB persistence (offline-first)
export const currentWorkshopAtom = atomWithStorage<Workshop | null>(
  'gz:current-workshop',
  null,
  {
    getItem: async (key) => {
      const value = await idb.get(key);
      return value ?? null;
    },
    setItem: async (key, value) => {
      await idb.set(key, value);
    },
    removeItem: async (key) => {
      await idb.del(key);
    },
  }
);

// Derived atom (current module)
export const currentModuleAtom = atom(
  (get) => {
    const workshop = get(currentWorkshopAtom);
    return workshop?.currentModule ?? 'intake';
  }
);
```

### 6. Streaming JSON Extraction

```typescript
// lib/claude/extract-json.ts
import { parsePartialJson } from 'partial-json';

export async function* extractStreamingJSON<T>(
  stream: AsyncIterable<string>
): AsyncGenerator<Partial<T>> {
  let buffer = '';
  
  for await (const chunk of stream) {
    buffer += chunk;
    
    // Try to parse incrementally
    try {
      const partial = parsePartialJson(buffer);
      if (partial) {
        yield partial as Partial<T>;
      }
    } catch {
      // Not parseable yet, continue buffering
    }
  }
  
  // Final parse
  const final = JSON.parse(buffer);
  yield final as T;
}
```

---

## Testing Strategy

### Test Pyramid

```
        ╱╲
       ╱E2E╲          Playwright: Golden path workflows
      ╱━━━━━━╲         - Complete workshop flow
     ╱Integration╲     - Auth + API + DB integration
    ╱━━━━━━━━━━━━━╲    - Cross-module validation
   ╱    Unit Tests ╲   Vitest: Business logic
  ╱━━━━━━━━━━━━━━━━━╲  - Financial calculations
 ╱  Types & Schemas  ╲ - Zod validation
╱━━━━━━━━━━━━━━━━━━━━━╲ - TypeScript strict mode
```

### Critical Test Categories

#### 1. Financial Math (RED Priority 🔴)

```typescript
// tests/unit/finance.test.ts
import { describe, it, expect } from 'vitest';
import { calculateBreakEven } from '@/lib/finance';
import Decimal from 'decimal.js';

describe('Financial Calculations', () => {
  it('calculates break-even accurately with Decimal.js', () => {
    const fixedCosts = new Decimal('2500.00');
    const variableCostPct = new Decimal('0.35');
    
    const result = calculateBreakEven(fixedCosts, variableCostPct);
    
    // Exact match, no floating point errors
    expect(result.toString()).toBe('3846.15384615384615385');
  });
  
  it('never produces floating-point errors', () => {
    // This would fail with JavaScript numbers: 0.1 + 0.2 = 0.30000000000000004
    const a = new Decimal('0.1');
    const b = new Decimal('0.2');
    const result = a.plus(b);
    
    expect(result.toString()).toBe('0.3'); // Exact
  });
});
```

#### 2. RLS Policies (RED Priority 🔴)

```sql
-- tests/integration/rls.sql
BEGIN;

-- Create test users
SELECT auth.uid() AS user_a, gen_random_uuid() AS user_b;

-- User A creates workshop
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub": "[user_a_id]"}';
INSERT INTO workshops (user_id, title) VALUES ('[user_a_id]', 'Test Workshop');

-- User B tries to access User A's workshop
SET LOCAL request.jwt.claims TO '{"sub": "[user_b_id]"}';
SELECT * FROM workshops WHERE user_id = '[user_a_id]';
-- Should return 0 rows (RLS blocks it)

ROLLBACK;
```

#### 3. Accessibility (YELLOW Priority 🟡)

```typescript
// tests/e2e/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import { injectAxe, checkA11y } from 'axe-playwright';

test('workshop page meets WCAG 2.2 AA', async ({ page }) => {
  await page.goto('/workshop/new');
  await injectAxe(page);
  
  // Check entire page
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true },
  });
  
  // Check keyboard navigation
  await page.keyboard.press('Tab');
  const focusedElement = await page.evaluate(() => document.activeElement?.tagName);
  expect(focusedElement).toBe('BUTTON'); // First interactive element
});
```

#### 4. E2E Golden Path (YELLOW Priority 🟡)

```typescript
// tests/e2e/workshop-flow.spec.ts
test('complete workshop from start to export', async ({ page }) => {
  // 1. Login
  await page.goto('/login');
  await page.getByRole('button', { name: /mit google anmelden/i }).click();
  
  // 2. Start new workshop
  await page.getByRole('button', { name: /neuer businessplan/i }).click();
  
  // 3. Module 01: Intake
  await expect(page.getByText(/intake/i)).toBeVisible();
  await page.getByRole('textbox').fill('Coaching-Service für IT-Berater');
  await page.getByRole('button', { name: /senden/i }).click();
  
  // 4. Wait for AI response
  await expect(page.getByText(/claude schreibt/i)).not.toBeVisible({ 
    timeout: 30000 
  });
  
  // 5. Verify progress
  await expect(page.getByText(/1 von 10/)).toBeVisible();
  
  // ... continue through all modules ...
  
  // 6. Export document
  await page.getByRole('button', { name: /dokument erstellen/i }).click();
  const download = await page.waitForEvent('download');
  expect(download.suggestedFilename()).toMatch(/businessplan.*\.docx$/);
});
```

---

## Compliance & Quality Gates

### Pre-Commit Checks

```bash
#!/bin/bash
# .git/hooks/pre-commit

# 1. TypeScript strict mode
npm run type-check || exit 1

# 2. Financial arithmetic check (NO floating point)
ast-grep --lang typescript -p '$A + $B' lib/finance && exit 1
ast-grep --lang typescript -p '$A * $B' lib/finance && exit 1

# 3. DSGVO compliance (ZDR header present)
ast-grep --lang typescript -p 'anthropic.messages.$$$' \
  --not -p 'anthropic-beta' && exit 1

# 4. RLS checks (user_id filters)
ast-grep --lang typescript -p '.from($TABLE)' \
  --not -p 'user_id' > /tmp/rls_check.txt
# Review manually

# 5. Accessibility (aria-labels on buttons)
ast-grep --lang tsx -p '<button $$$>' \
  --not -p 'aria-label' > /tmp/a11y_check.txt
# Review manually

echo "✅ All compliance checks passed"
```

### Deployment Checklist

Before deploying to production:

- [ ] Environment variables validated (Zod schema in `lib/env.ts`)
- [ ] Database migrations applied to production
- [ ] RLS policies tested with real user accounts
- [ ] Rate limiting configured (Upstash Redis)
- [ ] Monitoring enabled (Sentry for errors, Langfuse for LLM)
- [ ] DSGVO compliance verified:
  - [ ] ZDR header in all Claude API calls
  - [ ] No PII in application logs
  - [ ] Cookie consent banner implemented
  - [ ] Datenschutzerklärung page complete
- [ ] Accessibility audit passed (WCAG 2.2 AA)
- [ ] Financial calculations tested with real scenarios
- [ ] Backup strategy confirmed (Supabase automated backups)
- [ ] Performance budget met (<3s FCP, <5s LCP)

---

## Cost Estimates

### Development Costs (Ralph Autonomous)

```
Module Complexity Distribution:

Simple Modules (Intake, KPI, Zusammenfassung):
  5-8 user stories × 1.2 iterations × $3 = $18-30 each
  Subtotal: ~$70

Medium Modules (Marketing, SWOT, Meilensteine):
  10-15 user stories × 1.2 iterations × $3 = $36-54 each
  Subtotal: ~$180

Complex Modules (Finanzplanung, Markt, Geschäftsmodell):
  15-25 user stories × 1.2 iterations × $3 = $54-90 each
  Subtotal: ~$210

Infrastructure (Auth, Database, Canvas UI):
  ~30 user stories × 1.2 iterations × $3 = ~$90

TOTAL DEVELOPMENT: $450-650
Traditional contractor cost: $50,000-100,000
SAVINGS: 99%+
```

### Operational Costs (Monthly)

```
At 100 users creating 2 business plans each:

Claude API (with prompt caching):
  - Cost per plan: $0.65-1.00
  - Monthly: 200 plans × $0.85 = $170

Supabase Pro (€25/month):
  - PostgreSQL database (Frankfurt)
  - Authentication (Google OAuth)
  - Storage (generated documents)
  - RLS policies

Vercel:
  - Free tier sufficient for MVP
  - Upgrade to Pro ($20/month) if >100k requests

Sentry (Developer tier: $26/month):
  - Error tracking
  - Performance monitoring

Upstash Redis (Free tier):
  - Rate limiting
  - Caching

TOTAL: ~$200-250/month for 200 plans
Cost per plan: ~$1.00-1.25
```

---

## Ralph Autonomous Development

### What is Ralph?

**Ralph** is an autonomous development loop where Claude implements features from detailed PRDs without human intervention. Think: "Tell Claude what to build, go to sleep, wake up to completed feature."

### How to Use Ralph

```bash
# 1. Create detailed PRD
view /mnt/skills/user/gz-kpi/SKILL.md
# Write PLAN.md with:
# - Exact requirements
# - TypeScript interfaces
# - Acceptance criteria
# - Test scenarios

# 2. Convert to atomic tasks
# Break into <30k token user stories
# Each story = 1 file or 1 function or 1 component
# Write to scripts/ralph/prd.json

# 3. Run Ralph (autonomous execution)
cd scripts/ralph
./ralph.sh 25  # Run up to 25 iterations

# 4. Review results
git log --oneline -20
# Check commits, run tests, manual QA
# Fix any issues, update PROGRESS.md
```

### Ralph Best Practices

**DO:**
- ✅ Spend 60-90 minutes on detailed PRD (quality in = quality out)
- ✅ Include TypeScript interfaces in PRD
- ✅ Write specific acceptance criteria with test scenarios
- ✅ Break into atomic stories (<30k tokens each)
- ✅ Let Ralph run overnight for complex modules

**DON'T:**
- ❌ Rush the PRD (garbage in = garbage out)
- ❌ Create vague acceptance criteria ("make it work")
- ❌ Mix multiple concerns in one story
- ❌ Expect Ralph to make architecture decisions

### When to Use Ralph vs. Manual

| Task Type | Approach | Why |
|-----------|----------|-----|
| **Architecture** | Manual | Requires judgment, trade-offs |
| **Complex Modules** | Hybrid | Manual architecture, Ralph implementation |
| **Simple Modules** | Ralph | Clear criteria, repetitive logic |
| **Testing** | Ralph | Perfect for test generation |
| **Refactoring** | Ralph | Well-defined transformations |
| **Debugging** | Manual | Requires investigation, hypothesis testing |

---

## Context Management

### The 30-40% Rule

**Context quality degrades at 30-40% usage, NOT at 80%:**

```
 0-30%  token usage: ✅ Full quality, all details remembered
30-40%  token usage: ⚠️  Quality degrading, details forgotten
40-60%  token usage: 🔴 Significant loss, errors increase
60%+    token usage: ☠️  Context chaos, unusable
```

**Solution:** Use external memory files as primary context.

### External Memory Files

```
project-root/
├── CLAUDE.md         # Project guide (read on session start)
├── SCRATCHPAD.md     # Current session state (update every hour)
├── PLAN.md           # Feature architecture (created per feature)
└── PROGRESS.md       # Overall project status (update after milestones)
```

### Session Start Protocol

```bash
# ALWAYS start sessions by reading:
1. view /home/claude/SCRATCHPAD.md    # What was I doing?
2. view /home/claude/PROGRESS.md      # Where is the project?
3. git log --oneline -10              # What changed recently?

# Then ask yourself:
# - What's the next logical step?
# - What context do I need?
# - Which skill files should I read?
```

### Session End Protocol

```bash
# ALWAYS end sessions by writing to SCRATCHPAD.md:

## Session Summary (2026-01-14, 14:30)

**Completed:**
- Implemented Module 06 TypeScript types
- Created database migration for finanzplanung_data table
- Added Zod validation schemas

**In Progress:**
- Module 06 API route (50% done)
- Need to add decimal.js integration
- Tests pending

**Next Steps:**
1. Complete /api/workshop/[id]/finanzplanung route
2. Integrate decimal.js for calculations
3. Write unit tests for break-even calculation
4. Test with real workshop data

**Blockers:**
- None

**Notes:**
- Remember to use Decimal.js for ALL arithmetic
- ZDR header must be in Claude API call
- User story FP-005 has acceptance criteria in prd.json
```

---

## Common Pitfalls & Solutions

### 1. Floating Point Errors

**Problem:** Using JavaScript numbers for financial calculations
```typescript
// ❌ WRONG
const revenue = 2500.50 * 12; // 30006.000000000004
```

**Solution:** Use decimal.js
```typescript
// ✅ CORRECT
import Decimal from 'decimal.js';
const revenue = new Decimal('2500.50').times(12); // 30006.00
```

### 2. RLS Policy Bypass

**Problem:** Using service role key on client side
```typescript
// ❌ WRONG
const supabase = createClient(url, SERVICE_ROLE_KEY);
// Exposes all users' data!
```

**Solution:** Use anon key, let RLS filter
```typescript
// ✅ CORRECT
const supabase = createClient(url, ANON_KEY);
// RLS automatically filters by auth.uid()
```

### 3. Missing ZDR Header

**Problem:** Claude API call without Zero Data Retention
```typescript
// ❌ WRONG
await anthropic.messages.create({ model, messages });
// User data retained 90 days!
```

**Solution:** Add ZDR header
```typescript
// ✅ CORRECT
await anthropic.messages.create({
  model,
  messages,
  headers: { 'anthropic-beta': 'zdr-2024-10-22' },
});
```

### 4. Monolithic Components

**Problem:** 800-line React component with mixed concerns
```typescript
// ❌ WRONG
function GiantWorkshopPage() {
  // 800 lines of everything
}
```

**Solution:** Split by concern
```typescript
// ✅ CORRECT
function WorkshopPage() {
  return (
    <>
      <WorkshopHeader />
      <ChatPanel />
      <PreviewPanel />
      <WorkshopFooter />
    </>
  );
}
```

### 5. Premature Optimization

**Problem:** Optimizing before measuring
```typescript
// ❌ WRONG
// "Let me add React.memo everywhere just in case"
```

**Solution:** Measure first, optimize bottlenecks
```typescript
// ✅ CORRECT
// 1. Use React DevTools Profiler to find slow components
// 2. Optimize only those components
// 3. Verify improvement with measurements
```

---

## Deployment

### Environment Setup

```bash
# Production environment variables (Vercel)
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon_key]
ANTHROPIC_API_KEY=[api_key]
UPSTASH_REDIS_REST_URL=[redis_url]
UPSTASH_REDIS_REST_TOKEN=[redis_token]
SENTRY_DSN=[sentry_dsn]
LANGFUSE_PUBLIC_KEY=[langfuse_key]
LANGFUSE_SECRET_KEY=[langfuse_secret]
```

### Vercel Deployment

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Link project
vercel link

# 3. Deploy to preview
vercel

# 4. Deploy to production
vercel --prod

# 5. Verify deployment
curl https://gz-businessplan.vercel.app/api/health
# Should return: { "status": "ok", "version": "1.0.0" }
```

### Database Migrations

```bash
# Apply migrations to production
npx supabase db push --db-url [production_db_url]

# Verify RLS policies
npx supabase db test --db-url [production_db_url]
```

---

## Monitoring & Observability

### Sentry (Error Tracking)

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  
  // Don't send PII to Sentry
  beforeSend(event, hint) {
    // Remove user email, IP address
    delete event.user?.email;
    delete event.user?.ip_address;
    return event;
  },
});
```

### Langfuse (LLM Observability)

```typescript
// lib/claude/observability.ts
import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
});

export async function trackChatCompletion(
  messages: Message[],
  response: string,
  metadata: Record<string, any>
) {
  const trace = langfuse.trace({
    name: 'chat-completion',
    metadata,
  });
  
  trace.generation({
    name: 'claude-sonnet-4',
    model: 'claude-sonnet-4-20250514',
    input: messages,
    output: response,
    usage: metadata.usage,
  });
}
```

---

## Key Principles (Review Regularly)

1. **BA compliance first** - Beautiful UI means nothing if the plan gets rejected
2. **Context is precious** - Keep tasks narrow, use external memory files
3. **Local-first** - IndexedDB → then sync to Supabase
4. **Type safety** - Zod at boundaries, strict TypeScript everywhere
5. **Accessibility matters** - EAA June 2025 requires WCAG 2.2 AA
6. **No AI math** - decimal.js for ALL financial calculations
7. **DSGVO by design** - Zero Data Retention, no PII in logs
8. **Skills over guessing** - Read the skill files, they encode hard-won lessons
9. **Measure, then optimize** - Profile before performance work
10. **Ship incrementally** - Working module beats perfect architecture

---

## Quick Reference

### Essential Commands

```bash
# Start development server
npm run dev

# Type checking
npm run type-check

# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Compliance checks
npm run compliance:financial    # Check for floating point
npm run compliance:dsgvo        # Check for ZDR header
npm run compliance:rls          # Check for RLS policies
npm run compliance:a11y         # Check accessibility
```

### Essential Files to Read

**Before starting work:**
1. This file (`CLAUDE.md`)
2. `SCRATCHPAD.md` (current session context)
3. `PROGRESS.md` (overall status)
4. Relevant skill file from `/mnt/skills/user/gz-*`

**Architecture decisions:**
- `PLAN.md` (feature-specific)
- `GZ_DEVELOPMENT_STRATEGY.md` (/mnt/project)
- `GZ_PRODUCT_REQUIREMENTS_DOCUMENT.md` (/mnt/project)

**Technical details:**
- `gz-tech-frontend/SKILL.md` (UI patterns)
- `gz-tech-backend/SKILL.md` (API patterns)
- `gz-tech-database/SKILL.md` (Schema + RLS)

---

**Version:** 2.0  
**Last Updated:** 2026-01-14  
**Status:** Production Ready ✅

---

**Remember:** This is a living document. Update it as the project evolves. Every major decision, pattern, or lesson learned should be captured here for future reference.