#!/bin/bash

MODE=""
HYBRID=false
PROJECT_DIR=""
BACKUP_DIR="memory-bank-backup-$(date +%Y%m%d_%H%M%S)"

# Available modes (from Roo Code)
MODES=(
  "mvp:Quick prototyping and essential features"
  "architect:System design and architecture planning"
  "code:Implementation and development"
  "ask:Research and documentation"
)

# MCP Tool Definitions
MCP_TOOLS=(
  "semantic-search:Semantic search using Pinecone:true"
  "read-document:Read and process documents:true"
  "process-document:Process and embed documents:true"
  "list-documents:List available documents:true"
  "pinecone-stats:View Pinecone statistics:true"
  "aws_ec2:Manage AWS EC2 resources:false"
  "jira:Query Jira tickets:false"
  "pagerduty:Pull PagerDuty incidents:false"
  "browser:Browser automation for testing:true"
  "token_optimizer:Optimize token usage and context:true"
  "memory_bank:Project memory and context management:true"
  "hybrid_mode:Advanced hybrid development mode:true"
  "checkpoint:Project checkpoint management:true"
  "template_processor:Template processing and generation:true"
  "git_manager:Git workflow automation:true"
  "doc_updater:Documentation auto-updates:true"
  "format_manager:Content formatting and organization:true"
)

# Function to get user input with default value
get_input() {
    local prompt="$1"
    local default="$2"
    local input
    echo -n "$prompt [$default]: "
    read input
    echo "${input:-$default}"
}

# Function to setup mode configuration
setup_modes() {
    echo -e "\n🎭 Mode Configuration"
    echo "-------------------"
    echo "Available modes:"
    for mode in "${MODES[@]}"; do
        IFS=':' read -r name desc <<< "$mode"
        echo "- $name: $desc"
    done
    
    DEFAULT_MODE=$(get_input "Select default mode" "mvp")
    
    # Create mode configuration file
    cat > "$PROJECT_DIR/.clinerules" <<EOL
# Mode Configuration
default_mode: ${DEFAULT_MODE}

# Mode Permissions
modes:
  mvp:
    can_edit_code: true
    can_run_commands: true
    can_modify_docs: true
    
  architect:
    can_edit_code: false
    can_run_commands: false
    can_modify_docs: true
    file_patterns: ["*.md", "architecture.*"]
    
  code:
    can_edit_code: true
    can_run_commands: true
    can_modify_docs: false
    
  ask:
    can_edit_code: false
    can_run_commands: false
    can_modify_docs: true
    file_patterns: ["*.md"]

# Context Mentions
context_mentions:
  file: true
  folder: true
  problems: true
  url: true
  git: true

# Checkpoints
checkpoints:
  enabled: true
  auto_create: true
  frequency: 30  # minutes
EOL
}

# Function to initialize project details
initialize_project() {
    echo -e "\n📋 Project Initialization"
    echo "-------------------------"
    
    PROJECT_NAME=$(get_input "Project name" "$(basename "$PROJECT_DIR")")
    PROJECT_TYPE=$(get_input "Project type (web/mobile/api/cli/library)" "web")
    PROJECT_DESCRIPTION=$(get_input "Project description" "A new software project")
    
    # Get MVP focus
    echo -e "\n🎯 MVP Focus"
    echo "Choose your initial focus area:"
    echo "1) UI/UX First - Start with user interface"
    echo "2) Core Features - Focus on key functionality"
    echo "3) Data/API - Begin with data structure/API"
    echo "4) Full Stack - Balanced approach"
    MVP_FOCUS=$(get_input "Select focus (1-4)" "1")
    
    # Development Mode
    echo -e "\n🔧 Development Mode"
    echo "Choose your development approach:"
    echo "1) Quick Prototype - Fastest path to working demo"
    echo "2) Production Ready - Full testing and documentation"
    echo "3) Hybrid - Balance between speed and quality"
    DEV_MODE=$(get_input "Select mode (1-3)" "1")
    
    # Create initial architecture plan with MVP focus
    cat > "$PROJECT_DIR/docs/cline_docs/architecture.md" <<EOL
# ${PROJECT_NAME} - Architecture Plan
Last Updated: $(date '+%Y-%m-%d %H:%M:%S')

## Project Overview
- Type: ${PROJECT_TYPE}
- Description: ${PROJECT_DESCRIPTION}
- MVP Focus: $(case $MVP_FOCUS in
    1) echo "UI/UX First";;
    2) echo "Core Features";;
    3) echo "Data/API";;
    4) echo "Full Stack";;
esac)
- Development Mode: $(case $DEV_MODE in
    1) echo "Quick Prototype";;
    2) echo "Production Ready";;
    3) echo "Hybrid";;
esac)

## MVP Scope
$(case $MVP_FOCUS in
    1) echo "### UI/UX Priority
- [ ] Basic user interface design
- [ ] Key user flows
- [ ] Interactive prototype
- [ ] User feedback collection";;
    2) echo "### Core Features Priority
- [ ] Essential functionality
- [ ] Basic data handling
- [ ] Critical user stories
- [ ] Core business logic";;
    3) echo "### Data/API Priority
- [ ] Data model design
- [ ] API endpoints
- [ ] Data validation
- [ ] Basic frontend integration";;
    4) echo "### Full Stack Priority
- [ ] Basic frontend
- [ ] Essential backend
- [ ] Data storage
- [ ] Core integrations";;
esac)

## Architecture Decisions
$(case $PROJECT_TYPE in
  "web")
    case $MVP_FOCUS in
      1) echo "- Frontend: Quick prototyping with basic HTML/CSS/JS or simple React
- Backend: Minimal API server
- Database: Local storage or simple JSON server
- Hosting: Quick deploy (Vercel/Netlify)";;
      2) echo "- Frontend: React/Vue (based on team expertise)
- Backend: Node.js/Express for rapid development
- Database: MongoDB for flexibility
- Hosting: Cloud platform (based on needs)";;
      *) echo "- Frontend Framework: To be decided (React/Vue/Angular)
- Backend: To be decided (Node.js/Python/Java)
- Database: To be decided (SQL/NoSQL)
- Hosting: To be decided (AWS/GCP/Azure)";;
    esac
    ;;
  "mobile")
    case $MVP_FOCUS in
      1) echo "- Platform: React Native for quick cross-platform MVP
- UI Kit: Ready-made components
- Backend: Firebase for rapid setup
- Storage: Cloud storage";;
      *) echo "- Platform: To be decided (Native/Cross-platform)
- Framework: To be decided (React Native/Flutter/Native)
- Backend: To be decided (Firebase/Custom)
- Storage: To be decided (Local/Cloud)";;
    esac
    ;;
  "api")
    echo "- API Style: To be decided (REST/GraphQL)
- Backend: To be decided (Node.js/Python/Java)
- Database: To be decided (SQL/NoSQL)
- Authentication: To be decided (JWT/OAuth)"
    ;;
  "cli")
    echo "- Language: To be decided (Node.js/Python/Go)
- Distribution: To be decided (npm/pip/brew)
- Interface: To be decided (Interactive/Command-based)"
    ;;
  "library")
    echo "- Language: To be decided (JavaScript/Python/Java)
- Distribution: To be decided (npm/pip/maven)
- API Design: To be decided (Modular/Monolithic)"
    ;;
esac)

## Development Approach
$(case $DEV_MODE in
    1) echo "### Quick Prototype Mode
- Focus on working features over perfect code
- Minimal testing, maximum speed
- Regular user feedback
- Iterate based on user needs";;
    2) echo "### Production Ready Mode
- Comprehensive testing
- Full documentation
- Security best practices
- Scalable architecture";;
    3) echo "### Hybrid Mode
- Balance speed and quality
- Key features tested
- Basic documentation
- Core security measures";;
esac)

## Next Steps
1. [ ] Set up basic development environment
2. [ ] Create minimal viable structure
3. [ ] Implement first MVP feature
4. [ ] Get user feedback

## Questions to Address
1. What is the absolute minimum feature set needed?
2. How can we get user feedback fastest?
3. What technical debt is acceptable for MVP?
4. What are the critical user needs?
EOL

    # Update project instructions
    cat > "$PROJECT_DIR/projectInstructions.md" <<EOL
# Project Instructions

## Overview
Project Name: ${PROJECT_NAME}
Type: ${PROJECT_TYPE}
Description: ${PROJECT_DESCRIPTION}
MVP Focus: $(case $MVP_FOCUS in
    1) echo "UI/UX First";;
    2) echo "Core Features";;
    3) echo "Data/API";;
    4) echo "Full Stack";;
esac)

## MVP Goals
- Create minimum viable ${PROJECT_TYPE} project
- Focus on essential features first
- Get rapid user feedback
- Iterate based on real usage

## Development Approach
$(case $DEV_MODE in
    1) echo "Quick Prototype Mode - Focus on speed and user feedback";;
    2) echo "Production Ready Mode - Focus on quality and completeness";;
    3) echo "Hybrid Mode - Balance between speed and quality";;
esac)

## Setup Status
- ✅ Git configuration
- ✅ Project structure
- ✅ Basic documentation
- ✅ Dependencies installation
- ✅ Architecture planning
- ⚠️ System initialization

## Next Steps
1. Review architecture.md for MVP plan
2. Set up minimal development environment
3. Start with highest priority feature
EOL

    echo -e "\n✨ Project initialized with MVP focus: $(case $MVP_FOCUS in
    1) echo "UI/UX First";;
    2) echo "Core Features";;
    3) echo "Data/API";;
    4) echo "Full Stack";;
esac)"
    echo "📁 Check docs/cline_docs/architecture.md for the initial architecture plan"
    echo "📝 Review and update the plan based on your MVP needs"
}

# Function to detect mode
detect_mode() {
    local dir="$1"
    
    # Check for existing memory bank
    if [ -d "$dir/docs/cline_docs" ]; then
        # If memory bank exists, use hybrid for upgrading
        echo "hybrid"
        return
    fi
    
    # Check for package.json (Node.js project)
    if [ -f "$dir/package.json" ]; then
        echo "full"
        return
    fi
    
    # Check for requirements.txt (Python project)
    if [ -f "$dir/requirements.txt" ]; then
        echo "full"
        return
    fi
    
    # Default to MVP for new projects
    echo "mvp"
}

function error_exit() {
    echo "Error: $1"
    exit 1
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -m|--mode)
      MODE="$2"
      [[ "$2" == "hybrid" ]] && HYBRID=true
      shift
      shift
      ;;
    -d|--dir)
      PROJECT_DIR="$2"
      shift
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Set project directory
PROJECT_DIR="${PROJECT_DIR:-$(pwd)}"

# Auto-detect mode if not specified
if [ -z "$MODE" ]; then
    MODE=$(detect_mode "$PROJECT_DIR")
    [[ "$MODE" == "hybrid" ]] && HYBRID=true
fi

# Create backup if existing system detected
if [ -d "$PROJECT_DIR/docs/cline_docs" ]; then
    echo "Existing Memory Bank system detected. Creating backup..."
    mkdir -p "$BACKUP_DIR"
    cp -r "$PROJECT_DIR/docs/cline_docs" "$BACKUP_DIR/"
    cp -r "$PROJECT_DIR/templates" "$BACKUP_DIR/" 2>/dev/null || true
    echo "Backup created in $BACKUP_DIR"
fi

# Display installation info
echo "Installing Memory Bank System..."
echo "Mode: ${MODE} (auto-detected)"
echo "Project Directory: ${PROJECT_DIR}"
echo "Valid modes: mvp, frontend-first, full, hybrid"
[[ "$HYBRID" == "true" ]] && echo "Using hybrid system (automated + manual updates)"

echo -e "\nChecking dependencies..."

# Check if node and npm are installed
if ! command -v node &> /dev/null; then
    error_exit "Node.js is not installed. Please install Node.js and npm to continue.\n  See: https://nodejs.org/"
fi

if ! command -v npm &> /dev/null; then
    error_exit "npm is not installed. Please install Node.js and npm to continue.\n  See: https://nodejs.org/"
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2)
if [ "$(echo "$NODE_VERSION 14.0.0" | awk '{print ($1 < $2)}')" -eq 1 ]; then
    error_exit "Node.js version 14.0.0 or higher is required. Current version: $NODE_VERSION"
fi

# Initialize package.json if it doesn't exist
if [ ! -f "$PROJECT_DIR/package.json" ]; then
    echo -e "\nInitializing Node.js project..."
    npm init -y || error_exit "Failed to initialize package.json"
fi

echo -e "\nCreating directories..."

# Create necessary directories
mkdir -p "$PROJECT_DIR/docs/cline_docs" || error_exit "Failed to create docs/cline_docs directory"
mkdir -p "$PROJECT_DIR/templates/tracking/templates" || error_exit "Failed to create templates directory"
mkdir -p "$PROJECT_DIR/tracking" || error_exit "Failed to create tracking directory"

# Copy template files
echo -e "\nCopying template files..."
cp templates/tracking/templates/*.template "$PROJECT_DIR/templates/tracking/templates/" || error_exit "Failed to copy template files"
cp templates/git-manager.mjs "$PROJECT_DIR/templates/" || error_exit "Failed to copy git-manager.mjs"
cp templates/doc-updater.mjs "$PROJECT_DIR/templates/" || error_exit "Failed to copy doc-updater.mjs"
cp templates/command-handler.mjs "$PROJECT_DIR/templates/" || error_exit "Failed to copy command-handler.mjs"

# Create format-manager.mjs
cat > "$PROJECT_DIR/templates/format-manager.mjs" <<EOL
export const formatManager = {
    async updateGitStatus(filePath, status) {
        // Implementation will be added in future updates
        console.log('Updating git status in:', filePath);
    },
    async addArchiveEntry(filePath, entry) {
        // Implementation will be added in future updates
        console.log('Adding archive entry to:', filePath);
    }
};
EOL

# Copy documentation templates
echo -e "\nInstalling documentation templates..."
for template in templates/tracking/templates/*.template; do
    filename=$(basename "$template" .template)
    cp "$template" "$PROJECT_DIR/docs/cline_docs/${filename}.md" || error_exit "Failed to copy ${filename}.md"
done

echo -e "\nSetting up .gitignore..."
# Check if .gitignore exists
if [ ! -f "$PROJECT_DIR/.gitignore" ]; then
    # Create default .gitignore
    cat > "$PROJECT_DIR/.gitignore" <<EOL
node_modules/
venv/
__pycache__/
.env
.vscode/
EOL
fi

# Add Memory Bank directories to .gitignore if not already present
for item in "docs/cline_docs/" "tracking/" ".vscode/" "rules/"; do
    if ! grep -q "$item" "$PROJECT_DIR/.gitignore"; then
        echo "$item" >> "$PROJECT_DIR/.gitignore"
    fi
done

# Create initial project instructions
if [ ! -f "$PROJECT_DIR/projectInstructions.md" ]; then
    cat > "$PROJECT_DIR/projectInstructions.md" <<EOL
# Project Instructions

## Overview
This is a Memory Bank System project that helps manage development workflow and documentation.

## Goals
- Maintain structured documentation
- Automate routine tasks
- Track project progress
- Integrate with git workflow

## Setup Status
- ✅ Git configuration
- ✅ Project structure
- ✅ Basic documentation
- ✅ Dependencies installation
- ⚠️ System initialization
EOL
fi

# Initialize git if not already initialized
if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo -e "\nInitializing git repository..."
    cd "$PROJECT_DIR"
    git init || error_exit "Failed to initialize git repository"
    git add . || error_exit "Failed to stage files"
    git commit -m "Initial commit: Memory Bank System setup" || error_exit "Failed to create initial commit"
fi

# Add before project initialization
echo -e "\nSetting up mode configuration..."
setup_modes

# Add after setup_modes and before initialize_project
echo -e "\nSetting up MCP integration..."
setup_mcp

# Add this before the final echo statements
echo -e "\nInitializing project details..."
initialize_project

# Function to setup semantic search
setup_semantic_search() {
    echo -e "\n🔍 Setting up semantic search..."
    mkdir -p "$PROJECT_DIR/.cline/search" || error_exit "Failed to create search directory"
    
    # Create search configuration
    cat > "$PROJECT_DIR/.cline/search/config.json" <<EOL
{
    "indexing": {
        "enabled": true,
        "file_patterns": ["*.js", "*.mjs", "*.ts", "*.py", "*.md"],
        "exclude_patterns": ["node_modules", "venv", "__pycache__"],
        "index_frequency": "on_change"
    },
    "search": {
        "max_results": 20,
        "context_lines": 3,
        "fuzzy_matching": true
    }
}
EOL
}

# Function to setup checkpoint tracking
setup_checkpoints() {
    echo -e "\n📍 Setting up checkpoint tracking..."
    mkdir -p "$PROJECT_DIR/.cline/checkpoints" || error_exit "Failed to create checkpoints directory"
    
    # Create checkpoint configuration
    cat > "$PROJECT_DIR/.cline/checkpoints/config.json" <<EOL
{
    "tracking": {
        "enabled": true,
        "auto_create": true,
        "frequency": 30,
        "types": ["code", "docs", "tests"]
    },
    "notifications": {
        "enabled": true,
        "channels": ["console"]
    }
}
EOL
}

# Function to setup MCP configuration
setup_mcp() {
    echo -e "\n🔌 Setting up Model Context Protocol (MCP)..."
    mkdir -p "$PROJECT_DIR/.cline/mcp" || error_exit "Failed to create MCP directory"
    
    # Create MCP configuration
    cat > "$PROJECT_DIR/.cline/mcp/config.json" <<EOL
{
    "version": "1.0.0",
    "tools": {
        "pinecone": {
            "enabled": true,
            "config": {
                "supabase_url": "${SUPABASE_URL:-}",
                "supabase_key": "${SUPABASE_KEY:-}",
                "pinecone_api_key": "${PINECONE_API_KEY:-}",
                "pinecone_environment": "${PINECONE_ENV:-}",
                "pinecone_index": "${PINECONE_INDEX:-}"
            }
        }
    },
    "auto_configure": true,
    "tool_suggestions": true
}
EOL

    # Create MCP tool registry
    cat > "$PROJECT_DIR/.cline/mcp/tools.json" <<EOL
{
    "available_tools": [
        {
            "name": "semantic-search",
            "description": "Semantic search using Pinecone",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "read-document",
            "description": "Read and process documents",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "process-document",
            "description": "Process and embed documents",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "list-documents",
            "description": "List available documents",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "pinecone-stats",
            "description": "View Pinecone statistics",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "aws_ec2",
            "description": "AWS EC2 resource management",
            "enabled": false,
            "requires_setup": true,
            "setup_instructions": "Configure AWS credentials"
        },
        {
            "name": "jira",
            "description": "Jira ticket integration",
            "enabled": false,
            "requires_setup": true,
            "setup_instructions": "Configure Jira API access"
        },
        {
            "name": "pagerduty",
            "description": "PagerDuty incident management",
            "enabled": false,
            "requires_setup": true,
            "setup_instructions": "Configure PagerDuty API access"
        },
        {
            "name": "browser",
            "description": "Browser automation for testing",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "token_optimizer",
            "description": "Optimize token usage and context",
            "enabled": true,
            "requires_setup": false,
            "config_file": true,
            "features": [
                "Smart chunking",
                "Priority token preservation",
                "Context compression",
                "Token usage tracking"
            ]
        },
        {
            "name": "memory_bank",
            "description": "Project memory and context management",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "hybrid_mode",
            "description": "Advanced hybrid development mode",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "checkpoint",
            "description": "Project checkpoint management",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "template_processor",
            "description": "Template processing and generation",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "git_manager",
            "description": "Git workflow automation",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "doc_updater",
            "description": "Documentation auto-updates",
            "enabled": true,
            "requires_setup": false
        },
        {
            "name": "format_manager",
            "description": "Content formatting and organization",
            "enabled": true,
            "requires_setup": false
        }
    ],
    "auto_discovery": true,
    "allow_custom_tools": true
}
EOL

    # Update MCP README to include new tools
    cat > "$PROJECT_DIR/.cline/mcp/README.md" <<EOL
# Model Context Protocol (MCP)

The MCP system allows Roo Code to dynamically add and manage tools. Currently configured tools:

## Active Tools
- ✅ Semantic Search - Semantic search using Pinecone
- ✅ Read and Process Documents - Read and process documents
- ✅ Process and Embed Documents - Process and embed documents
- ✅ List Available Documents - List available documents
- ✅ Pinecone Statistics - View Pinecone statistics

## Available Tools (Requires Setup)
- ⚠️ AWS EC2 Manager - EC2 resource management
- ⚠️ Jira Integration - Ticket management
- ⚠️ PagerDuty - Incident management
- ⚠️ Browser Automation - Testing and verification
- ⚠️ Token Optimizer - Smart token usage management

## Adding New Tools

To add a new tool:
1. Use the command: \`#mcp add tool <tool-name>\`
2. Follow the setup instructions
3. The tool will be automatically configured

## Tool Permissions

Tools inherit permissions from the current mode:
- MVP Mode: All tools available
- Architect Mode: Documentation tools only
- Code Mode: Development tools only
- Ask Mode: Research tools only

## Tool-Specific Setup

### Pinecone
This tool reads its configuration from config.json, which should contain:
\`\`\`json
{
    "pinecone": {
        "supabase_url": "${SUPABASE_URL:-}",
        "supabase_key": "${SUPABASE_KEY:-}",
        "pinecone_api_key": "${PINECONE_API_KEY:-}",
        "pinecone_environment": "${PINECONE_ENV:-}",
        "pinecone_index": "${PINECONE_INDEX:-}"
    }
}
\`\`\`

## Auto-Discovery

MCP will suggest relevant tools based on:
- Project type
- Current development phase
- File types being edited
EOL

    echo "✓ MCP configuration complete"
    echo "✓ Default tools configured"
    echo "✓ Tool registry initialized"
    echo "✓ Tools configured to use config.json"
}

# Add before final echo statements
setup_semantic_search
setup_checkpoints

echo "✓ Memory Bank System installed successfully"
echo "✓ Documentation initialized in docs/cline_docs/"
echo "✓ Command handler and tools installed"
echo "✓ Initial architecture plan created"

# Print next steps
echo -e "\nNext Steps:"
echo "1. Review docs/cline_docs/architecture.md and make technology decisions"
echo "2. Run: node templates/command-handler.mjs \"#load project\""
echo "3. Follow the prompts to complete initialization"
echo "4. Use node templates/command-handler.mjs help to see available commands"