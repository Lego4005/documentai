import chalk from 'chalk';

// Status markers and their colors
export const STATUS_MARKERS = {
  // Completion Status
  COMPLETED: '✅',
  COMPLETED_EXCELLENT: '⭐',
  COMPLETED_VERIFIED: '🎯',
  READY_DEPLOYMENT: '🚀',
  // Progress Status
  IMPROVING: '📈',
  ACTIVE: '🔄',
  NEEDS_ATTENTION: '⚠️',
  HAS_IDEAS: '💡',
  // Planning Status
  PLANNED: '📋',
  WAITING: '⏳',
  BLOCKED: '❌',
  NEEDS_REVIEW: '🔍',
  // Issue Status
  HAS_BUGS: '🐛'
};

export const STATUS_COLORS = {
  // Completion Status
  COMPLETED: chalk.green,
  COMPLETED_EXCELLENT: chalk.green.bold,
  COMPLETED_VERIFIED: chalk.green.bold,
  READY_DEPLOYMENT: chalk.blue.bold,
  // Progress Status
  IMPROVING: chalk.yellow,
  ACTIVE: chalk.yellow.bold,
  NEEDS_ATTENTION: chalk.yellow.bold,
  HAS_IDEAS: chalk.cyan,
  // Planning Status
  PLANNED: chalk.gray,
  WAITING: chalk.gray,
  BLOCKED: chalk.red,
  NEEDS_REVIEW: chalk.magenta,
  // Issue Status
  HAS_BUGS: chalk.red.bold,
  HEADER: chalk.blue,
  SECTION: chalk.cyan
};

// Text patterns indicating work in progress
export const PROGRESS_PATTERNS = [
  'implementing',
  'working on',
  'in progress',
  'ongoing',
  'started',
  'developing',
  'building',
  'refactoring',
  'updating',
  'adding',
  'fixing'
];

/**
 * Detects status from text content
 * @param {string} content - Text content to analyze
 * @returns {string} Status marker
 */
export function detectStatus(content) {
  // Check completion status
  if (content.includes(STATUS_MARKERS.COMPLETED)) {
    return STATUS_MARKERS.COMPLETED;
  }
  if (content.includes(STATUS_MARKERS.COMPLETED_EXCELLENT)) {
    return STATUS_MARKERS.COMPLETED_EXCELLENT;
  }
  if (content.includes(STATUS_MARKERS.COMPLETED_VERIFIED)) {
    return STATUS_MARKERS.COMPLETED_VERIFIED;
  }
  if (content.includes(STATUS_MARKERS.READY_DEPLOYMENT)) {
    return STATUS_MARKERS.READY_DEPLOYMENT;
  }
  
  // Check progress status
  if (content.includes(STATUS_MARKERS.IMPROVING)) {
    return STATUS_MARKERS.IMPROVING;
  }
  if (content.includes(STATUS_MARKERS.ACTIVE)) {
    return STATUS_MARKERS.ACTIVE;
  }
  if (content.includes(STATUS_MARKERS.NEEDS_ATTENTION)) {
    return STATUS_MARKERS.NEEDS_ATTENTION;
  }
  if (content.includes(STATUS_MARKERS.HAS_IDEAS)) {
    return STATUS_MARKERS.HAS_IDEAS;
  }
  
  // Check planning status
  if (content.includes(STATUS_MARKERS.PLANNED)) {
    return STATUS_MARKERS.PLANNED;
  }
  if (content.includes(STATUS_MARKERS.WAITING)) {
    return STATUS_MARKERS.WAITING;
  }
  if (content.includes(STATUS_MARKERS.BLOCKED)) {
    return STATUS_MARKERS.BLOCKED;
  }
  if (content.includes(STATUS_MARKERS.NEEDS_REVIEW)) {
    return STATUS_MARKERS.NEEDS_REVIEW;
  }
  
  // Check issue status
  if (content.includes(STATUS_MARKERS.HAS_BUGS)) {
    return STATUS_MARKERS.HAS_BUGS;
  }

  // Check for progress patterns
  const lowerContent = content.toLowerCase();
  if (PROGRESS_PATTERNS.some(pattern => lowerContent.includes(pattern))) {
    return STATUS_MARKERS.ACTIVE;
  }

  return STATUS_MARKERS.PLANNED;
}

/**
 * Formats status output with color
 * @param {string} text - Text to format
 * @param {string} status - Status marker
 * @returns {string} Formatted text
 */
export function formatStatus(text, status) {
  let color;
  switch (status) {
    case STATUS_MARKERS.COMPLETED:
      color = STATUS_COLORS.COMPLETED;
      break;
    case STATUS_MARKERS.COMPLETED_EXCELLENT:
      color = STATUS_COLORS.COMPLETED_EXCELLENT;
      break;
    case STATUS_MARKERS.COMPLETED_VERIFIED:
      color = STATUS_COLORS.COMPLETED_VERIFIED;
      break;
    case STATUS_MARKERS.READY_DEPLOYMENT:
      color = STATUS_COLORS.READY_DEPLOYMENT;
      break;
    case STATUS_MARKERS.IMPROVING:
      color = STATUS_COLORS.IMPROVING;
      break;
    case STATUS_MARKERS.ACTIVE:
      color = STATUS_COLORS.ACTIVE;
      break;
    case STATUS_MARKERS.NEEDS_ATTENTION:
      color = STATUS_COLORS.NEEDS_ATTENTION;
      break;
    case STATUS_MARKERS.HAS_IDEAS:
      color = STATUS_COLORS.HAS_IDEAS;
      break;
    case STATUS_MARKERS.PLANNED:
      color = STATUS_COLORS.PLANNED;
      break;
    case STATUS_MARKERS.WAITING:
      color = STATUS_COLORS.WAITING;
      break;
    case STATUS_MARKERS.BLOCKED:
      color = STATUS_COLORS.BLOCKED;
      break;
    case STATUS_MARKERS.NEEDS_REVIEW:
      color = STATUS_COLORS.NEEDS_REVIEW;
      break;
    case STATUS_MARKERS.HAS_BUGS:
      color = STATUS_COLORS.HAS_BUGS;
      break;
    default:
      return text;
  }
  return `${status} ${color(text)}`;
}

/**
 * Formats a section header
 * @param {string} title - Section title
 * @returns {string} Formatted header
 */
export function formatHeader(title) {
  return STATUS_COLORS.HEADER(`\n${title}\n${'='.repeat(title.length)}\n`);
}

/**
 * Formats a subsection header
 * @param {string} title - Subsection title
 * @returns {string} Formatted header
 */
export function formatSection(title) {
  return STATUS_COLORS.SECTION(`\n${title}\n${'-'.repeat(title.length)}\n`);
}

/**
 * Prints status legend
 */
export function printLegend() {
  console.log('\nStatus Legend:');
  console.log('\nCompletion Status:');
  console.log(formatStatus('Completed Successfully', STATUS_MARKERS.COMPLETED));
  console.log(formatStatus('Completed with Excellence', STATUS_MARKERS.COMPLETED_EXCELLENT));
  console.log(formatStatus('Completed and Verified', STATUS_MARKERS.COMPLETED_VERIFIED));
  console.log(formatStatus('Ready for Deployment', STATUS_MARKERS.READY_DEPLOYMENT));
  console.log('\nProgress Status:');
  console.log(formatStatus('Improving', STATUS_MARKERS.IMPROVING));
  console.log(formatStatus('Actively Working', STATUS_MARKERS.ACTIVE));
  console.log(formatStatus('Needs Attention', STATUS_MARKERS.NEEDS_ATTENTION));
  console.log(formatStatus('Has Improvement Ideas', STATUS_MARKERS.HAS_IDEAS));
  console.log('\nPlanning Status:');
  console.log(formatStatus('Planned', STATUS_MARKERS.PLANNED));
  console.log(formatStatus('Waiting for Dependencies', STATUS_MARKERS.WAITING));
  console.log(formatStatus('Blocked', STATUS_MARKERS.BLOCKED));
  console.log(formatStatus('Needs Review', STATUS_MARKERS.NEEDS_REVIEW));
  console.log('\nIssue Status:');
  console.log(formatStatus('Has Known Bugs', STATUS_MARKERS.HAS_BUGS));
  console.log('');
}

/**
 * Filters items by status
 * @param {Array} items - Array of status items
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered items
 */
export function filterByStatus(items, status) {
  return items.filter(item => detectStatus(item) === status);
}

/**
 * Gets incomplete items
 * @param {Array} items - Array of status items
 * @returns {Array} Incomplete items
 */
export function getIncompleteItems(items) {
  return items.filter(item => {
    const status = detectStatus(item);
    return ![STATUS_MARKERS.COMPLETED, STATUS_MARKERS.COMPLETED_EXCELLENT, STATUS_MARKERS.COMPLETED_VERIFIED, STATUS_MARKERS.READY_DEPLOYMENT].includes(status);
  });
}