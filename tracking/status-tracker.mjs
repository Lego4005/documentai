#!/usr/bin/env node

import { parseMemoryBank, getCompletionMetrics } from './memory-bank-parser.mjs';
import {
  STATUS_MARKERS,
  formatStatus,
  formatHeader,
  formatSection,
  printLegend,
  getIncompleteItems
} from './status-handler.mjs';

/**
 * Generates a full status report
 * @param {Object} memoryBank - Parsed Memory Bank data
 * @param {boolean} incompleteOnly - Whether to show only incomplete items
 */
async function generateStatusReport(memoryBank, incompleteOnly = false) {
  console.log(formatHeader('Project Status Report'));
  console.log(`Last Updated: ${memoryBank.lastUpdated}\n`);

  // Print status legend
  printLegend();

  // Print completion metrics
  const metrics = getCompletionMetrics(memoryBank);
  const completionPercentage = ((metrics.completed / metrics.total) * 100).toFixed(1);
  
  console.log(formatSection('Completion Metrics'));
  console.log(`Total Items: ${metrics.total}`);
  console.log(`Completed: ${metrics.completed} (${completionPercentage}%)`);
  console.log(`In Progress: ${metrics.inProgress}`);
  console.log(`Not Started: ${metrics.notStarted}\n`);

  // Print status by file
  for (const [file, fileStatus] of Object.entries(memoryBank.status)) {
    console.log(formatSection(file));
    
    for (const [section, items] of Object.entries(fileStatus)) {
      let sectionItems = items;
      if (incompleteOnly) {
        sectionItems = getIncompleteItems(items.map(i => i.text))
          .map(text => items.find(i => i.text === text))
          .filter(Boolean);
      }
      
      if (sectionItems.length > 0) {
        console.log(`\n${section}:`);
        for (const item of sectionItems) {
          console.log(formatStatus(item.text, item.status));
        }
      }
    }
  }

  // Print cross-references if any
  if (memoryBank.crossReferences.size > 0) {
    console.log(formatSection('Cross References'));
    for (const [source, refs] of memoryBank.crossReferences) {
      console.log(`\n${source}:`);
      for (const ref of refs) {
        console.log(`  → ${ref.file}${ref.section ? `#${ref.section}` : ''}`);
      }
    }
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    const args = process.argv.slice(2);
    const showIncompleteOnly = args.includes('--incomplete');

    const memoryBank = await parseMemoryBank();
    if (!memoryBank) {
      console.error('Failed to parse Memory Bank files');
      process.exit(1);
    }

    await generateStatusReport(memoryBank, showIncompleteOnly);
  } catch (error) {
    console.error('Error generating status report:', error);
    process.exit(1);
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main();
}