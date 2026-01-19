# Financial Calculations - AGENTS.md

> This file accumulates learnings about financial calculations in the GZ project.
> Update this file whenever you discover important patterns or gotchas.

**Last Updated:** 2026-01-19

---

## Critical Rule: ALWAYS Use decimal.js

**Why:** Arbeitsagentur (BA) officials reject business plans with rounding errors. A €0.01 discrepancy destroys credibility and can result in immediate rejection.

### The Problem

```typescript
// JavaScript floating-point error
0.1 + 0.2 = 0.30000000000000004

// In financial context:
2500.50 * 12 = 30006.000000000004
```

### The Solution

```typescript
import Decimal from 'decimal.js';

// ALWAYS pass strings to Decimal constructor
const amount = new Decimal('2500.50');
const months = new Decimal('12');
const annual = amount.times(months); // 30006.00 (exact)
```

### Decimal.js Methods

| Operation | Method | Example |
|-----------|--------|---------|
| Addition | `.plus()` | `a.plus(b)` |
| Subtraction | `.minus()` | `a.minus(b)` |
| Multiplication | `.times()` | `a.times(b)` |
| Division | `.dividedBy()` | `a.dividedBy(b)` |
| Comparison | `.equals()`, `.greaterThan()` | `a.equals(b)` |
| Rounding | `.toDecimalPlaces()` | `a.toDecimalPlaces(2)` |

---

## German Number Formatting

### Pattern

- **German:** `1.234,56 €` (dot = thousands, comma = decimal)
- **US/UK:** `€1,234.56` (comma = thousands, period = decimal)

### Implementation

```typescript
function formatEUR(amount: Decimal): string {
  return amount.toNumber().toLocaleString('de-DE', {
    style: 'currency',
    currency: 'EUR'
  });
}

// Result: "1.234,56 €"
```

### Parsing German Numbers

```typescript
function parseGermanNumber(input: string): Decimal {
  // "1.234,56" → "1234.56"
  const normalized = input
    .replace(/\./g, '')      // Remove thousands separator
    .replace(',', '.');       // Convert decimal separator
  return new Decimal(normalized);
}
```

---

## Test Scenarios

### €50,000 GZ Standard Test Case

Use this for validating ALL financial calculations:

```typescript
const testCase = {
  gruendungszuschuss: new Decimal('18000'),  // 6 months × €3,000
  gruendungskosten: new Decimal('15000'),    // Startup costs
  anlaufkosten: new Decimal('25000'),        // Operating costs
  reserve: new Decimal('10000'),             // Reserve
  total: new Decimal('50000')                // Kapitalbedarf
};

// Validation
const calculated = gruendungskosten.plus(anlaufkosten).plus(reserve);
expect(calculated.equals(testCase.total)).toBe(true);
```

---

## Common Gotchas

### 1. String vs Number in Constructor

```typescript
// ✓ CORRECT - Pass strings
const amount = new Decimal('123.45');

// ⚠️ RISKY - Number may already have floating-point error
const amount = new Decimal(123.45);
```

### 2. Comparison Operators

```typescript
// ✗ WRONG - JavaScript comparison
if (amount === new Decimal('0')) { ... }

// ✓ CORRECT - Decimal comparison
if (amount.equals(new Decimal('0'))) { ... }
if (amount.isZero()) { ... }
```

### 3. Chaining Operations

```typescript
// ✓ CORRECT - Method chaining
const gewinn = new Decimal(umsatz)
  .minus(fixkosten)
  .minus(variableKosten);

// ✗ WRONG - Intermediate variables with numbers
const temp = umsatz - fixkosten;  // Floating-point!
const gewinn = temp - variableKosten;
```

### 4. Division Precision

```typescript
// Set global precision if needed
Decimal.set({ precision: 20 });

// Or specify per operation
const result = a.dividedBy(b).toDecimalPlaces(2);
```

---

## Verification Commands

```bash
# Check for floating-point operations in finance code
# ALL of these should return ZERO matches:

ast-grep --lang typescript -p '$A + $B' src/lib/finance
ast-grep --lang typescript -p '$A - $B' src/lib/finance
ast-grep --lang typescript -p '$A * $B' src/lib/finance
ast-grep --lang typescript -p '$A / $B' src/lib/finance
```

---

## Calculations Reference

### Kapitalbedarf (Capital Needs)

```
Kapitalbedarf = Gründungskosten + Anlaufkosten + Reserve
```

### Break-Even

```
Break-Even (Monat) = Fixkosten / (Umsatz - Variable Kosten)
```

### Umsatzvorschau (Revenue Forecast)

```
Jahr 2 = Jahr 1 × (1 + Wachstumsrate)
Jahr 3 = Jahr 2 × (1 + Wachstumsrate)
```

---

## Learnings Log

### 2026-01-19: Initial Setup

- Created decimal-helpers.ts utility
- Established formatEUR and parseGermanNumber functions
- Documented €50k test scenario
