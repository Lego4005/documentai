#!/bin/bash

MODE=""
HYBRID=false
PROJECT_DIR=""

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

# Display installation info
echo "Installing Memory Bank System..."
echo "Mode: ${MODE} (auto-detected)"
echo "Project Directory: ${PROJECT_DIR}"
echo "Valid modes: mvp, frontend-first, full, hybrid"
[[ "$HYBRID" == "true" ]] && echo "Using hybrid system (automated + manual updates)"

# Install dependencies and run auto-deployer
if ! npm install; then
  echo "Installation failed"
  exit 1
fi

# Run template processor only if not hybrid (hybrid mode uses auto-deployer)
if [[ "$HYBRID" != "true" ]]; then
  # Copy tracking directory
  find "/home/lego/templates/memory-bank-system/tracking" -depth 0 -print0 | cpio -pdmv0 "./tracking"

  # Copy tracking directory
  find "/home/lego/templates/memory-bank-system/tracking" -depth 0 -print0 | cpio -pdmv0 "./tracking"

  if ! node tracking/template-processor.mjs "$PROJECT_DIR" "{\"PROJECT_SCOPE\": \"${MODE:-FULL}\"}"; then
    echo "Template processing failed"
    exit 1
  fi
  
  echo "✓ Memory Bank System installed successfully"
  echo "✓ Documentation initialized in docs/cline_docs/"
  echo "✓ Status tracking enabled"
fi


# Print next steps
echo -e "\nNext Steps:"
echo "1. If verification passed:"
echo "   Use #loadmemory to have AI read updated rules"
echo ""
echo "2. If verification failed:"
echo "   Use #updatememory to have AI start fresh with new rules"
echo ""
echo "3. The AI will then:"
echo "   - Check files against rules"
echo "   - Fix any non-compliant files"
echo "   - Update documentation as needed"