# /review-changes

Review uncommitted changes and suggest improvements.

## Task

1. Run `git diff` to see all uncommitted changes
2. Run `git diff --cached` to see staged changes
3. Analyze changes for:

### Code Quality
- [ ] Clear naming conventions
- [ ] No unnecessary complexity
- [ ] Proper error handling
- [ ] No console.logs left in (except intentional logging)

### Potential Bugs
- [ ] Edge cases handled
- [ ] Null/undefined checks where needed
- [ ] Async/await properly used
- [ ] No race conditions

### Performance Issues
- [ ] No N+1 queries
- [ ] No unnecessary re-renders (React)
- [ ] Large arrays/objects properly handled
- [ ] No memory leaks

### Security Vulnerabilities
- [ ] No hardcoded secrets
- [ ] Input validation present
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] DSGVO compliance (no PII in logs)

### GZ-Specific Compliance
- [ ] Financial calculations use decimal.js
- [ ] Claude API calls have ZDR header
- [ ] Interactive elements have aria-labels
- [ ] RLS policies respected (user_id filters)

### Missing Tests
- [ ] New functions have unit tests
- [ ] Edge cases covered
- [ ] Error paths tested

4. Provide specific, actionable suggestions
5. Rate overall quality: Excellent / Good / Needs Work / Problematic

## Output Format

```markdown
## Review Summary

**Overall Rating:** [Rating]

### Issues Found

1. **[Category]** - [File:Line]
   - Problem: [Description]
   - Suggestion: [How to fix]

### Suggestions

1. [Improvement suggestion]

### Approved Changes

- [List of changes that look good]
```
