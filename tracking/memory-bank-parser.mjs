import fs from 'fs/promises';
import path from 'path';
import { detectStatus, STATUS_MARKERS } from './status-handler.mjs';

const MEMORY_BANK_DIR = 'docs/cline_docs';
const MEMORY_BANK_FILES = [
  'activeContext.md',
  'productContext.md',
  'progress.md',
  'systemPatterns.md',
  'techContext.md'
];

/**
 * Extracts status sections from markdown content
 * @param {string} content - Markdown content
 * @returns {Object} Extracted sections with status
 */
function extractStatusSections(content) {
  const sections = {};
  let currentSection = null;
  const lines = content.split('\n');

  for (const line of lines) {
    // Detect section headers
    if (line.startsWith('## ')) {
      currentSection = line.replace('## ', '').trim();
      sections[currentSection] = [];
    }
    // Detect status items
    else if (currentSection && line.trim().startsWith('-')) {
      sections[currentSection].push(line.trim());
    }
  }

  return sections;
}

/**
 * Extracts status information from a Memory Bank file
 * @param {string} filePath - Path to Memory Bank file
 * @returns {Object} Status information
 */
async function parseMemoryBankFile(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const sections = extractStatusSections(content);
    
    // Extract status for each section
    const statusInfo = {};
    for (const [section, items] of Object.entries(sections)) {
      statusInfo[section] = items.map(item => ({
        text: item,
        status: detectStatus(item)
      }));
    }

    return {
      file: path.basename(filePath),
      sections: statusInfo,
      lastUpdated: await getLastUpdated(content)
    };
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error);
    return null;
  }
}

/**
 * Gets last updated timestamp from file content
 * @param {string} content - File content
 * @returns {string} Last updated timestamp
 */
function getLastUpdated(content) {
  const match = content.match(/Last Updated: (.+)/);
  return match ? match[1] : 'Unknown';
}

/**
 * Parses all Memory Bank files
 * @returns {Object} Combined status information
 */
export async function parseMemoryBank() {
  const results = {
    status: {},
    crossReferences: new Map(),
    lastUpdated: null
  };

  try {
    // Parse each Memory Bank file
    for (const file of MEMORY_BANK_FILES) {
      const filePath = path.join(MEMORY_BANK_DIR, file);
      const fileInfo = await parseMemoryBankFile(filePath);
      
      if (fileInfo) {
        results.status[file] = fileInfo.sections;
        if (!results.lastUpdated || fileInfo.lastUpdated > results.lastUpdated) {
          results.lastUpdated = fileInfo.lastUpdated;
        }
      }
    }

    // Build cross-references
    for (const [file, fileStatus] of Object.entries(results.status)) {
      for (const [section, items] of Object.entries(fileStatus)) {
        for (const item of items) {
          // Look for references to other sections/files
          const refs = extractReferences(item.text);
          if (refs.length > 0) {
            results.crossReferences.set(
              `${file}#${section}`,
              refs.map(ref => ({ file: ref.file, section: ref.section }))
            );
          }
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error parsing Memory Bank:', error);
    return null;
  }
}

/**
 * Extracts cross-references from text
 * @param {string} text - Text to analyze
 * @returns {Array} Array of references
 */
function extractReferences(text) {
  const refs = [];
  // Match patterns like "See: file.md#section" or "[link](file.md#section)"
  const refPattern = /(?:See:|link to:)\s*(?:\[([^\]]+)\])?\(?([^)\s]+)(?:#([^)\s]+))?\)?/g;
  
  let match;
  while ((match = refPattern.exec(text)) !== null) {
    refs.push({
      label: match[1] || match[2],
      file: match[2],
      section: match[3]
    });
  }
  
  return refs;
}

/**
 * Gets completion metrics from Memory Bank
 * @param {Object} memoryBank - Parsed Memory Bank data
 * @returns {Object} Completion metrics
 */
export function getCompletionMetrics(memoryBank) {
  const metrics = {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0
  };

  for (const fileStatus of Object.values(memoryBank.status)) {
    for (const sectionItems of Object.values(fileStatus)) {
      for (const item of sectionItems) {
        metrics.total++;
        switch (item.status) {
          case STATUS_MARKERS.COMPLETED:
            metrics.completed++;
            break;
          case STATUS_MARKERS.IN_PROGRESS:
            metrics.inProgress++;
            break;
          case STATUS_MARKERS.NOT_STARTED:
            metrics.notStarted++;
            break;
        }
      }
    }
  }

  return metrics;
}