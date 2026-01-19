# AGENTS.md - Long-Term Learning Repository

> "Anytime we see Claude do something incorrectly we add it to the AGENTS.md, so Claude knows not to do it next time."
> — Boris Cherny, Creator of Claude Code

**Purpose:** This file accumulates learnings across all development sessions. Update it whenever you discover something that future Claude instances should know.

**Last Updated:** 2026-01-19

---

## Critical Learnings (Read First)

### 1. Financial Calculations MUST Use decimal.js

**The Problem:**
```typescript
// JavaScript floating-point error
0.1 + 0.2 = 0.30000000000000004

// In financial context:
2500.50 * 12 = 30006.000000000004
```

**Why It Matters:**
- BA officials reject plans with arithmetic errors
- €0.01 discrepancy destroys credibility
- German regulations require exact calculations

**The Solution:**
```typescript
import Decimal from 'decimal.js';

const amount = new Decimal('2500.50');
const months = new Decimal('12');
const annual = amount.times(months); // 30006.00 (exact)
```

**Verification:**
```bash
ast-grep --lang typescript -p '$A + $B' src/lib/finance
# Must return ZERO matches
```

---

### 2. Claude API Requires ZDR Header

**The Problem:**
Without Zero Data Retention header, user business data is retained for 90 days, violating DSGVO.

**The Solution:**
```typescript
const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-20250514',
  messages,
  // CRITICAL: Zero Data Retention
}, {
  headers: {
    'anthropic-beta': 'zdr-2024-10-22'
  }
});
```

**Verification:**
```bash
grep -r "zdr-2024-10-22" src/app/api/
# Must find header in all Claude API routes
```

---

### 3. German Number Formatting

**The Pattern:**
- German: `1.234,56 €` (dot for thousands, comma for decimals)
- US/UK: `€1,234.56`

**Implementation:**
```typescript
function formatEUR(amount: Decimal): string {
  return amount.toNumber().toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR'
  });
}
```

---

## Patterns That Work

### State Management (Jotai + IndexedDB)

```typescript
// Atom with IndexedDB persistence
export const workshopAtom = atomWithStorage<Workshop | null>(
  'gz:workshop',
  null,
  createIDBStorage()
);
```

**Why:** Offline-first, instant UI updates, automatic persistence.

---

### Canvas Pattern (Split-View)

```typescript
// Desktop: side-by-side
// Mobile: tabs
<div className="flex h-screen">
  <div className="hidden lg:flex lg:w-1/2">{chat}</div>
  <div className="hidden lg:flex lg:w-1/2">{preview}</div>
  <div className="lg:hidden">
    <Tabs>...</Tabs>
  </div>
</div>
```

---

### Streaming JSON Extraction

```typescript
import { parsePartialJson } from 'partial-json';

// Incrementally parse JSON as it streams
for await (const chunk of stream) {
  buffer += chunk;
  const partial = parsePartialJson(buffer);
  if (partial) yield partial;
}
```

---

## Patterns That Failed

### Using `any` Type

**What Happened:** TypeScript errors hidden, runtime bugs in production.

**Lesson:** Use `unknown` with type guards instead:
```typescript
function isWorkshop(data: unknown): data is Workshop {
  return typeof data === 'object' && data !== null && 'id' in data;
}
```

---

### Premature Optimization

**What Happened:** Added React.memo everywhere "just in case", increased code complexity without measurable benefit.

**Lesson:** Profile first with React DevTools, then optimize specific bottlenecks.

---

### Monolithic Components

**What Happened:** 800-line component became unmaintainable.

**Lesson:** Split at 300 lines max. Each component = one responsibility.

---

## Module-Specific Learnings

### Module 01: Intake

- Stage-based coaching (Precontemplation → Action) required
- Red flag detection for unrealistic expectations
- Must capture business type for routing logic

### Module 02: Geschäftsmodell

- Business Model Canvas structure expected
- Value proposition must be clear and specific
- Revenue streams tie to Module 06 calculations

### Module 06: Finanzplanung

- €50k GZ scenario is the gold standard test
- Break-even calculation must be exact
- 3-year projections required (36 months)
- German tax considerations (Einkommensteuer, Umsatzsteuer)

---

## Common Mistakes to Avoid

| Mistake | Consequence | Prevention |
|---------|-------------|------------|
| Floating-point math | BA rejection | Always decimal.js |
| Missing ZDR header | DSGVO violation | Check every API call |
| No aria-labels | Accessibility failure | Audit before commit |
| Service role key on client | Data breach | Only anon key client-side |
| Skipping skill files | Reinventing solutions | Read skill before implementing |

---

## Testing Wisdom

### The €50k GZ Test Scenario

Standard test case for financial calculations:
- Gründungszuschuss: €18,000 (6 × €3,000)
- Startup costs: €15,000
- Monthly expenses: €2,500
- Month 1 revenue: €1,000
- Monthly growth: 15%

All calculations must match manual verification.

---

### Accessibility Testing Checklist

1. Tab through entire page - can you reach everything?
2. Is focus indicator visible?
3. Does screen reader announce correctly?
4. Is color contrast ≥ 4.5:1?
5. Can you use without mouse?

---

## Session Notes

### 2026-01-19: Boris + Ryan Setup Integration

- Installed slash commands for inner loop automation
- Created subagents for specialized tasks
- Set up Ralph for autonomous execution
- Key insight: "Skills over guessing" - always read skill files first

---

## How to Update This File

When you learn something new:

1. **Identify the category** (Critical, Pattern, Mistake, Module-specific)
2. **Write the problem** (What went wrong or could go wrong)
3. **Write the solution** (How to do it correctly)
4. **Add verification** (How to check it's correct)
5. **Date it** (Add to Session Notes)

Remember: This file is checked into git. The whole team benefits from your learnings.
