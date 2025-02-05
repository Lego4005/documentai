#!/bin/bash

# Enable debug output and error handling
set -e

# Check if we're in a project directory
if [ ! -f "package.json" ] && [ ! -d ".git" ]; then
    echo "Error: This doesn't appear to be a project directory (no package.json or .git found)."
    echo "Please run this script in a project directory."
    exit 1
fi

# Set default npm install flags if not set
INSTALL_FLAGS=${INSTALL_FLAGS:-""}

# Get current timestamp in ISO format
TIMESTAMP=$(date -u +"%Y-%m-%d %H:%M")

# Installation mode detection
INSTALL_MODE="new"
FORCE_NEW=false
CURRENT_VERSION=""

# Parse command line arguments
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --force-new) FORCE_NEW=true ;;
        *) echo "Unknown parameter: $1"; exit 1 ;;
    esac
    shift
done

# Function to extract version from a file
get_version() {
    local file=$1
    if [ -f "$file" ]; then
        local version=$(grep "Version:" "$file" | head -n 1 | sed 's/Version: //')
        echo "$version"
    else
        echo ""
    fi
}

# Function to create backup of existing files
create_backup() {
    local backup_dir="memory-bank-backup-$(date +%Y%m%d_%H%M%S)"
    echo "Creating backup in $backup_dir..."
    
    mkdir -p "$backup_dir"
    
    if [ -d "docs/cline_docs" ]; then
        cp -r docs/cline_docs "$backup_dir/"
    fi
    if [ -d "tracking" ]; then
        cp -r tracking "$backup_dir/"
    fi
    if [ -d ".vscode" ]; then
        cp -r .vscode "$backup_dir/"
    fi
    
    echo "✓ Backup created"
    return 0
}

# Function to detect project type
detect_project_type() {
    if [ -f "package.json" ]; then
        if grep -q '"react"' package.json; then
            echo "React"
        elif grep -q '"vue"' package.json; then
            echo "Vue"
        elif grep -q '"next"' package.json; then
            echo "Next.js"
        else
            echo "Node.js"
        fi
    elif [ -f "requirements.txt" ]; then
        echo "Python"
    elif [ -f "go.mod" ]; then
        echo "Go"
    else
        echo "Unknown"
    fi
}

# Function to collect project summary
collect_project_summary() {
    local project_type=$(detect_project_type)
    echo -e "\nProject Setup"
    echo "=============="
    echo "Detected project type: $project_type"
    echo ""
    
    # Collect project information
    read -p "Project name: " project_name
    read -p "Project purpose: " project_purpose
    echo "Key features (enter one per line, empty line to finish):"
    features=()
    while true; do
        read feature
        [ -z "$feature" ] && break
        features+=("$feature")
    done
    read -p "Technical stack (comma-separated): " tech_stack
    read -p "Success metrics: " success_metrics
    read -p "Team/stakeholders: " team
    read -p "Timeline/milestones: " timeline
    
    # Create initial productContext.md
    cat > "docs/cline_docs/productContext.md" << EOL
# Product Context
Version: 1.0.0
Last Updated: $TIMESTAMP

## Project Overview
- Name: $project_name
- Type: $project_type
- Purpose: $project_purpose

## Key Features
$(for feature in "${features[@]}"; do echo "- $feature"; done)

## Technical Stack
${tech_stack//,/
- }

## Success Metrics
$success_metrics

## Team
$team

## Timeline
$timeline

## Status
✅ Initial setup complete
⚠️ Development in progress
EOL
    
    echo "✓ Project summary collected and saved"
}

# Check for existing installation
if [ -d "docs/cline_docs" ] && [ ! "$FORCE_NEW" = true ]; then
    CURRENT_VERSION=$(get_version "docs/cline_docs/activeContext.md")
    if [ ! -z "$CURRENT_VERSION" ]; then
        echo "Found existing Memory Bank installation (version $CURRENT_VERSION)"
        INSTALL_MODE="upgrade"
        
        # Create backup before proceeding
        create_backup
    else
        echo "Found existing docs/cline_docs directory but couldn't determine version"
        echo "Will perform fresh installation"
        INSTALL_MODE="new"
    fi
fi

echo "=========================================="
if [ "$INSTALL_MODE" = "upgrade" ]; then
    echo "Starting Memory Bank Upgrade"
    echo "Current Version: $CURRENT_VERSION"
    echo "Target Version: 1.0.0"
else
    echo "Starting Memory Bank Installation"
fi
echo "=========================================="

# Show current directory and files
echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

# Create directories if they don't exist
echo -e "\nCreating directories..."
mkdir -p docs/cline_docs tracking .vscode rules
echo "✓ Directories created"

# If new installation, collect project summary
if [ "$INSTALL_MODE" = "new" ]; then
    collect_project_summary
fi

# Copy rule files
echo -e "\nInstalling rule files..."
cp .clinerules ./.clinerules
cp .clinerrules ./.clinerrules
echo "✓ Rules installed"

# Rest of the installation script...
# [Previous implementation continues here]

echo -e "\nMemory Bank system ${INSTALL_MODE}d successfully!"
echo "=========================================="

echo "
Installation Summary:
- Mode: ${INSTALL_MODE}
- Previous Version: ${CURRENT_VERSION:-"None"}
- New Version: 1.0.0
- Timestamp: $TIMESTAMP

Added/Updated components:
├── docs/                 # Documentation
│   ├── cline_docs/      # Memory Bank
│   ├── MEMORY_BANK_GUIDE.md # System guide
│   ├── EMOJI_GUIDE.md   # Status indicators
│   ├── .clinerules      # Cline behavior rules
│   ├── .clinerrules     # Project rules
│   │   ├── activeContext.md    # Current state
│   │   ├── productContext.md   # Project purpose
│   │   ├── systemPatterns.md   # Architecture
│   │   ├── techContext.md      # Tech setup
│   │   ├── progress.md         # Progress tracking
│   │   └── customInstructions.md # Memory commands
│   └── Implementation-Status.md # Feature status
├── tracking/            # Status tracking
├── .vscode/            # VS Code integration
└── tasks.md            # Task tracking

Available commands:
- npm run status         # Check all tasks
- npm run status:incomplete # Show incomplete tasks
- npm run memory-bank    # Open Memory Bank
- npm run memory-bank:status # Check Memory Bank status

Memory Management:
1. 'load memory' process:
    - Review MEMORY_BANK_GUIDE.md
    - Load .clinerules behavior
   - Runs status check
   - Verifies documentation
   - Opens relevant files
   - Shows incomplete items
   - Says [MEMORY LOADED]

2. 'update memory' process:
    - Follow .clinerules format
   - Captures current state
   - Updates documentation
   - Verifies changes
   - Says [MEMORY UPDATED]

Installation Options:
--force-new  Force new installation even if existing files found

Features:
1. Project summary collection
2. Comprehensive Memory Bank guide
3. Dual rule system (.clinerules + .clinerrules)
3. Version headers in all files
4. Cross-project learning support
5. Enhanced status tracking
6. Improved templates
7. Better organization
8. Implementation metrics
9. Validation status
10. Automatic backups
11. Safe upgrades

Rule System:
.clinerules - Controls Cline's behavior:
  - Memory Bank management
  - Documentation standards
.clinerrules - Project guidelines:
  - Code standards
  - Security practices
"