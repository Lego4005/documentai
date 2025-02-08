#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { formatManager } from './format-manager.mjs';

/**
 * Git rules and patterns
 */
const GIT_RULES = {
  branches: {
    main: {
      protected: true,
      requirePR: true,
      requireReview: true
    },
    feature: {
      pattern: 'feat/*',
      requireTests: true,
      requireDescription: true
    },
    bugfix: {
      pattern: 'fix/*',
      requireTests: true,
      requireDescription: true
    },
    release: {
      pattern: 'release/*',
      protected: true,
      requirePR: true
    }
  },
  commits: {
    types: [
      'feat',    // New feature
      'fix',     // Bug fix
      'docs',    // Documentation
      'style',   // Formatting
      'refactor',// Code restructuring
      'test',    // Tests
      'chore'    // Maintenance
    ],
    requireScope: true,
    requireTests: ['feat', 'fix', 'refactor'],
    maxChanges: 100 // Max files per commit
  },
  autoCommit: {
    frequency: 15, // minutes
    message: 'chore: auto-commit memory bank updates',
    minChanges: 5  // Minimum changes before auto-commit
  }
};

/**
 * Track git status in memory bank
 */
class GitTracker {
  constructor() {
    this.currentBranch = '';
    this.lastCommit = '';
    this.pendingChanges = [];
    this.lastAutoCommit = Date.now();
    this.changeCount = 0;
    this.diffHistory = new Map();
  }

  /**
   * Get diff for file
   */
  async getFileDiff(filePath) {
    try {
      const diff = execSync(
        `git diff --unified=3 ${filePath}`,
        { encoding: 'utf8' }
      );
      return diff || null;
    } catch {
      return null;
    }
  }

  /**
   * Track file diff
   */
  async trackDiff(filePath) {
    const diff = await this.getFileDiff(filePath);
    if (diff) {
      const history = this.diffHistory.get(filePath) || [];
      history.push({
        timestamp: Date.now(),
        diff
      });
      this.diffHistory.set(filePath, history);
    }
  }

  /**
   * Update git status in memory bank
   */
  async updateStatus() {
    try {
      // Get current branch
      this.currentBranch = execSync('git branch --show-current')
        .toString()
        .trim();

      // Get last commit
      this.lastCommit = execSync('git log -1 --pretty=format:"%h %s"')
        .toString()
        .trim();

      // Get pending changes
      this.pendingChanges = execSync('git status --porcelain')
        .toString()
        .trim()
        .split('\n')
        .filter(Boolean);

      // Track diffs for changed files
      for (const change of this.pendingChanges) {
        const [, file] = change.split(' ');
        await this.trackDiff(file);
      }

      // Update memory bank using format manager
      await this.updateMemoryBank();

    } catch (error) {
      console.error('Git status update failed:', error);
    }
  }

  /**
   * Update memory bank with git status
   */
  async updateMemoryBank() {
    const activeContextPath = path.join(
      process.cwd(),
      'docs',
      'cline_docs',
      'activeContext.md'
    );

    try {
      // Update git status section using format manager
      await formatManager.updateGitStatus(activeContextPath, {
        currentBranch: this.currentBranch,
        lastCommit: this.lastCommit,
        pendingChanges: this.pendingChanges
      });

      // Add diff history to archive
      if (this.diffHistory.size > 0) {
        const diffs = Array.from(this.diffHistory.entries())
          .map(([file, history]) => {
            const latest = history[history.length - 1];
            return `\nChanges in ${file}:\n\`\`\`diff\n${latest.diff}\n\`\`\``;
          })
          .join('\n');

        await formatManager.addArchiveEntry(
          activeContextPath,
          `Changes detected:${diffs}`
        );

        // Clear processed diffs
        this.diffHistory.clear();
      }

      // Add to change count
      this.changeCount++;

    } catch (error) {
      console.error('Memory bank update failed:', error);
    }
  }

  // Rest of the class remains the same
}

// Export for use in memory bank system
export const gitManager = new GitTracker();