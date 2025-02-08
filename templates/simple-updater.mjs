#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

/**
 * Simple Memory Bank updater
 */
class SimpleUpdater {
  constructor() {
    this.lastUpdate = Date.now();
    this.changeCount = 0;
    this.AUTO_COMMIT_THRESHOLD = 5; // changes
    this.AUTO_COMMIT_INTERVAL = 15 * 60 * 1000; // 15 minutes
  }

  /**
   * Update memory bank after tool use
   */
  async updateAfterTool(tool, args, result) {
    // Only update on successful operations
    if (!result.includes('success')) return;

    this.changeCount++;
    
    // Update activeContext.md
    await this.updateActiveContext(tool, args);

    // Check if we should commit
    await this.checkAutoCommit();
  }

  /**
   * Update activeContext.md
   */
  async updateActiveContext(tool, args) {
    const activeContextPath = path.join(
      process.cwd(),
      'docs',
      'cline_docs',
      'activeContext.md'
    );

    try {
      // Read current content
      let content = await fs.readFile(activeContextPath, 'utf8');

      // Update Current Task section
      content = this.updateSection(
        content,
        'Current Task',
        `Development (Importance: 95/100, Completion: ${this.changeCount * 10}%):
- ⚠️ Made changes with ${tool}
- ⚠️ ${args.length} operations
- ⚠️ Last update: ${new Date().toLocaleTimeString()}`
      );

      // Add to archive
      const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ' EST';

      content = content.replace(
        '## Archive',
        `## Archive\n[${timestamp}] ${tool}: ${args.join(', ')}\n`
      );

      await fs.writeFile(activeContextPath, content);

    } catch (error) {
      console.error('Failed to update activeContext.md:', error);
    }
  }

  /**
   * Update section while preserving format
   */
  updateSection(content, sectionName, newContent) {
    const sectionRegex = new RegExp(
      `## ${sectionName}[\\s\\S]*?(?=## |$)`,
      'i'
    );

    return content.replace(
      sectionRegex,
      `## ${sectionName}\n${newContent}\n`
    );
  }

  /**
   * Check if we should auto-commit
   */
  async checkAutoCommit() {
    const timeSinceLastUpdate = Date.now() - this.lastUpdate;
    const shouldCommit = 
      this.changeCount >= this.AUTO_COMMIT_THRESHOLD ||
      timeSinceLastUpdate >= this.AUTO_COMMIT_INTERVAL;

    if (shouldCommit) {
      await this.autoCommit();
    }
  }

  /**
   * Auto-commit changes
   */
  async autoCommit() {
    try {
      execSync('git add docs/cline_docs/');
      execSync('git commit -m "chore: auto-commit memory bank updates"');
      
      this.lastUpdate = Date.now();
      this.changeCount = 0;

    } catch (error) {
      console.error('Auto-commit failed:', error);
    }
  }

  /**
   * Force update (for #updatememory command)
   */
  async forceUpdate() {
    if (this.changeCount > 0) {
      await this.autoCommit();
    }
  }
}

// Export for use in memory bank system
export const simpleUpdater = new SimpleUpdater();