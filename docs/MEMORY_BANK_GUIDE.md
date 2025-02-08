# Memory Bank Guide

## Commands

1. **#load**
   - Start/join project
   - Read current state
   - Initialize context

2. **#status**
   - Save current state
   - Check progress
   - Update documentation

3. **#next**
   - Complete current task
   - Find next priority
   - Start fresh chat

## Workflow

1. Starting a Project
   ```bash
   #load    # Initialize memory bank
   ```

2. During Development
   - Auto-commits for big changes
   - Git hooks update memory bank
   - Documentation stays current

3. Saving State
   ```bash
   #status  # Save & check progress
   ```

4. New Task
   ```bash
   #next    # Start fresh with new task
   ```

## File Structure

/docs/cline_docs/
├── productContext.md    # Project purpose & goals
├── activeContext.md     # Current state & work
├── systemPatterns.md    # Architecture & patterns
├── techContext.md       # Technical setup
└── progress.md         # Status & validation

## Status Indicators

Core Status:
- ✅ Completed items
- ⚠️ In-progress work
- ❌ Not started items

Category Indicators:
- 🎯 Priority/Focus items
- 📊 Metrics/Analytics
- 🔧 Technical implementation
- 🏗️ Architecture/Structure
- 🚧 Constraints/Limitations
- 🔒 Security/Protection

## Automation

1. Git Integration
   - Auto-commits for significant changes
   - Updates memory bank after commits
   - Tracks file changes

2. Status Updates
   - Automatic progress tracking
   - Change detection
   - Metrics updates

3. Documentation
   - Cross-reference validation
   - Timestamp updates
   - Structure verification

## Best Practices

1. Always start with #load
   - Ensures fresh context
   - Verifies documentation
   - Sets up workspace

2. Use #status regularly
   - Keeps documentation current
   - Tracks progress
   - Records changes

3. End with #next
   - Saves final state
   - Finds next task
   - Fresh start for AI

## Error Recovery

1. If verification fails:
   ```bash
   #load    # Re-initialize context
   ```

2. If files are missing:
   ```bash
   #status  # Rebuild documentation
   ```

3. If switching tasks:
   ```bash
   #next    # Clean transition
   ```

## Tips

1. Documentation
   - Keep sections organized
   - Use status markers
   - Update timestamps
   - Add cross-references

2. Development
   - Commit regularly
   - Let automation help
   - Keep docs current

3. Task Management
   - One task at a time
   - Clear transitions
   - Track progress