## Best-of-the-Best Memory Bank System Plan

### Features

*   **Core Principles:**
    *   Memory Reset Handling: Clear separation between sessions, Memory Bank as the sole source of truth.
    *   Complete Context Dependency:  Mandatory documentation review before task initiation.
    *   Verified Information:  Emphasis on verifying all data before inclusion in the Memory Bank.
    *   Automated Processes: Git integration, status tracking, and documentation updates.

*   **Documentation:**
    *   **Core Documentation:**
        *   `productContext.md`: Project purpose, goals, problem statements, solutions, success metrics, user requirements.
        *   `activeContext.md`: Current work, recent changes, next steps, challenges, dependencies. (Highest priority for updates)
        *   `systemPatterns.md`: System architecture, technical decisions, design patterns, constraints, metrics.
        *   `techContext.md`: Technology stack, setup requirements, dependencies, configurations.
        *   `progress.md`: Working features, pending items, status metrics, known issues, test status.
    *   **Support Documentation:**
        *   `projectConfig.md`: Project settings, configurations, resource limits, integrations, environment variables.
        *   `commands.md`: Command reference and usage, session flows, status checks, task transitions.
        *   `checklist.md`: Verification procedures, update steps, quality checks, recovery procedures.
        *   `documentationPolicy.md`: Documentation standards, style guide, versioning, cross-referencing rules.

*   **Status Tracking:**
    *   Core Status: ✅ (Completed), ⚠️ (In Progress), ❌ (Not Started).
    *   Category Indicators: 🎯 (Priority/Focus), 📊 (Metrics/Analytics), 🔧 (Technical), 🏗️ (Architecture), 🚧 (Constraints), 🔒 (Security).

*   **Commands:**
    *   `#loadmemory`: Initialize context, verify documentation, show status.
    *   `#updatememory`: Document current state, update references, validate completeness, clear next steps, run status check.
    *   `#status`: Check Memory Bank, show metrics, list incomplete items.
    *   `#next`: (Implicit through workflow) Complete current task and transition to a fresh state.
    *   `#analyze`: Perform analysis on specified data (e.g., logs, code).

*   **Automation:**
    *   **Git Integration:**
        *   Auto-commits for significant changes.
        *   Updates `activeContext.md` after commits.
        *   Change tracking in `activeContext.md`.
        *   Branch analysis for identifying priorities.
    *   **Status Tracking:**
        *   Automatic progress updates.
        *   Change detection.
        *   Cross-reference validation.
        *   Timestamp management.
    *   **Documentation Updates:**
        *   Auto-backup before changes.
        *   Structure verification.
        *   Cross-reference checking.
        *   Format validation.

### How it Works

1.  **Initialization (`#loadmemory`):**
    *   The system starts by loading all Memory Bank files.
    *   It verifies the existence and integrity of required documentation.
    *   It displays the current project status.

2.  **Active Development:**
    *   Developers work on tasks, making changes to code and documentation.
    *   `activeContext.md` is continuously updated to reflect the current state.
    *   Automated processes (Git integration, status tracking) run in the background.

3.  **State Update (`#updatememory`):**
    *   Developers use `#updatememory` to document their current state.
    *   This triggers updates to relevant documentation files.
    *   Cross-references and dependencies are validated.

4.  **Status Check (`#status`):**
    *   `#status` provides a snapshot of the project's progress.
    *   It displays metrics, incomplete items, and potential issues.

5.  **Task Completion and Transition (`#next` - implicit):**
    *   When a task is completed, the developer updates `activeContext.md` and other relevant files.
    *   The system implicitly transitions to a fresh state, ready for the next task.

6.  **Analysis (`#analyze`):**
    *   The `#analyze` command allows for custom analysis of project data.

### System Diagram (Mermaid)

```mermaid
graph TD
    A[User] --> B(CLI);
    B --> C{#loadmemory};
    B --> D{#updatememory};
    B --> E{#status};
    B --> F{#analyze};
    C --> G{Memory Bank Files};
    D --> G;
    E --> G;
    F --> H[Data Sources];
    G --> I[productContext.md];
    G --> J[activeContext.md];
    G --> K[systemPatterns.md];
    G --> L[techContext.md];
    G --> M[progress.md];
    G --> N[projectConfig.md];
    G --> O[commands.md];
    G --> P[checklist.md];
    G --> Q[documentationPolicy.md];
    H --> R[Logs];
    H --> S[Codebase];
    H --> T[Metrics];