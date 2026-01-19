# /commit-push-pr

Stage all changes, create a descriptive commit, push, and open PR.

## Pre-compute Context

```bash
#!/bin/bash
# Pre-compute git info to avoid back-and-forth
CHANGED_FILES=$(git status --short | wc -l)
BRANCH=$(git branch --show-current)
DIFF_STATS=$(git diff --stat | tail -1)

echo "Files changed: $CHANGED_FILES"
echo "Current branch: $BRANCH"
echo "Stats: $DIFF_STATS"
```

## Task

1. Run `git status` to see all changed files
2. Run `git diff` to review the actual changes
3. Write a descriptive commit message following conventional commits:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `refactor:` for code restructuring
   - `docs:` for documentation
   - `test:` for tests
   - `chore:` for maintenance
4. Stage all changes: `git add .`
5. Commit with the message (include Co-Authored-By for Claude)
6. Push: `git push origin $BRANCH`
7. Open PR: `gh pr create --fill`

## Commit Message Format

```
<type>(<scope>): <description>

<body - what and why>

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Example

```bash
git add .
git commit -m "feat(finanzplanung): Add Kapitalbedarf calculation with decimal.js

- Implement exact arithmetic using Decimal class
- Add German EUR formatting (1.234,56 €)
- Include unit tests for €50k GZ scenario

Co-Authored-By: Claude <noreply@anthropic.com>"
git push origin feature/finanzplanung
gh pr create --fill
```
