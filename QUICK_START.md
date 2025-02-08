# Quick Start Guide

## Installation

```bash
# Install memory bank system
./install.sh

# Verify installation
npm run check:install
```

## Basic Commands

```bash
#load    # Start/join project
#status  # Save state & check progress
#next    # Start fresh with new task
```

## Project Structure

```
/docs/cline_docs/
├── productContext.md    # Project purpose & goals
├── activeContext.md     # Current state & work
├── systemPatterns.md    # Architecture & patterns
├── techContext.md      # Technical setup
└── progress.md         # Status & validation
```

## Workflow

1. Start Project
   ```bash
   #load    # Initialize memory bank
   ```

2. During Development
   - Auto-commits for big changes
   - Git hooks update memory bank
   - Documentation stays current

3. Save Progress
   ```bash
   #status  # Save & check progress
   ```

4. New Task
   ```bash
   #next    # Start fresh with new task
   ```

## Status Indicators

- ✅ Complete
- ⚠️ In Progress
- ❌ Not Started

## Automation

- Git hooks for auto-updates
- Change detection
- Progress tracking

## Tips

1. Always start with #load
2. Let automation help
3. End tasks with #next

## Common Issues

1. Verification Failed
   ```bash
   #load    # Re-initialize
   ```

2. Missing Files
   ```bash
   #status  # Rebuild docs
   ```

3. Task Switch
   ```bash
   #next    # Clean start
   ```

For more details, see [Memory Bank Guide](docs/MEMORY_BANK_GUIDE.md)