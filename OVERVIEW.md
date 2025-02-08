# Memory Bank System Overview

## Core Concepts

1. Memory Management
   - AI memory resets between sessions
   - Memory bank is source of truth
   - Documentation must be complete

2. File Structure
   ```
   /docs/cline_docs/
   ├── productContext.md    # Project purpose & goals
   ├── activeContext.md     # Current state & work
   ├── systemPatterns.md    # Architecture & patterns
   ├── techContext.md       # Technical setup
   └── progress.md         # Status & validation
   ```

3. Status Tracking
   - ✅ Complete
   - ⚠️ In Progress
   - ❌ Not Started

## Commands

1. Initialize Project
   ```bash
   #load
   ```

2. Save Progress
   ```bash
   #status
   ```

3. New Task
   ```bash
   #next
   ```

## Automation

1. Git Integration
   - Auto-commits for big changes
   - Updates after commits
   - Change tracking

2. Documentation
   - Structure verification
   - Cross-reference checks
   - Status updates

3. Progress Tracking
   - Automatic metrics
   - Change detection
   - Task management

## Workflow Example

```bash
You: Start new chat
AI: Ready to help!

You: #load
AI: Reading project state...
   - Checking documentation
   - Loading context
   - Ready to proceed

You: Make some changes
AI: Working...
   [Auto-commit: Significant changes]

You: #status
AI: Saving state...
   - Updating documentation
   - Recording changes
   - State saved

You: #next
AI: Transitioning...
   - Saving final state
   - Finding next task
   - Fresh start
```

## Best Practices

1. Project Start
   - Always use #load
   - Verify documentation
   - Check context

2. During Development
   - Let automation work
   - Keep docs current
   - Track progress

3. Task Management
   - One task at a time
   - Clear transitions
   - Use #next properly

## Error Handling

1. Missing Files
   ```bash
   #load    # Re-initialize
   ```

2. Bad State
   ```bash
   #status  # Fix documentation
   ```

3. Task Issues
   ```bash
   #next    # Clean start
   ```

For details, see:
- [Quick Start](QUICK_START.md)
- [Memory Bank Guide](docs/MEMORY_BANK_GUIDE.md)