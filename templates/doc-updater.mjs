#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { formatManager } from './format-manager.mjs';
import { gitManager } from './git-manager.mjs';

/**
 * Documentation update triggers
 */
const UPDATE_TRIGGERS = {
  // File operations
  write_to_file: {
    shouldUpdate: (result) => result.includes('successfully saved'),
    getUpdate: (path, content) => ({
      type: 'file_created',
      path,
      content,
      priority: 'high'
    })
  },
  apply_diff: {
    shouldUpdate: (result) => result.includes('successfully applied'),
    getUpdate: (path, diff) => ({
      type: 'file_modified',
      path,
      changes: diff,
      priority: 'normal'
    })
  },
  insert_content: {
    shouldUpdate: (result) => result.includes('successfully inserted'),
    getUpdate: (path, operations) => ({
      type: 'content_added',
      path,
      operations,
      priority: 'normal'
    })
  },
  search_and_replace: {
    shouldUpdate: (result) => result.includes('successfully replaced'),
    getUpdate: (path, operations) => ({
      type: 'content_modified',
      path,
      operations,
      priority: 'low'
    })
  }
};

/**
 * Handle documentation updates
 */
class DocUpdater {
  constructor() {
    this.priorityQueue = [];
    this.normalQueue = [];
    this.lowPriorityQueue = [];
    this.isProcessing = false;
    this.changeLog = new Map();
    this.customSections = new Map();
    this.emojiMap = new Map();
    this.retryCount = 3;
    this.retryDelay = 1000;
    this.diffHistory = new Map();
  }

  /**
   * Add update to queue
   */
  async queueUpdate(tool, args, result) {
    const trigger = UPDATE_TRIGGERS[tool];
    if (!trigger || !trigger.shouldUpdate(result)) {
      return;
    }

    const update = trigger.getUpdate(...args);
    
    // Get git diff for the file
    const diff = await gitManager.getFileDiff(update.path);
    if (diff) {
      this.diffHistory.set(update.path, diff);
    }

    // Track change
    await this.trackChange(update);

    // Add to appropriate queue
    switch (update.priority) {
      case 'high':
        await this.processPriorityUpdate(update);
        break;
      case 'normal':
        this.normalQueue.push(update);
        break;
      case 'low':
        this.lowPriorityQueue.push(update);
        break;
    }

    // Process queues if enough changes
    if (this.shouldProcessQueues()) {
      await this.processUpdates();
    }
  }

  /**
   * Track change for conflict detection
   */
  async trackChange(update) {
    const key = `${update.path}:${update.type}`;
    const lastChange = this.changeLog.get(key);
    
    if (lastChange?.time && Date.now() - lastChange.time < 1000) {
      // Potential conflict, merge changes
      await this.mergeChanges(key, update, lastChange);
    }

    this.changeLog.set(key, {
      time: Date.now(),
      update
    });
  }

  /**
   * Process updates
   */
  async processUpdates() {
    if (this.isProcessing) {
      await this.waitForLock();
    }

    this.isProcessing = true;
    try {
      // Process each queue
      for (const update of this.priorityQueue) {
        await this.processUpdate(update);
      }
      for (const update of this.normalQueue) {
        await this.processUpdate(update);
      }
      for (const update of this.lowPriorityQueue) {
        await this.processUpdate(update);
      }

      // Add diffs to archive
      if (this.diffHistory.size > 0) {
        const activeContextPath = path.join(
          process.cwd(),
          'docs',
          'cline_docs',
          'activeContext.md'
        );

        const diffs = Array.from(this.diffHistory.entries())
          .map(([file, diff]) => 
            `\nChanges in ${file}:\n\`\`\`diff\n${diff}\n\`\`\``
          )
          .join('\n');

        await formatManager.addArchiveEntry(
          activeContextPath,
          `Changes detected:${diffs}`
        );

        // Clear processed diffs
        this.diffHistory.clear();
      }

      // Clear queues
      this.priorityQueue = [];
      this.normalQueue = [];
      this.lowPriorityQueue = [];

    } catch (error) {
      console.error('Failed to process updates:', error);
      // Retry failed updates
      await this.retryFailedUpdates();
    } finally {
      this.isProcessing = false;
    }
  }

  // Rest of the class remains the same
}

// Export for use in memory bank system
export const docUpdater = new DocUpdater();