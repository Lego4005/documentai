# Documentation Update System

## Update Triggers

### 1. File Operations
```javascript
// Updates happen when:
write_to_file:    'File created/modified'
apply_diff:       'Changes applied to file'
insert_content:   'Content added to file'
search_replace:   'Content modified in file'
```

### 2. Tool Operations
```javascript
execute_command:  'Command executed'
browser_action:   'Browser interaction'
```

### 3. Git Operations
```javascript
branch:          'New branch created'
commit:          'Changes committed'
pr:             'Pull request action'
```

## Update Batching

### 1. Queue System
```javascript
// Updates are queued and processed when:
- 3 or more changes accumulated
- #updatememory command used
- Git auto-commit triggered
```

### 2. Force Updates
```javascript
// Immediate updates on:
#loadmemory     // System initialization
#status         // Status check
#updatememory   // Manual update
```

## What Gets Updated

### 1. activeContext.md
```markdown
## Current Task
TaskName (Importance: 95/100, Completion: 45%):
- Modified 3 files
- Executed 2 commands
- Performed 1 browser action
- No changes

## Archive
[2025-02-05 18:49 EST] Made 6 changes: Modified 3 files, Executed 2 commands...
```

### 2. progress.md
```markdown
## Working Features
- File changes: 3
- Commands executed: 2
- Browser actions: 1
```

## Update Process

### 1. Tool Usage
```javascript
// When tool is used:
1. Tool executes
2. Result captured
3. Update queued
4. Changes tracked
```

### 2. Batch Processing
```javascript
// When batch threshold reached:
1. Summarize changes
2. Update documentation
3. Add archive entry
4. Clear queue
```

### 3. Force Update
```javascript
// On manual update command:
1. Process pending updates
2. Update git status
3. Check auto-commit
```

## Update Rules

### 1. File Changes
- Queue update after successful operation
- Track file path and change type
- Count towards batch threshold
- Include in change summary

### 2. Command Execution
- Queue update after command runs
- Track command and result
- Count towards batch threshold
- Include in status update

### 3. Browser Actions
- Queue update after action
- Track action type
- Count towards batch threshold
- Include in status update

## Documentation Sections

### 1. Current Task
- Updated with latest changes
- Shows active operations
- Tracks completion
- Lists recent actions

### 2. Archive
- Records all updates
- Timestamps changes
- Summarizes operations
- Preserves history

### 3. Progress
- Lists working features
- Shows completion status
- Tracks changes
- Updates metrics

## Best Practices

### 1. Change Tracking
- Group related changes
- Wait for batch threshold
- Use descriptive summaries
- Preserve formatting

### 2. Documentation Updates
- Maintain structure
- Keep emojis
- Update relevant sections
- Preserve custom content

### 3. Git Integration
- Track branch changes
- Record commits
- Document PR actions
- Maintain history

## Common Scenarios

### 1. File Creation
```javascript
// When creating new file:
1. File created
2. Update queued
3. Waits for batch
4. Updates docs when threshold reached
```

### 2. Multiple Changes
```javascript
// When making several changes:
1. Changes tracked
2. Updates queued
3. Batch processed at threshold
4. Documentation updated once
```

### 3. Manual Update
```javascript
// When running #updatememory:
1. Process all pending updates
2. Update documentation
3. Check git status
4. Clear queue
```

The documentation system automatically tracks and records changes while maintaining consistent formatting and structure.