#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { templateProcessor } from './template-processor.mjs';
import { installHybridSystem } from '../scripts/install-hybrid.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Project types and their specific configurations
 */
const PROJECT_TYPES = {
  NODE: {
    detect: async (dir) => {
      try {
        // Check if this is the template system itself
        const isTemplate = path.basename(dir) === 'memory-bank-system';
        if (isTemplate) return null;

        // Look for actual Node.js project indicators
        const pkg = JSON.parse(await fs.readFile(path.join(dir, 'package.json'), 'utf8'));
        const hasNodeModules = await fs.access(path.join(dir, 'node_modules')).then(() => true).catch(() => false);
        const hasSourceFiles = await fs.access(path.join(dir, 'src')).then(() => true).catch(() => false);

        // Only detect as Node.js if it has typical project structure
        if (hasNodeModules || hasSourceFiles) {
          return {
            type: 'Node.js',
            framework: pkg.dependencies?.react ? 'React' :
                      pkg.dependencies?.vue ? 'Vue' :
                      pkg.dependencies?.next ? 'Next.js' :
                      'Node.js',
            version: pkg.version
          };
        }
        return null;
      } catch {
        return null;
      }
    }
  },
  PYTHON: {
    detect: async (dir) => {
      try {
        // Check for multiple Python project indicators
        const hasRequirements = await fs.access(path.join(dir, 'requirements.txt')).then(() => true).catch(() => false);
        const hasPipfile = await fs.access(path.join(dir, 'Pipfile')).then(() => true).catch(() => false);
        const hasSetup = await fs.access(path.join(dir, 'setup.py')).then(() => true).catch(() => false);
        
        if (hasRequirements || hasPipfile || hasSetup) {
          return { type: 'Python' };
        }
        return null;
      } catch {
        return null;
      }
    }
  },
  GENERIC: {
    detect: async (dir) => {
      // Always return generic type as fallback
      return { type: 'Generic' };
    }
  }
};

/**
 * Check if memory bank exists in directory
 */
async function checkMemoryBank(dir) {
  const clineDocsDir = path.join(dir, 'docs', 'cline_docs');
  
  try {
    // Check if directory exists
    await fs.access(clineDocsDir);
    
    // Check if any core files exist
    const coreFiles = [
      'activeContext.md',
      'productContext.md',
      'progress.md',
      'systemPatterns.md',
      'techContext.md'
    ];

    for (const file of coreFiles) {
      const filePath = path.join(clineDocsDir, file);
      try {
        await fs.access(filePath);
        // If we find any core file, consider it an existing memory bank
        return true;
      } catch {
        continue;
      }
    }
  } catch {
    // Directory doesn't exist
  }
  
  return false;
}

/**
 * Detect project type from directory
 */
async function detectProjectType(dir) {
  // Try specific project types first
  for (const [name, detector] of Object.entries(PROJECT_TYPES)) {
    if (name === 'GENERIC') continue; // Skip generic type for now
    const result = await detector.detect(dir);
    if (result) return result;
  }
  
  // Fall back to generic type if no specific type detected
  return await PROJECT_TYPES.GENERIC.detect(dir);
}

/**
 * Deploy Memory Bank system
 */
async function deploy() {
  try {
    // Check if we're in a project directory
    const projectType = await detectProjectType(process.cwd());
    console.log(`\nDetected project type: ${projectType.type}`);
    
    // Check if memory bank already exists
    const hasMemoryBank = await checkMemoryBank(process.cwd());
    console.log(`Memory Bank ${hasMemoryBank ? 'found' : 'not found'}, ${hasMemoryBank ? 'upgrading' : 'creating new'}...`);
    
    // Install hybrid system
    await installHybridSystem(process.cwd(), !hasMemoryBank);
    
  } catch (error) {
    console.error('Deployment failed:', error);
    process.exit(1);
  }
}

// Run deployment
deploy();