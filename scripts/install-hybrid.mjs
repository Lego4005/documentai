#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';
import { templateProcessor } from '../tracking/template-processor.mjs';
import { verifyMemoryBank } from './verify-memory-bank.mjs';
import { fileURLToPath } from 'url';

// Get directory path in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkRules(projectDir) {
  // Check if rules files exist and are valid
  const ruleFiles = ['.clinerules', '.clinerules-architect'];
  let rulesValid = true;

  for (const ruleFile of ruleFiles) {
    try {
      const content = await fs.readFile(path.join(projectDir, ruleFile), 'utf8');
      // Basic validation - ensure file has content and required sections
      if (!content.includes('Memory Bank Rules') || 
          !content.includes('Core Principles') ||
          !content.includes('Documentation Standards')) {
        console.log(`⚠️ ${ruleFile} is missing required sections`);
        rulesValid = false;
      }
    } catch (error) {
      console.log(`⚠️ ${ruleFile} not found or inaccessible`);
      rulesValid = false;
    }
  }

  return rulesValid;
}

async function verifyAiModifiedFiles(projectDir) {
  // Check if AI-modified files follow the rules
  const docsDir = path.join(projectDir, 'docs', 'cline_docs');
  const verified = await verifyMemoryBank(projectDir);

  if (!verified) {
    // If verification fails, check if rules are valid
    const rulesValid = await checkRules(projectDir);
    
    if (rulesValid) {
      console.log('\nRules are valid but AI-modified files do not comply.');
      console.log('Recommended actions:');
      console.log('1. Have AI reread rules using #load');
      console.log('2. Save state with #status');
      console.log('3. Start fresh with #next');
      
      // Ask user what to do
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const response = await new Promise(resolve => {
        readline.question('\nChoose action (1-3): ', resolve);
      });
      readline.close();

      switch (response) {
        case '1':
          console.log('\nPlease use #load to have AI reread rules');
          break;
        case '2':
          console.log('\nPlease use #status to save current state');
          break;
        case '3':
          console.log('\nPlease use #next to start fresh');
          break;
        default:
          console.log('\nInvalid choice. Please manually resolve issues');
      }
      
      return false;
    } else {
      console.log('\n⚠️ Rules files are invalid or missing.');
      console.log('Please fix rules files before proceeding.');
      return false;
    }
  }

  return true;
}

async function installHybridSystem(projectDir, isNewProject = false) {
  try {
    // For existing projects, verify AI-modified files follow rules
    if (!isNewProject) {
      const verified = await verifyAiModifiedFiles(projectDir);
      if (!verified) {
        throw new Error('Verification failed - please resolve issues before proceeding');
      }
    }

    // Create tracking directory
    const trackingDir = path.join(projectDir, 'tracking');
    await fs.mkdir(trackingDir, { recursive: true });

    // Copy hybrid memory bank script
    const hybridScript = await fs.readFile(
      path.join(__dirname, '../templates/hybrid-memory-bank.mjs'),
      'utf8'
    );

    // Get project info
    const packageJson = JSON.parse(
      await fs.readFile(path.join(projectDir, 'package.json'), 'utf8')
    );

    // Detect tech stack from dependencies
    const techStack = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {})
    ];

    // Get git branches for priorities
    const branches = execSync('git branch --format="%(refname:short)"', {
      cwd: projectDir
    }).toString().trim().split('\n');

    // Initialize project config
    const projectConfig = {
      PROJECT_SCOPE: 'HYBRID',
      TECH_STACK: techStack.join(','),
      PRIORITIES: branches
        .filter(b => b.startsWith('feat/'))
        .map(b => b.replace('feat/', ''))
        .join(',')
    };

    // Replace template variables
    const configuredScript = hybridScript
      .replace('{{PROJECT_SCOPE}}', projectConfig.PROJECT_SCOPE)
      .replace('{{TECH_STACK}}', projectConfig.TECH_STACK)
      .replace('{{PRIORITIES}}', projectConfig.PRIORITIES);

    // Write configured script
    await fs.writeFile(
      path.join(trackingDir, 'hybrid-memory-bank.mjs'),
      configuredScript
    );

    // Make script executable
    await fs.chmod(path.join(trackingDir, 'hybrid-memory-bank.mjs'), 0o755);

    // Add npm script
    packageJson.scripts = packageJson.scripts || {};
    packageJson.scripts['update-memory'] = 'node tracking/hybrid-memory-bank.mjs';
    
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Only generate Memory Bank files for new projects
    if (isNewProject) {
      await templateProcessor.generateMemoryBankFiles(projectDir, projectConfig);
    }

    // Add git hooks for automatic updates
    const hooksDir = path.join(projectDir, '.git', 'hooks');
    const postCommitHook = `#!/bin/sh
npm run update-memory`;

    await fs.writeFile(path.join(hooksDir, 'post-commit'), postCommitHook);
    await fs.chmod(path.join(hooksDir, 'post-commit'), 0o755);

    console.log('\n✓ Hybrid Memory Bank system installed successfully');
    console.log('✓ Added npm script: update-memory');
    console.log('✓ Added git post-commit hook');
    console.log('\nMemory Bank Commands:');
    console.log('1. #load - Start/join project');
    console.log('2. #status - Save state & check progress');
    console.log('3. #next - Start fresh chat with new task');
    console.log('\nAutomation:');
    console.log('- Auto-commits for significant changes');
    console.log('- Auto-updates after commits');
  } catch (error) {
    console.error('Error installing Hybrid Memory Bank system:', error);
    throw error;
  }
}

// Run installer if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const projectDir = process.argv[2] || process.cwd();
  const isNewProject = process.argv[3] === '--new';
  installHybridSystem(projectDir, isNewProject).catch(() => process.exit(1));
}

export { installHybridSystem };