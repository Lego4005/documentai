#!/usr/bin/env node

import fs from 'fs/promises';
import { execSync } from 'child_process';
import path from 'path';
import { templateProcessor } from '../tracking/template-processor.mjs';
import { detectStatus, STATUS_MARKERS } from '../tracking/status-handler.mjs';

// Will be replaced with actual project values during setup
const PROJECT_CONFIG = {
  MEMORY_BANK_DIR: 'docs/cline_docs',
  PROJECT_SCOPE: 'HYBRID',
  TECH_STACK: '@modelcontextprotocol/sdk,chalk,fs-extra,glob,ora,react,react-dom,@types/react,@types/react-dom,@types/node,@supabase/supabase-js'.split(','),
  PRIORITIES: 'hybrid-deployer'.split(',')
};

/**
 * Get git changes since last update
 */
async function getGitChanges() {
  try {
    // Get last memory bank update timestamp from activeContext.md
    const activeContext = await fs.readFile(path.join(PROJECT_CONFIG.MEMORY_BANK_DIR, 'activeContext.md'), 'utf8');
    const lastUpdate = activeContext.match(/Last Updated: (.+)/)[1];
    const lastUpdateDate = new Date(lastUpdate);

    // Get git changes since last update
    const gitLog = execSync(`git log --since="${lastUpdateDate.toISOString()}" --name-status`).toString();
    return parseGitChanges(gitLog);
  } catch (error) {
    console.error('Error getting git changes:', error);
    return null;
  }
}

/**
 * Parse git changes into structured format
 */
function parseGitChanges(gitLog) {
  const changes = {
    added: [],
    modified: [],
    deleted: [],
    commits: []
  };

  const lines = gitLog.split('\n');
  let currentCommit = null;

  for (const line of lines) {
    if (line.startsWith('commit ')) {
      if (currentCommit) {
        changes.commits.push(currentCommit);
      }
      currentCommit = { hash: line.split(' ')[1], message: '', files: [] };
    } else if (line.startsWith('    ')) {
      // Commit message
      currentCommit.message = line.trim();
    } else if (line.match(/^[AMD]\t/)) {
      // Changed file
      const [status, file] = line.split('\t');
      currentCommit?.files.push({ status, file });

      switch (status) {
        case 'A':
          changes.added.push(file);
          break;
        case 'M':
          changes.modified.push(file);
          break;
        case 'D':
          changes.deleted.push(file);
          break;
      }
    }
  }

  if (currentCommit) {
    changes.commits.push(currentCommit);
  }

  return changes;
}

/**
 * Analyze codebase for status updates
 */
async function analyzeCodebase() {
  const changes = await getGitChanges();
  if (!changes) return null;

  // Analyze changes by directory
  const analysis = {
    components: {
      status: STATUS_MARKERS.IN_PROGRESS,
      details: []
    },
    pages: {
      status: STATUS_MARKERS.IN_PROGRESS,
      details: []
    },
    documentation: {
      status: STATUS_MARKERS.IN_PROGRESS,
      details: []
    },
    tests: {
      status: STATUS_MARKERS.NOT_STARTED,
      details: []
    }
  };

  // Analyze component changes
  const componentChanges = changes.modified.filter(f => f.includes('components/'));
  if (componentChanges.length > 0) {
    analysis.components.details.push(
      `Updated ${componentChanges.length} component(s)`,
      ...componentChanges.map(f => `Modified: ${path.basename(f)}`)
    );
  }

  // Analyze page changes
  const pageChanges = changes.modified.filter(f => f.includes('pages/'));
  if (pageChanges.length > 0) {
    analysis.pages.details.push(
      `Updated ${pageChanges.length} page(s)`,
      ...pageChanges.map(f => `Modified: ${path.basename(f)}`)
    );
  }

  // Analyze documentation changes
  const docChanges = changes.modified.filter(f => f.includes('docs/'));
  if (docChanges.length > 0) {
    analysis.documentation.details.push(
      `Updated ${docChanges.length} document(s)`,
      ...docChanges.map(f => `Modified: ${path.basename(f)}`)
    );
  }

  // Analyze test changes
  const testChanges = changes.modified.filter(f => f.includes('tests/'));
  if (testChanges.length > 0) {
    analysis.tests.details.push(
      `Updated ${testChanges.length} test(s)`,
      ...testChanges.map(f => `Modified: ${path.basename(f)}`)
    );
  }

  return {
    changes,
    analysis,
    timestamp: new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };
}

/**
 * Update Memory Bank files with analysis while preserving manual updates
 */
async function updateMemoryBank() {
  const analysis = await analyzeCodebase();
  if (!analysis) return;

  // First, generate template-based updates
  const templateVars = {
    ...PROJECT_CONFIG,
    TIMESTAMP: analysis.timestamp,
    CHANGES: analysis.changes,
    ANALYSIS: analysis.analysis
  };

  // Generate files from templates
  await templateProcessor.generateMemoryBankFiles(process.cwd(), templateVars);

  // Then, merge with existing manual updates
  const activeContextPath = path.join(PROJECT_CONFIG.MEMORY_BANK_DIR, 'activeContext.md');
  let content = await fs.readFile(activeContextPath, 'utf8');

  // Preserve manual updates while adding new automated content
  const manualSections = content.match(/## .*?\n([\s\S]*?)(?=## |$)/g) || [];
  for (const section of manualSections) {
    if (section.includes('Manual Update:')) {
      // Keep manual updates and add them to template-generated content
      const [header, ...lines] = section.split('\n');
      content = content.replace(
        new RegExp(`(## ${header.replace('## ', '')}\\n)`),
        `$1${lines.join('\n')}\n`
      );
    }
  }

  // Add new changes to change log
  const changes = analysis.changes.commits
    .map(commit => `- ${analysis.timestamp}: ${commit.message}\n  * ${commit.files.map(f => f.file).join('\n  * ')}`)
    .join('\n');

  content = content.replace(
    /(## Change Log 📝\n)/,
    `$1${changes}\n`
  );

  await fs.writeFile(activeContextPath, content);
  console.log('✓ Updated Memory Bank with latest changes while preserving manual updates');
}

// For use in project setup
export const hybridMemoryBank = {
  updateMemoryBank,
  analyzeCodebase,
  PROJECT_CONFIG
};