import fs from 'fs';

// Maximum reasonable length for a title/description
const MAX_LENGTH = 1000;

/**
 * Parse a section header line
 * @param {string} line The line to parse
 * @returns {object|null} The parsed section or null
 */
function parseSection(line) {
  const sectionMatch = line.match(/^##[ \t]{1,4}([^\r\n]{1,1000})$/);
  return sectionMatch
    ? {
        title: sectionMatch[1].trim(),
        subsections: [],
      }
    : null;
}

/**
 * Parse a subsection header line
 * @param {string} line The line to parse
 * @returns {object|null} The parsed subsection or null
 */
function parseSubsection(line) {
  const subsectionMatch = line.match(/^###[ \t]{1,4}([^\r\n]{1,1000})$/);
  return subsectionMatch
    ? {
        title: subsectionMatch[1].trim(),
        items: [],
      }
    : null;
}

/**
 * Determine the status from a status indicator
 * @param {string} statusIndicator The status indicator emoji
 * @returns {string} The status string
 */
function getStatus(statusIndicator) {
  const statusMap = {
    '✅': 'completed',
    '❌': 'not implemented',
    '⚠️': 'partially implemented',
  };
  return statusMap[statusIndicator] ?? 'pending';
}

/**
 * Extract status and description from a line
 * @param {string} line The line to process
 * @returns {object|null} The extracted status and description
 */
function extractStatusAndDescription(line) {
  const listItemPrefix = /^[ \t]{0,4}-[ \t]{1,4}/;
  const statusPattern = /([✅❌]|⚠️)[ \t]{1,4}/;

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

/**
 * Parse a list item line
 * @param {string} line The line to parse
 * @returns {object|null} The parsed item or null
 */
function parseListItem(line) {
  const extracted = extractStatusAndDescription(line);
  if (!extracted) return null;

  const { description, statusIndicator } = extracted;
  return {
    description,
    status: getStatus(statusIndicator),
  };
}

/**
 * Check if a line should be skipped
 * @param {string} line The line to check
 * @returns {boolean} True if the line should be skipped
 */
function shouldSkipLine(line) {
  return !line || line.length > MAX_LENGTH;
}

/**
 * Process a section if found in the line
 * @param {object} context The current parsing context
 * @param {string} line The line to process
 * @returns {boolean} True if a section was processed
 */
function processSectionIfFound(context, line) {
  const section = parseSection(line);
  if (!section) return false;

  context.currentSection = section;
  context.progress.sections.push(section);
  context.currentSubsection = null;
  return true;
}

/**
 * Process a subsection if found in the line
 * @param {object} context The current parsing context
 * @param {string} line The line to process
 * @returns {boolean} True if a subsection was processed
 */
function processSubsectionIfFound(context, line) {
  if (!context.currentSection) return false;

  const subsection = parseSubsection(line);
  if (!subsection) return false;

  context.currentSubsection = subsection;
  context.currentSection.subsections.push(subsection);
  return true;
}

/**
 * Process a list item if found in the line
 * @param {object} context The current parsing context
 * @param {string} line The line to process
 * @returns {boolean} True if a list item was processed
 */
function processListItemIfFound(context, line) {
  if (!context.currentSubsection) return false;

  const item = parseListItem(line);
  if (!item) return false;

  context.currentSubsection.items.push(item);
  return true;
}

/**
 * Process a single line of the checklist
 * @param {object} context The current parsing context
 * @param {string} line The line to process
 */
function processLine(context, line) {
  if (shouldSkipLine(line)) return;

  if (processSectionIfFound(context, line)) return;
  if (processSubsectionIfFound(context, line)) return;
  processListItemIfFound(context, line);
}

/**
 * Create initial parsing context
 * @returns {object} The initial context
 */
function createContext() {
  return {
    progress: { sections: [] },
    currentSection: null,
    currentSubsection: null,
  };
}

export async function getChecklistProgress(filePath) {
  try {
    const fileContent = await readFileContent(filePath);
    const lines = fileContent.split('\n');
    const context = createContext();

    lines.forEach((line) => processLine(context, line));

    return context.progress;
  } catch (error) {
    console.error('Error parsing checklist:', error);
    return { sections: [], error: error.message };
  }
}

async function readFileContent(filePath) {
  return fs.promises.readFile(filePath, 'utf-8');
}