# /compliance-check

Run all GZ Businessplan Generator compliance checks before committing.

## Checks

### 1. Financial Arithmetic (CRITICAL)

**Rule:** No floating-point arithmetic in financial code. All calculations must use decimal.js.

```bash
# Check for floating point operations in finance code
# These patterns should return ZERO matches:

# Addition
ast-grep --lang typescript -p '$A + $B' src/lib/finance 2>/dev/null || echo "No matches (good)"

# Multiplication
ast-grep --lang typescript -p '$A * $B' src/lib/finance 2>/dev/null || echo "No matches (good)"

# Division
ast-grep --lang typescript -p '$A / $B' src/lib/finance 2>/dev/null || echo "No matches (good)"
```

**Pass Criteria:** Zero matches for arithmetic operators in lib/finance

---

### 2. DSGVO Compliance (CRITICAL)

**Rule:** All Claude API calls must include Zero Data Retention header.

```bash
# Check for Claude API calls without ZDR header
ast-grep --lang typescript -p 'anthropic.messages' src/ 2>/dev/null
ast-grep --lang typescript -p 'streamText' src/ 2>/dev/null

# Verify ZDR header is present in API route
grep -r "zdr-2024-10-22" src/app/api/ 2>/dev/null || echo "WARNING: ZDR header not found"
```

**Pass Criteria:** All Claude API calls include `anthropic-beta: zdr-2024-10-22` header

---

### 3. Accessibility (EAA June 2025)

**Rule:** All interactive elements need proper ARIA labels.

```bash
# Check for buttons without aria-label
ast-grep --lang tsx -p '<button $$$>$$$</button>' src/components 2>/dev/null | head -20

# Check for inputs without labels
ast-grep --lang tsx -p '<input $$$>' src/components 2>/dev/null | head -20
```

**Pass Criteria:** All buttons have aria-label, all inputs have associated labels

---

### 4. Row Level Security (RLS)

**Rule:** All database queries must filter by user_id.

```bash
# Check for Supabase queries
grep -r "\.from(" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -20

# Verify RLS is enforced
grep -r "user_id" src/lib/supabase 2>/dev/null || echo "WARNING: user_id filtering may be missing"
```

**Pass Criteria:** All .from() queries have user_id context or RLS policies handle it

---

### 5. TypeScript Strict Mode

```bash
npm run type-check
```

**Pass Criteria:** Zero TypeScript errors

---

### 6. No Secrets in Code

```bash
# Check for potential secrets
grep -rE "(api_key|apikey|secret|password|token).*=.*['\"][^'\"]+['\"]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "process.env" | head -10
```

**Pass Criteria:** No hardcoded secrets (only process.env references)

---

## Report Format

```
GZ COMPLIANCE CHECK REPORT
==========================

1. Financial Arithmetic:  [PASS/FAIL]
2. DSGVO (ZDR Header):    [PASS/FAIL]
3. Accessibility:         [PASS/FAIL]
4. RLS Policies:          [PASS/FAIL]
5. TypeScript:            [PASS/FAIL]
6. No Secrets:            [PASS/FAIL]

Overall: [PASS/FAIL]

Issues Found:
- [List any failures with details]

Recommendations:
- [How to fix any issues]
```
