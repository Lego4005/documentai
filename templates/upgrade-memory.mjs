#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Change log of memory bank system updates
 */
const CHANGE_LOG = [
  {
    version: '1.1.0',
    changes: [
      'Added development mode selection (LOCAL/DIRECT)',
      'Enhanced Supabase integration',
      'Improved SQL query handling',
      'Added change tracking'
    ],
    migrations: [
      'Update activeContext.md format',
      'Add devMode to project settings',
      'Update memory commands'
    ]
  },
  {
    version: '1.2.0',
    changes: [
      'Added smart documentation updates',
      'Enhanced git integration',
      'Added format preservation',
      'Improved error handling'
    ],
    migrations: [
      'Add new system files',
      'Update documentation',
      'Add edge case handling'
    ],
    files: {
      system: [
        'command-handler.mjs',
        'doc-updater.mjs',
        'format-manager.mjs',
        'git-manager.mjs',
        'simple-updater.mjs',
        'simple-command.mjs'
      ]
    }
  }
];

/**
 * Create update summary for AIs and humans
 */
async function createUpdateSummary(projectPath, currentVersion, changes) {
  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }) + ' EST';

  const summary = [
    '# Memory Bank System Update Summary',
    `\nLast Updated: ${timestamp}`,
    `Previous Version: ${currentVersion}`,
    `New Version: ${changes[changes.length - 1].version}\n`,
    '## What Changed',
    ...changes.flatMap(change => [
      `\n### Version ${change.version}:`,
      '\nChanges:',
      ...change.changes.map(item => `- ${item}`),
      '\nMigrations:',
      ...change.migrations.map(item => `- ${item}`)
    ]),
    '\n## What Was Updated',
    '- Created backup in docs/cline_docs/backups/',
    '- Updated version numbers',
    '- Added changes to archive sections',
    changes.some(c => c.files) ? '- Updated system files in tracking/' : '',
    '\n## Next Steps',
    '1. Review changes in docs/cline_docs/',
    '2. Check backup in docs/cline_docs/backups/',
    '3. Run #loadmemory to initialize new features',
    '\n## For AI Assistants',
    '- This project now has an updated memory bank system',
    '- Use #loadmemory to initialize the new features',
    '- Check docs/cline_docs/ for updated documentation',
    '- Previous version files are in docs/cline_docs/backups/',
    '\n## Verification Steps',
    '1. Check that version numbers are updated',
    '2. Verify that new features are working',
    '3. Confirm documentation is accessible',
    '4. Test memory bank commands (#loadmemory, #status)',
    '\n## System Files Updated',
    'The following files in tracking/ were updated:',
    ...changes.filter(c => c.files).flatMap(c => 
      c.files.system.map(file => `- ${file}`)
    )
  ].filter(Boolean).join('\n');

  const summaryPath = path.join(projectPath, 'docs', 'cline_docs', 'LAST_UPDATE.md');
  await fs.writeFile(summaryPath, summary);
}

/**
 * Detect current memory bank version
 */
async function detectVersion(projectPath) {
  try {
    const activeContextPath = path.join(projectPath, 'docs', 'cline_docs', 'activeContext.md');
    const content = await fs.readFile(activeContextPath, 'utf8');
    const versionMatch = content.match(/Version: (\d+\.\d+\.\d+)/);
    return versionMatch ? versionMatch[1] : '1.0.0';
  } catch {
    return '1.0.0';
  }
}

/**
 * Get needed migrations
 */
function getNeededMigrations(currentVersion) {
  return CHANGE_LOG.filter(change => {
    const [major, minor] = change.version.split('.').map(Number);
    const [curMajor, curMinor] = currentVersion.split('.').map(Number);
    return major > curMajor || (major === curMajor && minor > curMinor);
  });
}

/**
 * Update memory bank files
 */
async function updateMemoryBank(projectPath, changes) {
  // Create backup
  const backupDir = path.join(
    projectPath, 
    'docs', 
    'cline_docs', 
    'backups',
    new Date().toISOString().replace(/[:.]/g, '-')
  );
  
  await fs.mkdir(backupDir, { recursive: true });

  // Backup existing files
  const clineDocsDir = path.join(projectPath, 'docs', 'cline_docs');
  const files = await fs.readdir(clineDocsDir);
  
  for (const file of files) {
    if (file === 'backups') continue;
    await fs.copyFile(
      path.join(clineDocsDir, file),
      path.join(backupDir, file)
    );
  }

  // Copy new system files
  for (const change of changes) {
    if (change.files) {
      // Copy system files
      const trackingDir = path.join(projectPath, 'tracking');
      await fs.mkdir(trackingDir, { recursive: true });

      for (const file of change.files.system) {
        const sourcePath = path.join(__dirname, file);
        const targetPath = path.join(trackingDir, file);
        
        try {
          await fs.copyFile(sourcePath, targetPath);
          console.log(`Updated ${file}`);
        } catch (error) {
          console.error(`Failed to update ${file}:`, error.message);
        }
      }
    }
  }

  // Update version in files
  const latestVersion = CHANGE_LOG[CHANGE_LOG.length - 1].version;
  
  for (const file of files) {
    if (file === 'backups') continue;
    const filePath = path.join(clineDocsDir, file);
    let content = await fs.readFile(filePath, 'utf8');
    
    // Update version
    content = content.replace(
      /Version: (\d+\.\d+\.\d+)/,
      `Version: ${latestVersion}`
    );

    // Add change log entry
    const timestamp = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' EST';

    const changeLog = changes
      .map(change => `- Upgraded to ${change.version}:\n  ${change.changes.join('\n  ')}`)
      .join('\n');

    if (content.includes('## Archive')) {
      content = content.replace(
        '## Archive',
        `## Archive\n[${timestamp}] Memory Bank System upgraded:\n${changeLog}\n`
      );
    }

    await fs.writeFile(filePath, content);
  }

  return true;
}

/**
 * Upgrade memory bank system
 */
async function upgrade() {
  try {
    console.log('\nMemory Bank System Upgrade');
    console.log('========================');

    // Detect current version
    const currentVersion = await detectVersion(process.cwd());
    console.log(`\nCurrent version: ${currentVersion}`);

    // Get needed migrations
    const neededChanges = getNeededMigrations(currentVersion);
    
    if (neededChanges.length === 0) {
      console.log('\nYour Memory Bank System is up to date!');
      return;
    }

    console.log('\nAvailable updates:');
    neededChanges.forEach(change => {
      console.log(`\nVersion ${change.version}:`);
      console.log('Changes:');
      change.changes.forEach(item => console.log(`- ${item}`));
      console.log('\nMigrations:');
      change.migrations.forEach(item => console.log(`- ${item}`));
    });

    // Create backup and update files
    console.log('\nUpdating Memory Bank System...');
    await updateMemoryBank(process.cwd(), neededChanges);

    // Create update summary
    await createUpdateSummary(process.cwd(), currentVersion, neededChanges);

    console.log('\n✓ Memory Bank System upgraded successfully!');
    console.log('\nNext steps:');
    console.log('1. Review changes in docs/cline_docs/');
    console.log('2. Check backup in docs/cline_docs/backups/');
    console.log('3. Run #loadmemory to initialize new features');
    console.log('\nFor details, see docs/cline_docs/LAST_UPDATE.md');
    
  } catch (error) {
    console.error('Upgrade failed:', error);
    process.exit(1);
  }
}

// Run upgrade
upgrade();