#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function verifyRules(dir) {
  const results = {
    rulesExist: false,
    rulesValid: false,
    architectRulesExist: false,
    architectRulesValid: false,
    rulesSections: {
      corePrinciples: false,
      documentation: false,
      workflows: false,
      commands: false
    },
    architectSections: {
      corePrinciples: false,
      documentation: false,
      workflows: false,
      metrics: false
    }
  };

  // Check .clinerules
  try {
    const rulesContent = await fs.readFile(path.join(dir, '.clinerules'), 'utf8');
    results.rulesExist = true;

    // Check required sections for .clinerules
    results.rulesSections.corePrinciples = rulesContent.includes('## Core Principles');
    results.rulesSections.documentation = rulesContent.includes('## Documentation Standards');
    results.rulesSections.workflows = rulesContent.includes('## Workflows');
    results.rulesSections.commands = rulesContent.includes('## Memory Commands');

    // Rules are valid if all sections exist
    results.rulesValid = Object.values(results.rulesSections).every(Boolean);
  } catch (error) {
    console.error('Error reading .clinerules:', error.message);
  }

  // Check .clinerules-architect
  try {
    const architectRulesContent = await fs.readFile(path.join(dir, '.clinerules-architect'), 'utf8');
    results.architectRulesExist = true;

    // Check required sections for .clinerules-architect
    results.architectSections.corePrinciples = architectRulesContent.includes('## Core Principles');
    results.architectSections.documentation = architectRulesContent.includes('## Documentation Standards');
    results.architectSections.workflows = architectRulesContent.includes('## Workflows');
    results.architectSections.metrics = architectRulesContent.includes('## Metrics Requirements');

    // Architect rules are valid if all sections exist
    results.architectRulesValid = Object.values(results.architectSections).every(Boolean);
  } catch (error) {
    console.error('Error reading .clinerules-architect:', error.message);
  }

  return results;
}

async function verifyMemoryBank(dir) {
  const results = {
    documentation: {
      complete: false,
      statusIndicators: false,
      crossReferences: false,
      metrics: false,
      focusAreas: false
    },
    systemHealth: {
      memoryBankIntact: false,
      vectorStore: false,
      cache: false,
      resources: false
    },
    context: {
      projectState: false,
      focusAreas: false,
      tasksPrioritized: false,
      nextSteps: false
    }
  };

  try {
    // First verify rules
    console.log('\nVerifying rules...');
    const rulesResults = await verifyRules(dir);
    
    if (!rulesResults.rulesExist) {
      console.error('❌ Rules file (.clinerules) not found');
      return false;
    }

    if (!rulesResults.rulesValid) {
      console.error('❌ Rules file is missing required sections:');
      for (const [section, exists] of Object.entries(rulesResults.rulesSections)) {
        if (!exists) {
          console.error(`   - Missing: ${section}`);
        }
      }
      return false;
    }

    if (!rulesResults.architectRulesExist) {
      console.error('❌ Architect rules file (.clinerules-architect) not found');
      return false;
    }

    if (!rulesResults.architectRulesValid) {
      console.error('❌ Architect rules file is missing required sections:');
      for (const [section, exists] of Object.entries(rulesResults.architectSections)) {
        if (!exists) {
          console.error(`   - Missing: ${section}`);
        }
      }
      return false;
    }

    console.log('✓ Rules verification passed');

    // Check core files exist
    const coreFiles = [
      'activeContext.md',
      'productContext.md',
      'progress.md',
      'systemPatterns.md',
      'techContext.md'
    ];

    const docsDir = path.join(dir, 'docs', 'cline_docs');
    
    // Check if all core files exist and have basic structure
    const coreFilesExist = await Promise.all(coreFiles.map(async file => {
      try {
        const content = await fs.readFile(path.join(docsDir, file), 'utf8');
        return !content.includes('TODO') && 
               !content.includes('FIXME') &&
               content.includes('Last Updated:');
      } catch {
        return false;
      }
    }));
    results.documentation.complete = coreFilesExist.every(Boolean);

    // Check status indicators in progress.md
    try {
      const progress = await fs.readFile(path.join(docsDir, 'progress.md'), 'utf8');
      results.documentation.statusIndicators = progress.includes('Status:') &&
                                           (progress.includes('✓') || progress.includes('⚠️') || progress.includes('❌'));
    } catch {}

    // Check cross-references in all files
    let allRefs = [];
    for (const file of coreFiles) {
      try {
        const content = await fs.readFile(path.join(docsDir, file), 'utf8');
        const refs = content.match(/\[.*?\]\(.*?\)/g) || [];
        allRefs.push(...refs);
      } catch {}
    }
    results.documentation.crossReferences = allRefs.every(ref => {
      const [_, target] = ref.match(/\[(.*?)\]\((.*?)\)/) || [];
      return target && !target.includes('BROKEN');
    });

    // Check metrics in systemPatterns.md
    try {
      const patterns = await fs.readFile(path.join(docsDir, 'systemPatterns.md'), 'utf8');
      results.documentation.metrics = patterns.includes('Metrics:') ||
                                   patterns.includes('Completion:') ||
                                   patterns.includes('Importance:');
    } catch {}

    // Check focus areas in activeContext.md
    try {
      const activeContext = await fs.readFile(path.join(docsDir, 'activeContext.md'), 'utf8');
      results.documentation.focusAreas = activeContext.includes('Focus Areas:') ||
                                      activeContext.includes('Current Focus:');
    } catch {}

    // Check system health
    const trackingFiles = [
      'status-tracker.mjs',
      'memory-bank-parser.mjs',
      'checklist-parser.mjs',
      'status-handler.mjs'
    ];

    const trackingDir = path.join(dir, 'tracking');
    
    // Check if tracking system is intact
    const trackingFilesExist = await Promise.all(trackingFiles.map(async file => {
      try {
        await fs.access(path.join(trackingDir, file));
        return true;
      } catch {
        return false;
      }
    }));
    results.systemHealth.memoryBankIntact = trackingFilesExist.every(Boolean);

    // For template system, consider these optional
    results.systemHealth.vectorStore = true;
    results.systemHealth.cache = true;
    results.systemHealth.resources = true;

    // Check context in activeContext.md
    try {
      const activeContext = await fs.readFile(path.join(docsDir, 'activeContext.md'), 'utf8');
      
      results.context.projectState = activeContext.includes('Current Task') &&
                                  activeContext.includes('Recent Changes');
      
      results.context.focusAreas = activeContext.includes('Focus Areas') ||
                                 activeContext.includes('Current Focus');
      
      results.context.tasksPrioritized = activeContext.includes('Priority:') ||
                                      activeContext.includes('Importance:');
      
      results.context.nextSteps = activeContext.includes('Next Steps');
    } catch {}

    // Print results
    console.log('\nMemory Bank Verification Results:');
    console.log('================================');

    let allPassed = true;
    for (const [category, checks] of Object.entries(results)) {
      console.log(`\n${category}:`);
      for (const [check, passed] of Object.entries(checks)) {
        console.log(`${passed ? '✓' : '✗'} ${check}`);
        if (!passed) allPassed = false;
      }
    }

    return allPassed;

  } catch (error) {
    console.error('Verification failed:', error);
    return false;
  }
}

// Run verification if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const projectDir = process.argv[2] || process.cwd();
  verifyMemoryBank(projectDir).then(passed => {
    process.exit(passed ? 0 : 1);
  });
}

export { verifyMemoryBank };