#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Check if memory bank exists
 */
async function checkMemoryBank(projectPath) {
  try {
    const clineDocsPath = path.join(projectPath, 'docs', 'cline_docs');
    await fs.access(clineDocsPath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Create new memory bank
 */
async function createMemoryBank(projectPath) {
  console.log('\nCreating new Memory Bank System...');
  
  // Create directories
  const clineDocsPath = path.join(projectPath, 'docs', 'cline_docs');
  const trackingPath = path.join(projectPath, 'tracking');
  
  await fs.mkdir(clineDocsPath, { recursive: true });
  await fs.mkdir(trackingPath, { recursive: true });

  // Copy system files
  const systemFiles = [
    'command-handler.mjs',
    'doc-updater.mjs',
    'format-manager.mjs',
    'git-manager.mjs',
    'simple-updater.mjs',
    'simple-command.mjs'
  ];

  for (const file of systemFiles) {
    const sourcePath = path.join(__dirname, file);
    const targetPath = path.join(trackingPath, file);
    await fs.copyFile(sourcePath, targetPath);
  }

  // Initialize memory bank files
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' EST';

  // Create activeContext.md
  const activeContext = [
    '# Active Development Context',
    'Version: 1.0.0',
    `Last Updated: ${timestamp}\n`,
    '## Metadata',
    '- **Type**: Active Context',
    '- **Version**: 1.0.0',
    `- **Last Updated**: ${timestamp}`,
    '- **Dependencies**: []',
    '- **Status**: ✅ Active',
    '- **Importance**: 100/100',
    '- **Overall Completion**: 0%\n',
    '## Quick Reference',
    '- 🧠 Current focus and active tasks',
    '- ⚙️ Recent changes and updates',
    '- 🛠️ System improvements',
    '- 📈 Progress tracking\n',
    '## Current Task',
    'Initial setup (Importance: 100/100, Completion: 0%)\n',
    '## Recent Changes',
    '- Memory bank system initialized\n',
    '## Current Challenges',
    '- Set up initial project structure\n',
    '## Dependencies',
    '- None yet\n',
    '## Next Steps',
    '1. Review documentation\n',
    '## System Health',
    '- System initialized\n',
    '## Archive',
    `[${timestamp}] Memory Bank System initialized`
  ].join('\n');

  await fs.writeFile(
    path.join(clineDocsPath, 'activeContext.md'),
    activeContext
  );

  console.log('✓ Memory Bank System created successfully!');
  console.log('\nNext steps:');
  console.log('1. Review docs/cline_docs/activeContext.md');
  console.log('2. Run #loadmemory to initialize the system');
}

/**
 * Upgrade existing memory bank
 */
async function upgradeMemoryBank(projectPath) {
  console.log('\nUpgrading existing Memory Bank System...');
  
  // Import upgrade functionality
  const upgradePath = path.join(__dirname, 'upgrade-memory.mjs');
  const { upgrade } = await import(upgradePath);
  
  // Run upgrade
  await upgrade(projectPath);
}

/**
 * Initialize memory bank system
 */
async function initialize() {
  try {
    console.log('\nMemory Bank System Initializer');
    console.log('============================');

    const projectPath = process.cwd();
    const hasMemoryBank = await checkMemoryBank(projectPath);

    if (hasMemoryBank) {
      await upgradeMemoryBank(projectPath);
    } else {
      await createMemoryBank(projectPath);
    }

  } catch (error) {
    console.error('Initialization failed:', error);
    process.exit(1);
  }
}

// Run initializer
initialize();