# Memory Bank Guide

## Prerequisites

Before using the Memory Bank system, ensure you have:

1. **Git Setup**
   ```bash
   git init                    # Initialize a new git repository
   git config user.name "Lego4005"
   git config user.email "colby@bit9.ai"
   ```

2. **Node.js Environment**
   - Node.js (v14 or higher)
   - npm or yarn package manager

3. **Project Structure**
   ```bash
   mkdir -p docs/cline_docs    # Create required directories
   touch projectInstructions.md # Create initial instructions file
   ```

## Installation

1. **Clone/Setup Repository**
   ```bash
   git clone <your-repo-url>   # If using existing repo
   # OR
   git init                    # If starting fresh
   ```

2. **Install Dependencies**
   ```bash
   npm install                 # Install required packages
   ```

3. **Initialize Memory Bank**
   ```bash
   node templates/command-handler.mjs "#load project"
   ```

## Commands

1. **#load project** - 🚀 Initialize/Load Project
   - Start/join project 
   - Read current state
   - Initialize context

2. **#status check** - 📊 Check Project Status
   - Save current state
   - Check progress
   - Update documentation

3. **#update memory** - 💾 Update Memory Bank
   - Complete current task
   - Find next priority
   - Start fresh chat

## Workflow

1. **#load project** - 🚀 Initialize/Load Project
   ```bash
   #load project    # Initialize memory bank
   ```

2. During Development
   - Use commands for actions
   - AI auto-manages docs
   - Track progress with #status check - 📊 Check Project Status

3. **#status check** - 📊 Check Project Status
   ```bash
   #status check  # Save & check progress
   ```

4. **#next** - ➡️ Start Fresh Task
   ```bash
   #next    # Start fresh with new task ➡️
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

## Documentation Templates

To help you get started with structured documentation, the Memory Bank system now includes template files for each of the core documentation files:

- `productContext.md`
- `activeContext.md`
- `systemPatterns.md`
- `techContext.md`
- `progress.md`

When you install the Memory Bank system, these templates are copied to `docs/cline_docs/`. You can use these templates as a starting point and reference for structuring your documentation following the best practices demonstrated in the "sierra" project.

## Best Practices

1. Always start with #load project - 🚀 Initialize/Load Project
   - Ensures fresh context
   - Verifies documentation
   - Sets up workspace

2. Use #status check - 📊 Check Project Status regularly
   - Keeps documentation current
   - Tracks progress
   - Records changes

3. End with #next - ➡️ Start Fresh Task
   - Saves final state
   - Finds next task
   - Fresh start for AI

## Error Recovery

1. If verification fails:
   ```bash
   #load project - 🚀 Initialize/Load Project    # Re-initialize context
   ```

2. If files are missing:
   ```bash
   #status check - 📊 Check Project Status  # Rebuild documentation
   ```

3. If switching tasks:
   ```bash
   #next - ➡️ Start Fresh Task   # Clean transition
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

## AI-Driven Workflows

These examples illustrate how the AI agent can use the Unified Command System to perform development tasks autonomously.

1. Feature Implementation (AI-Driven)
   ```
   AI: #create file src/components/NewFeature.js - 📝 Create File
   AI: Writing code for new feature component...
   AI: #update file src/components/NewFeature.js - ✏️ Update File -m "Implement basic component structure"
   AI: Implementing component structure...
   AI: #update file src/App.js - ✏️ Update File -m "Import and integrate NewFeature component"
   AI: Integrating new feature into App component...
   AI: Feature implementation complete! ✅ 
   ```

2. Bug Fixing (AI-Driven)
   ```
   AI: #analyze code quality - 🔍 Analyze Code Quality
   AI: Analyzing code for potential issues... 🔍
   AI: Code analysis complete. Identified potential bug in src/utils.js. 🐛
   AI: #update file src/utils.js - ✏️ Update File -m "Fix potential bug in calculateTotal function"
   AI: Fixing bug in calculateTotal function... 🛠️
   AI: #test run unit - ✅ Run Unit Tests
   AI: Running unit tests to verify fix... ✅
   AI: Unit tests passed. Bug fix verified! ✅ 
   ```

3. Documentation Updates (AI-Driven)
   ```bash
   AI: #update memory - 💾 Update Memory Bank
   AI: Updating Memory Bank documentation... 💾
   AI: Memory Bank documentation updated to reflect recent code changes. 💾 
   ```

In these examples, the AI agent autonomously uses the Unified Command System to:

- Create and update code files (`#create file`, `#update file`)
- Analyze code (`#analyze code quality`)
- Run tests (`#test run unit`)
- Update documentation (`#update memory`)

These workflows demonstrate how the AI can leverage the command system to perform various development tasks in a structured and automated manner.