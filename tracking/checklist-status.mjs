// tracking/checklist-status.js
import { existsSync } from 'fs';
import { readFile } from 'fs/promises';
import { homedir, platform } from 'os';
import { join } from 'path';

// Function to convert full path to tilde path
function toTildePath(fullPath) {
  const home = homedir();
  return fullPath.startsWith(home) ? fullPath.replace(home, '~') : fullPath;
}

function getDocsPathValue(arg) {
  if (!arg || typeof arg !== 'string' || arg.indexOf('=') === -1) {
    return null;
  }

  const parts = arg.split('=');
  if (parts.length < 2) {
    return null;
  }

  let docsPathValue = parts[1];
  if (docsPathValue) {
    docsPathValue = docsPathValue.trim().replace(/^(['"]|["'])$/g, '');
  }

  return docsPathValue;
}

/**
 * Get the absolute path to the git executable based on the platform
 * @returns {string} Absolute path to git executable
 */
function getGitPath() {
  switch (platform()) {
    case 'win32':
      return 'C:\\Program Files\\Git\\bin\\git.exe';
    case 'darwin':
      return '/usr/bin/git';
    default:
      return '/usr/bin/git';
  }
}

// Repository paths
const VSCODE_CONTEXT_PATH = process.cwd();
let DOCS_PATH = join(process.cwd(), 'docs');

// Handle docs path argument with validation
let docsPathValue;
for (const arg of process.argv) {
  if (arg.startsWith('--docs-path=')) {
    docsPathValue = getDocsPathValue(arg);
    break;
  } else if (arg === '--docs-path') {
    docsPathValue = process.argv[process.argv.indexOf(arg) + 1];
    break;
  }
}

if (docsPathValue) {
  const expandedPath = docsPathValue.startsWith('~')
    ? docsPathValue.replace('~', homedir())
    : join(docsPathValue);
  DOCS_PATH = expandedPath;

  if (!existsSync(DOCS_PATH)) {
    throw new Error(`Docs path does not exist: ${DOCS_PATH}`);
  }
}

// Document paths
let IMPLEMENTATION_STATUS_DOC = 'Implementation-Status.md';
let ARCHITECTURE_DOC = join(DOCS_PATH, 'Architecture.md');
let TASKS_DOC = 'tasks.md';

// Handle document name arguments
const statusDocIndex = process.argv.indexOf('--status-doc');
if (statusDocIndex > -1) {
  IMPLEMENTATION_STATUS_DOC = process.argv[statusDocIndex + 1];
}

const archDocIndex = process.argv.indexOf('--arch-doc');
if (archDocIndex > -1) {
  ARCHITECTURE_DOC = process.argv[archDocIndex + 1];
}

const tasksDocIndex = process.argv.indexOf('--tasks-doc');
if (tasksDocIndex > -1) {
  TASKS_DOC = process.argv[tasksDocIndex + 1];
}

// Full document paths
const IMPLEMENTATION_STATUS_PATH = join(DOCS_PATH, IMPLEMENTATION_STATUS_DOC);
const ARCHITECTURE_DOC_PATH = ARCHITECTURE_DOC;
const TASKS_DOC_PATH = join(process.cwd(), TASKS_DOC);

// Parse command line arguments
const showOnlyIncomplete = process.argv.includes('--incomplete');

/**
 * Validates that repositories and required documents are accessible
 * @throws {Error} If repositories or documents are not accessible
 */
async function validateRepositories() {
  if (!existsSync(VSCODE_CONTEXT_PATH)) {
    throw new Error(
      `VSCode Context repository not found at: ${toTildePath(
        VSCODE_CONTEXT_PATH
      )}`
    );
  }

  if (!existsSync(DOCS_PATH)) {
    throw new Error(
      `Documentation directory not found at: ${toTildePath(DOCS_PATH)}`
    );
  }

  if (!existsSync(IMPLEMENTATION_STATUS_PATH)) {
    throw new Error(
      `Implementation status document not found at: ${IMPLEMENTATION_STATUS_PATH}`
    );
  }
  if (!existsSync(TASKS_DOC_PATH)) {
    throw new Error(`Tasks document not found at: ${TASKS_DOC_PATH}`);
  }

  console.log('Repository and Document Validation Successful:');
  console.log('✅ Project Directory:');
  console.log(`   Path: ${toTildePath(VSCODE_CONTEXT_PATH)}`);

  console.log('\n✅ Documentation:');
  console.log(`   Docs_path: ${toTildePath(DOCS_PATH)}`);
  console.log('   Documents:');
  console.log(
    `     - Found implementation status: ${IMPLEMENTATION_STATUS_PATH}`
  );
  if (existsSync(ARCHITECTURE_DOC_PATH)) {
    console.log(`     - Found architecture document: ${ARCHITECTURE_DOC}`);
  }
  console.log(`     - Found tasks document: ${TASKS_DOC_PATH}`);
  console.log('');
}

/**
 * Processes and displays a status report
 * @param {Object} progress The progress data
 * @param {boolean} showOnlyIncomplete Whether to show only incomplete items
 * @param {string} title The title to display in the header
 */
function displayStatus(progress, showOnlyIncomplete, title) {
  console.log(`
    ${title}
    ${showOnlyIncomplete ? '(Showing only incomplete items)' : ''}
    =========================================================
  `);

  if (!progress.sections) {
    console.log('No sections found.');
    return;
  }

  progress.sections.forEach((section) => {
    const incompleteSubsections = section.subsections
      .map((subsection) => ({
        title: subsection.title,
        items: subsection.items.filter((item) =>
          showOnlyIncomplete ? item.status !== 'completed' : true
        ),
      }))
      .filter((subsection) => subsection.items.length > 0);

    if (showOnlyIncomplete && incompleteSubsections.length === 0) {
      return;
    }

    console.log(`  ${section.title}`);
    console.log(`  ----------------------------`);

    incompleteSubsections.forEach((subsection) => {
      console.log(`    ${subsection.title}:`);
      subsection.items.forEach((item) => {
        let statusIcon = '';
        // Enhanced status display logic
        if (item.status === 'completed successfully') {
          statusIcon = '✅';
        } else if (item.status === 'completed with excellence') {
          statusIcon = '⭐';
        } else if (item.status === 'completed and verified') {
          statusIcon = '🎯';
        } else if (item.status === 'ready for deployment') {
          statusIcon = '🚀';
        } else if (item.status === 'in progress, improving') {
          statusIcon = '📈';
        } else if (item.status === 'actively being worked on') {
          statusIcon = '🔄';
        } else if (item.status === 'blocked') {
          statusIcon = '❌';
        } else if (item.status === 'needs attention') {
          statusIcon = '⚠️';
        } else {
          statusIcon = item.statusIndicator || '❓';
        }
        console.log(`      ${statusIcon} ${item.description} (${item.status})`);
      });
    });
    console.log('');
  });
}

// Maximum reasonable length for a title/description
const MAX_LENGTH = 1000;

function parseSection(line) {
  const sectionMatch = line.match(/^##[ \t]{1,4}([^\r\n]{1,1000})$/);
  return sectionMatch
    ? {
        title: sectionMatch[1].trim(),
        subsections: [],
      }
    : null;
}

function parseSubsection(line) {
  const subsectionMatch = line.match(/^###[ \t]{1,4}([^\r\n]{1,1000})$/);
  return subsectionMatch
    ? {
        title: subsectionMatch[1].trim(),
        items: [],
      }
    : null;
}

function getStatus(statusIndicator) {
  // Enhanced status mapping based on EMOJI_GUIDE.md
  const statusMap = {
    // Completion Status
    '✅': 'completed successfully',
    '⭐': 'completed with excellence',
    '🎯': 'completed and verified',
    '🚀': 'ready for deployment',
    // Progress Status
    '📈': 'in progress, improving',
    '🔄': 'actively being worked on',
    '⚠️': 'needs attention',
    '💡': 'has improvement ideas',
    // Planning Status
    '📋': 'planned',
    '⏳': 'waiting for dependencies',
    '❌': 'blocked',
    '🔍': 'needs review',
  };
  return statusMap[statusIndicator] ?? 'status unknown';
}

function extractStatusAndDescription(line) {
  const listItemPrefix = /^[ \t]{0,4}-[ \t]{1,4}/;
  const statusPattern = /([✅⭐🎯🚀📈🔄⚠️💡📋⏳❌🔍])[ \t]{1,4}/;

  if (!listItemPrefix.test(line)) return null;

  const withoutPrefix = line.replace(listItemPrefix, '');
  const statusMatch = withoutPrefix.match(statusPattern);
  const description = withoutPrefix
    .replace(statusPattern, '')
    .trim()
    .slice(0, MAX_LENGTH);

  if (!description) return null;

  return {
    description,
    statusIndicator: statusMatch?.[1] ?? '',
  };
}

function parseListItem(line) {
  const extracted = extractStatusAndDescription(line);
  if (!extracted) return null;

  const { description, statusIndicator } = extracted;
  return {
    description,
    status: getStatus(statusIndicator),
  };
}

function shouldSkipLine(line) {
  return !line || line.length > MAX_LENGTH;
}

function processSectionIfFound(context, line) {
  const section = parseSection(line);
  if (!section) return false;

  context.currentSection = section;
  context.progress.sections.push(section);
  context.currentSubsection = null;
  return true;
}

function processSubsectionIfFound(context, line) {
  if (!context.currentSection) return false;

  const subsection = parseSubsection(line);
  if (!subsection) return false;

  context.currentSubsection = subsection;
  context.currentSection.subsections.push(subsection);
  return true;
}

function processListItemIfFound(context, line) {
  if (!context.currentSubsection) return false;

  const item = parseListItem(line);
  if (!item) return false;

  context.currentSubsection.items.push(item);
  return true;
}

function processLine(context, line) {
  if (shouldSkipLine(line)) return;

  if (processSectionIfFound(context, line)) return;
  if (processSubsectionIfFound(context, line)) return;
  processListItemIfFound(context, line);
}

function createContext() {
  return {
    progress: { sections: [] },
    currentSection: null,
    currentSubsection: null,
  };
}

async function getChecklistProgress(filePath) {
  try {
    const fileContent = await readFile(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    const context = createContext();

    lines.forEach((line) => processLine(context, line));

    return context.progress;
  } catch (error) {
    console.error('Error parsing checklist:', error);
    return { sections: [], error: error.message };
  }
}

async function main() {
  try {
    await validateRepositories();

    const implementationStatusProgress = await getChecklistProgress(
      IMPLEMENTATION_STATUS_PATH
    );
    const tasksProgress = await getChecklistProgress(TASKS_DOC_PATH);

    if (implementationStatusProgress && implementationStatusProgress.error) {
      throw new Error(
        `Failed to get implementation status progress: ${implementationStatusProgress.error}`
      );
    }

    if (tasksProgress && tasksProgress.error) {
      throw new Error(`Failed to get tasks progress: ${tasksProgress.error}`);
    }

    displayStatus(
      implementationStatusProgress,
      showOnlyIncomplete,
      'Implementation Status'
    );
    displayStatus(tasksProgress, showOnlyIncomplete, 'Tasks Status');
  } catch (error) {
    console.error(
      'Error:',
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

// Run the script
main().catch((error) => {
  console.error(
    'Unhandled error:',
    error instanceof Error ? error.message : String(error)
  );
  process.exit(1);
});
