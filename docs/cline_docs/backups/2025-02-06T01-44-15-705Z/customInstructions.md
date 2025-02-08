# Custom Instructions

Version: 1.0.0
Last Updated: 2025-01-31

## Memory Management

### Load Memory Process

When the user says "load memory", perform these steps in order:

1. Run Status Check
```bash
npm run status
```
- Review completion metrics
- Note current progress
- Identify active work areas

2. Check Memory Bank Status
```bash
npm run memory-bank:status
```
- Verify cross-references
- Check documentation completeness
- Note any inconsistencies

3. Review Implementation Status
- Check Implementation-Status.md for:
  - Current completion status (✅, ⚠️, ❌)
  - Cross-references between documents
  - In-progress work
  - Dependencies and blockers

4. Check Incomplete Items
```bash
npm run status:incomplete
```
- Note remaining work
- Identify priorities
- Review blockers

5. Final Verification
- Verify all status markers are accurate
- Confirm cross-references are valid
- Check for missing documentation

6. Completion
- Say [MEMORY LOADED] when complete
- Begin task execution

### Update Memory Process

When the user says "update memory", perform these steps in order:

1. Capture Current State
```bash
npm run status
```
- Record completion metrics
- Note progress changes
- Document new developments

2. Update Documentation
- Add/update cross-references using "See: file.md#section"
- Update status markers (✅, ⚠️, ❌)
- Document new dependencies
- Record any new challenges or blockers

3. Verify Remaining Work
```bash
npm run status:incomplete
```
- Update incomplete items list
- Adjust priorities if needed
- Note any new blockers

4. Update Implementation Status
- Update Implementation-Status.md
- Verify all cross-references
- Ensure status markers are accurate
- Document any new dependencies

5. Final Checks
- Run status checks again
- Verify documentation completeness
- Confirm all updates are recorded

6. Completion
- Say [MEMORY UPDATED] when complete
- Document next steps clearly

## Status Tracking

### Status Markers
- ✅ Completed
- ⚠️ In Progress
- ❌ Not Started

### Cross-Reference Format
Use the following format for cross-references:
```markdown
See: filename.md#section
```

Example:
```markdown
- Implemented token management (See: techContext.md#External Dependencies)
```

### Progress Keywords
The following keywords are automatically detected as "in progress":
- implementing
- working on
- in progress
- ongoing
- started
- developing
- building
- refactoring
- updating
- adding
- fixing

## Available Commands

### Status Commands
- `npm run status` - Full status report
- `npm run status:incomplete` - Show incomplete items
- `npm run memory-bank:status` - Memory bank status
- `npm run memory-bank` - Open memory bank

### Usage Examples
```bash
# Get full status report
npm run status

# Check incomplete items
npm run status:incomplete

# Check memory bank status
npm run memory-bank:status