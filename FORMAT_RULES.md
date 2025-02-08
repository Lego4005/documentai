# Memory Bank Format Rules

## File Structure

Each memory bank file follows a strict format:

### 1. Metadata Header
```markdown
# File Title
Version: 1.0.0
Last Updated: YYYY-MM-DD HH:mm EST

## Metadata
- **Type**: File Type
- **Version**: 1.0.0
- **Last Updated**: Timestamp
- **Dependencies**: [files]
- **Status**: 🎯 Active
```

### 2. Status Indicators
```markdown
✅ Complete
⚠️ In Progress
❌ Not Started
🎯 Priority
📈 Metrics
🔧 Technical
🏗️ Architecture
```

### 3. Section Structure
```markdown
## Section Name
- Category: Content
- Status: Emoji + Description
- Progress: XX/100
```

## Auto-Updates

### 1. Git Status Updates
```markdown
## Git Status
- Current Branch: feat/new-feature
- Last Commit: abc123 feat(auth): add login
- Pending Changes: 3
```

### 2. Archive Entries
```markdown
## Archive
[2025-02-05 18:47 EST] Created branch: feat/new-feature
[2025-02-05 18:45 EST] Auto-committed 5 memory bank changes
```

## Format Preservation

### 1. Section Updates
- Uses templates for each section
- Preserves existing structure
- Maintains emoji formatting
- Keeps custom content

### 2. Auto-Commit Rules
- Minimum 5 changes required
- 15-minute intervals
- Only memory bank files
- Preserves formatting

## File Types

### 1. Active Context
```markdown
## Quick Reference
- 🧠 Current focus and active tasks
- ⚙️ Recent changes and updates
- 🛠️ System improvements
- 📈 Progress tracking

## Current Task
TaskName (Importance: 95/100, Completion: 45%):
- ⚠️ In Progress
- ✅ Completed
- ❌ Not Started
```

### 2. Product Context
```markdown
## Project Overview
ProjectName is Description

Key Features:
- Feature 1 ✅
- Feature 2 ⚠️
- Feature 3 ❌
```

### 3. System Patterns
```markdown
## Architecture Overview
Component (Status):
- ✅ Complete
- ⚠️ In Progress
- ❌ Pending
```

## Update Process

### 1. File Updates
```javascript
await formatManager.updateFileSection(
  'activeContext.md',
  'Current Task',
  {
    taskName: 'New Feature',
    importance: '95',
    completion: '45'
  }
);
```

### 2. Git Updates
```javascript
await formatManager.updateGitStatus(
  'activeContext.md',
  {
    currentBranch: 'feat/new-feature',
    lastCommit: 'abc123 feat: add login',
    pendingChanges: ['M docs/cline_docs/activeContext.md']
  }
);
```

### 3. Archive Updates
```javascript
await formatManager.addArchiveEntry(
  'activeContext.md',
  'Created new feature branch'
);
```

## Best Practices

1. Section Updates:
   - Use templates
   - Preserve structure
   - Maintain emojis
   - Keep custom content

2. Git Integration:
   - Regular status updates
   - Smart auto-commits
   - Archive entries
   - Format preservation

3. Change Tracking:
   - Count significant changes
   - Wait for minimum threshold
   - Preserve formatting
   - Document updates

The format system ensures consistent documentation while maintaining project history and readability.