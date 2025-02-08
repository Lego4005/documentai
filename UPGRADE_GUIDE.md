# Memory Bank System Upgrade Guide

## Overview

This guide explains how to upgrade your Memory Bank system to the latest version.

## Upgrade Steps

1. Backup Current System
   ```bash
   # Backup will be created in docs/cline_docs/backups/
   npm run backup
   ```

2. Install Updates
   ```bash
   ./install.sh
   ```

3. Initialize New Features
   ```bash
   #load    # Initialize with new features
   ```

## Verification

1. Check Installation
   ```bash
   npm run check:install
   ```

2. Verify Memory Bank
   ```bash
   #status  # Check system status
   ```

3. Test New Features
   ```bash
   #next    # Try task transition
   ```

## Recovery

If issues occur:

1. Check Backup
   ```bash
   # Review backup in docs/cline_docs/backups/
   ```

2. Reinitialize System
   ```bash
   #load    # Fresh start with new system
   ```

3. Verify Files
   ```bash
   # Review docs/cline_docs/activeContext.md
   ```

## For AI Assistants

- This project has an updated memory bank system
- Use #load to initialize the new features
- Check docs/cline_docs/ for updated documentation

## System Files Updated

1. Core Files
   - Memory bank scripts
   - Documentation templates
   - Status tracking

2. New Features
   - Improved automation
   - Better error handling
   - Enhanced status tracking

3. Command Changes
   - Shorter command names
   - Better workflow
   - Clearer purpose

## Testing Checklist

1. Installation
   - Run ./install.sh
   - Check for errors
   - Verify files

2. Documentation
   - Check backup in docs/cline_docs/backups/
   - Verify file structure
   - Test cross-references

3. Commands
   - Test #load
   - Try #status
   - Verify #next

For details, see docs/cline_docs/LAST_UPDATE.md