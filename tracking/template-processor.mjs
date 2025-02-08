#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';

/**
 * Project scopes and their configurations
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
  },
  HYBRID: {
    description: 'Combined automated and manual memory management',
    focus: ['Automated updates', 'Manual overrides', 'Template system'],
    excludes: []
  }
};

/**
 * Process a template with given variables
 * @param {string} template - Template content
 * @param {Object} variables - Variables to replace
 * @returns {string} Processed content
 */
function processTemplate(template, variables) {
  let content = template;

  // Add PROJECT_SCOPES to variables
  const vars = {
    ...variables,
    PROJECT_SCOPES
  };

  // Replace simple variables
  for (const [key, value] of Object.entries(vars)) {
    if (typeof value !== 'object') {
      const regex = new RegExp(`{{${key}}}`, 'g');
      content = content.replace(regex, value);
    }
  }

  // Process arrays with #each
  const eachRegex = /{{#each\s+([^}]+)}}([\s\S]*?){{\/each}}/g;
  content = content.replace(eachRegex, (match, path, template) => {
    // Handle nested paths (e.g., PROJECT_SCOPES[PROJECT_SCOPE].focus)
    const pathParts = path.split(/[\[\].]+/).filter(Boolean);
    let value = vars;
    for (const part of pathParts) {
      value = value?.[part];
    }

    if (!value || !Array.isArray(value)) {
      return '';
    }

    return value
      .map(item => template.trim().replace(/{{this}}/g, item))
      .join('\n');
  });

  // Process conditionals
  const ifRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{else}}([\s\S]*?){{\/if}}/g;
  const simpleIfRegex = /{{#if\s+([^}]+)}}([\s\S]*?){{\/if}}/g;

  content = content
    .replace(ifRegex, (match, condition, ifTrue, ifFalse) => {
      const value = vars[condition];
      return value ? ifTrue : ifFalse;
    })
    .replace(simpleIfRegex, (match, condition, ifTrue) => {
      const value = vars[condition];
      return value ? ifTrue : '';
    });

  return content;
}

/**
 * Generate a file from template
 * @param {string} templatePath - Path to template file
 * @param {string} outputPath - Path to output file
 * @param {Object} variables - Variables to replace
 */
export async function generateFromTemplate(templatePath, outputPath, variables) {
  try {
    const template = await fs.readFile(templatePath, 'utf8');
    const content = processTemplate(template, variables);
    await fs.writeFile(outputPath, content);
    console.log(`✓ Generated ${path.basename(outputPath)}`);
  } catch (error) {
    console.error(`Error generating ${path.basename(outputPath)}:`, error);
    throw error;
  }
}

/**
 * Generate all Memory Bank files
 * @param {string} outputDir - Output directory
 * @param {Object} projectInfo - Project information
 */
export async function generateMemoryBankFiles(outputDir, projectInfo) {
  const templatesDir = path.join(path.dirname(new URL(import.meta.url).pathname), 'templates');
  const clineDocsDir = path.join(outputDir, 'docs', 'cline_docs');

  // Ensure directories exist
  await fs.mkdir(clineDocsDir, { recursive: true });

  // Common variables
  const variables = {
    TIMESTAMP: new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }) + ' EST',
    ...projectInfo,
    CHALLENGES: [
      'Initial setup and configuration',
      'System architecture design',
      'Implementation complexity',
      'Testing requirements',
      'Documentation needs',
      ...(PROJECT_SCOPES[projectInfo.PROJECT_SCOPE]?.excludes || []).map(item => `Deferred: ${item}`)
    ]
  };

  // Generate each file
  const templates = [
    'productContext.md',
    'activeContext.md',
    'systemPatterns.md',
    'techContext.md',
    'progress.md'
  ];

  for (const template of templates) {
    await generateFromTemplate(
      path.join(templatesDir, `${template}.template`),
      path.join(clineDocsDir, template),
      variables
    );
  }

  console.log('\n✓ Memory Bank files generated successfully');
}

// Export for use in auto-deployer
export const templateProcessor = {
  processTemplate,
  generateFromTemplate,
  generateMemoryBankFiles
};