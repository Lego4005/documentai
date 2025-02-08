# Git Management System

## Overview

The Memory Bank system includes automatic git management that:
1. Tracks changes
2. Enforces branching rules
3. Manages commits
4. Auto-commits memory bank updates

## Automatic Features

### 1. Memory Bank Tracking
```javascript
// Auto-commits every 15 minutes if changes exist
{
  frequency: 15, // minutes
  message: 'chore: auto-commit memory bank updates'
}
```

### 2. Git Status in Memory Bank
```markdown
## Git Status
- Current Branch: feat/new-feature
- Last Commit: abc123 feat(auth): add login
- Pending Changes: 3
```

## Branch Rules

### Main Branch
```javascript
main: {
  protected: true,
  requirePR: true,
  requireReview: true
}
```

### Feature Branches
```javascript
feature: {
  pattern: 'feat/*',
  requireTests: true,
  requireDescription: true
}
```

### Bugfix Branches
```javascript
bugfix: {
  pattern: 'fix/*',
  requireTests: true,
  requireDescription: true
}
```

### Release Branches
```javascript
release: {
  pattern: 'release/*',
  protected: true,
  requirePR: true
}
```

## Commit Rules

### 1. Types
```javascript
types: [
  'feat',    // New feature
  'fix',     // Bug fix
  'docs',    // Documentation
  'style',   // Formatting
  'refactor',// Code restructuring
  'test',    // Tests
  'chore'    // Maintenance
]
```

### 2. Format
```bash
type(scope): message

# Examples:
feat(auth): add login component
fix(api): handle timeout errors
docs(readme): update setup instructions
```

### 3. Requirements
```javascript
{
  requireScope: true,  // Scope is mandatory
  requireTests: ['feat', 'fix', 'refactor'], // These need tests
  maxChanges: 100     // Max files per commit
}
```

## How It Works

### 1. Branch Creation
```javascript
// Creating a feature branch
await gitManager.createBranch('feat', 'new-auth');

// Validates:
- Branch pattern
- Current status
- Protection rules
```

### 2. Commit Creation
```javascript
// Creating a commit
await gitManager.createCommit('feat(auth): add login');

// Validates:
- Commit format
- Required tests
- File count
```

### 3. Auto-Tracking
```javascript
// Every status update:
1. Checks current branch
2. Gets last commit
3. Counts pending changes
4. Updates memory bank
```

### 4. Memory Bank Updates
```javascript
// Every 15 minutes:
1. Checks for changes in docs/cline_docs/
2. Creates commit if needed
3. Updates status
```

## Best Practices

### 1. Branching
- Create feature branches for new work
- Use bugfix branches for fixes
- Keep branches focused and small
- Merge regularly from main

### 2. Commits
- Write clear messages
- Include relevant scope
- Add tests for changes
- Keep changes focused

### 3. Reviews
- Request reviews early
- Address feedback promptly
- Keep PRs manageable
- Update documentation

## Common Workflows

### 1. New Feature
```bash
# Create branch
#branch feat new-auth

# Make changes
[work on code]

# Commit with tests
#commit "feat(auth): add login component"

# Request review
#pr create
```

### 2. Bug Fix
```bash
# Create branch
#branch fix auth-timeout

# Make changes
[fix the bug]

# Commit with tests
#commit "fix(auth): handle timeout errors"

# Request review
#pr create
```

### 3. Documentation
```bash
# Create branch
#branch docs update-readme

# Make changes
[update docs]

# Commit
#commit "docs(readme): update setup guide"

# Request review
#pr create
```

## Error Recovery

### 1. Invalid Branch
```bash
Error: Invalid branch pattern
Solution: Use correct prefix (feat/, fix/, etc.)
```

### 2. Missing Tests
```bash
Error: Tests required for this type of change
Solution: Add tests before committing
```

### 3. Bad Commit Format
```bash
Error: Invalid commit format
Solution: Use type(scope): message format
```

## Integration with Memory Bank

The git management system is integrated with the Memory Bank:

1. Status Tracking:
   - Current branch
   - Last commit
   - Pending changes
   - Auto-commit status

2. Command Integration:
   ```bash
   #branch    # Create branch
   #commit    # Create commit
   #pr        # Manage PRs
   #status    # Check status
   ```

3. Documentation:
   - Branch history
   - Change logs
   - Review status
   - Project progress

This system helps maintain project quality and consistency without requiring manual intervention.