#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Standard file sections and their formats
 */
const FILE_FORMATS = {
  activeContext: {
    sections: [
      {
        name: 'Metadata',
        template: `- **Type**: Active Context
- **Version**: {{version}}
- **Last Updated**: {{timestamp}}
- **Dependencies**: {{dependencies}}
- **Status**: {{status}}
- **Importance**: {{importance}}/100
- **Overall Completion**: {{completion}}%`
      }
    ]
  }
};

/**
 * Standard emoji mappings
 */
const STANDARD_EMOJIS = {
  complete: '✅',
  inProgress: '⚠️',
  notStarted: '❌',
  priority: '🎯',
  metrics: '📈',
  technical: '🔧',
  architecture: '🏗️',
  focus: '🧠',
  changes: '⚙️',
  improvements: '🛠️'
};

/**
 * Format management system
 */
class FormatManager {
  constructor() {
    this.customSections = new Map();
    this.customEmojis = new Map();
    this.versionMap = new Map();
  }

  /**
   * Extract custom sections from content
   */
  extractCustomSections(content) {
    const sections = new Map();
    const sectionRegex = /^## ([^\n]+)\n([\s\S]*?)(?=\n## |$)/gm;
    let match;

    while ((match = sectionRegex.exec(content)) !== null) {
      const [, name, content] = match;
      if (!this.isStandardSection(name)) {
        sections.set(name, content.trim());
      }
    }

    return sections;
  }

  /**
   * Check if section is standard
   */
  isStandardSection(name) {
    for (const format of Object.values(FILE_FORMATS)) {
      if (format.sections.some(s => s.name === name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Find custom emojis in content
   */
  findCustomEmojis(content) {
    const emojis = new Map();
    const emojiRegex = /([^\s])?([^\x00-\x7F]+)([^\s])?/g;
    let match;

    while ((match = emojiRegex.exec(content)) !== null) {
      const [, prefix, emoji, suffix] = match;
      if (!Object.values(STANDARD_EMOJIS).includes(emoji)) {
        emojis.set(emoji, {
          context: prefix + emoji + suffix,
          position: match.index
        });
      }
    }

    return emojis;
  }

  /**
   * Restore custom sections to content
   */
  restoreCustomSections(content, sections) {
    // Add custom sections before Archive
    let result = content;
    if (sections.size > 0) {
      const customContent = Array.from(sections.entries())
        .map(([name, content]) => `## ${name}\n${content}`)
        .join('\n\n');
      
      result = result.replace(
        '## Archive',
        `${customContent}\n\n## Archive`
      );
    }
    return result;
  }

  /**
   * Restore custom emojis to content
   */
  restoreCustomEmojis(content, emojis) {
    let result = content;
    for (const [emoji, info] of emojis.entries()) {
      // Only restore if position still makes sense
      if (info.position < result.length) {
        const before = result.slice(0, info.position);
        const after = result.slice(info.position + info.context.length);
        result = before + info.context + after;
      }
    }
    return result;
  }

  /**
   * Update file section while preserving format
   */
  async updateFileSection(filePath, sectionName, updates) {
    try {
      // Read current file
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract custom content
      const customSections = this.extractCustomSections(content);
      const customEmojis = this.findCustomEmojis(content);
      
      // Find section
      const sectionRegex = new RegExp(
        `## ${sectionName}([\\s\\S]*?)(?=## |$)`,
        'i'
      );
      
      const match = content.match(sectionRegex);
      if (!match) {
        throw new Error(`Section "${sectionName}" not found`);
      }

      // Get file type from path
      const fileName = path.basename(filePath);
      const fileType = fileName.replace('.md', '');
      
      // Get section format
      const format = FILE_FORMATS[fileType]?.sections
        .find(s => s.name === sectionName);
      
      if (!format) {
        throw new Error(`No format found for ${fileType}/${sectionName}`);
      }

      // Create new section content
      let newSection = format.template;
      
      // Replace variables
      Object.entries(updates).forEach(([key, value]) => {
        newSection = newSection.replace(
          new RegExp(`{{${key}}}`, 'g'),
          value
        );
      });

      // Preserve any custom content after template
      const customContent = match[1].split('\n')
        .slice(format.template.split('\n').length)
        .join('\n');

      newSection += customContent;

      // Update file
      let newContent = content.replace(
        sectionRegex,
        `## ${sectionName}\n${newSection}\n`
      );

      // Restore custom content
      newContent = this.restoreCustomSections(newContent, customSections);
      newContent = this.restoreCustomEmojis(newContent, customEmojis);

      // Validate version consistency
      await this.validateVersion(newContent, filePath);

      await fs.writeFile(filePath, newContent);
      
      return true;
    } catch (error) {
      console.error(`Failed to update ${sectionName}:`, error);
      return false;
    }
  }

  /**
   * Update git status while preserving format
   */
  async updateGitStatus(filePath, status) {
    const gitSection = `## Git Status
- Current Branch: ${status.currentBranch}
- Last Commit: ${status.lastCommit}
- Pending Changes: ${status.pendingChanges.length}
`;

    try {
      // Read current content
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract custom content
      const customSections = this.extractCustomSections(content);
      const customEmojis = this.findCustomEmojis(content);
      
      // Update content
      let newContent;
      if (content.includes('## Git Status')) {
        newContent = content.replace(
          /## Git Status[\s\S]*?(?=##|$)/,
          gitSection
        );
      } else {
        newContent = content.replace(
          '## Archive',
          `${gitSection}\n## Archive`
        );
      }

      // Restore custom content
      newContent = this.restoreCustomSections(newContent, customSections);
      newContent = this.restoreCustomEmojis(newContent, customEmojis);

      await fs.writeFile(filePath, newContent);
      return true;
    } catch (error) {
      console.error('Failed to update git status:', error);
      return false;
    }
  }

  /**
   * Add archive entry while preserving format
   */
  async addArchiveEntry(filePath, entry) {
    try {
      // Read current content
      const content = await fs.readFile(filePath, 'utf8');
      
      // Extract custom content
      const customSections = this.extractCustomSections(content);
      const customEmojis = this.findCustomEmojis(content);
      
      const timestamp = new Date().toLocaleString('en-US', {
        timeZone: 'America/New_York',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }) + ' EST';

      const archiveEntry = `[${timestamp}] ${entry}\n`;

      // Update content
      let newContent = content;
      if (content.includes('## Archive')) {
        newContent = content.replace(
          '## Archive\n',
          `## Archive\n${archiveEntry}`
        );
      }

      // Restore custom content
      newContent = this.restoreCustomSections(newContent, customSections);
      newContent = this.restoreCustomEmojis(newContent, customEmojis);

      await fs.writeFile(filePath, newContent);
      return true;
    } catch (error) {
      console.error('Failed to add archive entry:', error);
      return false;
    }
  }

  /**
   * Validate version consistency
   */
  async validateVersion(content, filePath) {
    const versionRegex = /Version: (\d+\.\d+\.\d+)/g;
    const versions = new Set();
    let match;

    while ((match = versionRegex.exec(content)) !== null) {
      versions.add(match[1]);
    }

    if (versions.size > 1) {
      // Version mismatch, normalize to latest
      const latest = Array.from(versions)
        .sort((a, b) => b.localeCompare(a))[0];
      
      const normalized = content.replace(
        versionRegex,
        `Version: ${latest}`
      );

      await fs.writeFile(filePath, normalized);

      // Add warning to archive
      await this.addArchiveEntry(
        filePath,
        `⚠️ Normalized inconsistent versions to ${latest}`
      );
    }
  }
}

// Export for use in memory bank system
export const formatManager = new FormatManager();