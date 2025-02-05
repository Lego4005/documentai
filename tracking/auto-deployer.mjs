#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import { templateProcessor } from './template-processor.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Promisify readline question
const question = (query) => new Promise((resolve) => rl.question(query, resolve));

/**
 * Project scopes and their descriptions
 */
const PROJECT_SCOPES = {
  MVP: {
    description: 'Minimal viable product with core features only',
    focus: ['Core functionality', 'Basic UI', 'Essential features'],
    excludes: ['Authentication', 'Advanced features', 'Optimizations']
  },
  FRONTEND_FIRST: {
    description: 'Focus on UI/UX implementation first',
    focus: ['User interface', 'User experience', 'Frontend architecture'],
    excludes: ['Backend integration', 'Authentication', 'Advanced features']
  },
  FULL: {
    description: 'Complete implementation with all features',
    focus: ['All features', 'Full architecture', 'Complete system'],
    excludes: []
  }
};

/**
 * Project types and their specific configurations
 */
const PROJECT_TYPES = {
  NODE: {
    detect: async (dir) => {
      try {
        const pkg = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf8'));
        return {
          type: 'Node.js',
          framework: pkg.dependencies?.react ? 'React' :
                    pkg.dependencies?.vue ? 'Vue' :
                    pkg.dependencies?.next ? 'Next.js' :
                    'Node.js',
          version: pkg.version
        };
      } catch {
        return null;
      }
    }
  },
  PYTHON: {
    detect: async (dir) => {
      try {
        await fs.access(path.join(dir, 'requirements.txt'));
        return { type: 'Python' };
      } catch {
        return null;
      }
    }
  }
};

/**
 * Core files that must exist in every Memory Bank
 */
const CORE_FILES = [
  'activeContext.md',
  'productContext.md',
  'progress.md',
  'systemPatterns.md',
  'techContext.md'
];

/**
 * Support files for tracking and automation
 */
const TRACKING_FILES = [
  'status-tracker.mjs',
  'memory-bank-parser.mjs',
  'checklist-parser.mjs',
  'status-handler.mjs'
];

/**
 * Rule files that must be created
 */
const RULE_FILES = {
  '.clinerules': `# Cline's Memory Bank Rules...`,
  '.clinerrules': `# Project-Specific Rules...`
};

/**
 * Check for MCP server availability
 */
async function checkMcpServer() {
  try {
    const response = await fetch('http://localhost:3000/mcp/status');
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Detect project type from directory
 */
async function detectProjectType(dir) {
  for (const [name, detector] of Object.entries(PROJECT_TYPES)) {
    const result = await detector.detect(dir);
    if (result) return result;
  }
  return null;
}

/**
 * Create backup of existing files
 */
async function createBackup(dir) {
  const backupDir = path.join(dir, 'docs', 'cline_docs', 'backups', 
    new Date().toISOString().replace(/[:.]/g, '-'));
  
  try {
    await fs.mkdir(backupDir, { recursive: true });
    
    // Backup existing Memory Bank files
    const clineDocsDir = path.join(dir, 'docs', 'cline_docs');
    const files = await fs.readdir(clineDocsDir);
    
    for (const file of files) {
      if (file === 'backups') continue;
      await fs.copyFile(
        path.join(clineDocsDir, file),
        path.join(backupDir, file)
      );
    }

    // Backup rule files
    for (const ruleFile of Object.keys(RULE_FILES)) {
      try {
        await fs.copyFile(
          path.join(dir, ruleFile),
          path.join(backupDir, ruleFile)
        );
      } catch (error) {
        // Ignore if rule files don't exist
        if (error.code !== 'ENOENT') throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Backup failed:', error);
    return false;
  }
}

/**
 * Collect project information interactively
 */
async function collectProjectInfo() {
  console.log('\nProject Setup');
  console.log('=============');
  
  // Select project scope
  console.log('\nAvailable Project Scopes:');
  for (const [scope, info] of Object.entries(PROJECT_SCOPES)) {
    console.log(`\n${scope}:`);
    console.log(`  Description: ${info.description}`);
    console.log('  Focus:');
    info.focus.forEach(item => console.log(`    - ${item}`));
    if (info.excludes.length > 0) {
      console.log('  Excludes:');
      info.excludes.forEach(item => console.log(`    - ${item}`));
    }
  }
  
  const scope = await question('\nSelect project scope (MVP/FRONTEND_FIRST/FULL): ');
  if (!PROJECT_SCOPES[scope.toUpperCase()]) {
    console.error('Invalid scope selected');
    process.exit(1);
  }

  const info = {
    PROJECT_NAME: await question('Project name: '),
    PROJECT_PURPOSE: await question('Project purpose: '),
    PROJECT_SCOPE: scope.toUpperCase(),
    FEATURES: [],
    PRIORITIES: []
  };
  
  console.log('\nKey features (enter empty line to finish):');
  while (true) {
    const feature = await question('- ');
    if (!feature) break;
    info.FEATURES.push(feature);
  }

  console.log('\nTop priorities (enter empty line to finish):');
  while (true) {
    const priority = await question('- ');
    if (!priority) break;
    info.PRIORITIES.push(priority);
  }
  
  info.TECH_STACK = (await question('\nTechnical stack (comma-separated): '))
    .split(',')
    .map(tech => tech.trim())
    .filter(Boolean);

  info.SUCCESS_METRICS = await question('Success metrics: ');
  info.TEAM = await question('Team/stakeholders: ');
  info.TIMELINE = await question('Timeline/milestones: ');

  // Check MCP server
  const mcpAvailable = await checkMcpServer();
  info.MCP_AVAILABLE = mcpAvailable;
  if (mcpAvailable) {
    console.log('✓ MCP server detected and available');
  } else {
    console.log('⚠️ MCP server not detected');
  }
  
  return info;
}

/**
 * Deploy Memory Bank system
 */
async function deploy() {
  try {
    // Check if we're in a project directory
    const projectType = await detectProjectType(process.cwd());
    if (!projectType) {
      console.error('Error: Not in a valid project directory');
      process.exit(1);
    }

    console.log(`\nDetected project type: ${projectType.type}`);
    
    // Determine if this is a new project or upgrade
    const isNewProject = await question('\nIs this a new project? (y/n): ');
    
    if (isNewProject.toLowerCase() === 'y') {
      // Collect project information
      const projectInfo = await collectProjectInfo();
      
      // Create directory structure
      await fs.mkdir(path.join(process.cwd(), 'docs', 'cline_docs'), { recursive: true });
      await fs.mkdir(path.join(process.cwd(), 'tracking'), { recursive: true });
      
      // Create rule files
      for (const [filename, content] of Object.entries(RULE_FILES)) {
        await fs.writeFile(path.join(process.cwd(), filename), content);
      }
      
      // Copy tracking system
      for (const file of TRACKING_FILES) {
        await fs.copyFile(
          path.join(__dirname, file),
          path.join(process.cwd(), 'tracking', file)
        );
      }
      
      // Generate Memory Bank files from templates
      await templateProcessor.generateMemoryBankFiles(process.cwd(), projectInfo);
      
    } else {
      // Create backup
      console.log('\nCreating backup...');
      const backupSuccess = await createBackup(process.cwd());
      if (!backupSuccess) {
        console.error('Failed to create backup. Aborting.');
        process.exit(1);
      }
      
      // Copy tracking system
      console.log('Installing tracking system...');
      await fs.mkdir(path.join(process.cwd(), 'tracking'), { recursive: true });
      for (const file of TRACKING_FILES) {
        await fs.copyFile(
          path.join(__dirname, file),
          path.join(process.cwd(), 'tracking', file)
        );
      }
      
      // Create or update rule files
      for (const [filename, content] of Object.entries(RULE_FILES)) {
        const filePath = path.join(process.cwd(), filename);
        try {
          await fs.access(filePath);
          console.log(`${filename} exists, skipping...`);
        } catch {
          await fs.writeFile(filePath, content);
          console.log(`Created ${filename}`);
        }
      }
    }
    
    console.log('\nMemory Bank system deployed successfully!');
    rl.close();
    
  } catch (error) {
    console.error('Deployment failed:', error);
    rl.close();
    process.exit(1);
  }
}

// Run deployment
deploy();