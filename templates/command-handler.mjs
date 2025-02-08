#!/usr/bin/env node

import { gitManager } from './git-manager.mjs';
import { docUpdater } from './doc-updater.mjs';

/**
 * Memory Bank Commands
 */
const MEMORY_COMMANDS = {
  loadmemory: {
    description: 'Initialize memory bank system',
    handler: async () => {
      await gitManager.updateStatus();
      await docUpdater.forceUpdate();
      return 'Memory bank initialized';
    }
  },
  status: {
    description: 'Check system status',
    handler: async () => {
      await gitManager.updateStatus();
      await docUpdater.forceUpdate();
      return 'Status updated in memory bank';
    }
  },
  updatememory: {
    description: 'Update memory bank with current state',
    handler: async () => {
      await gitManager.checkAutoCommit();
      await docUpdater.forceUpdate();
      return 'Memory bank updated';
    }
  }
};

/**
 * Git Commands
 */
const GIT_COMMANDS = {
  branch: {
    description: 'Create new branch',
    usage: '#branch <type> <name>',
    handler: async (args) => {
      if (args.length < 2) {
        throw new Error('Usage: #branch <type> <name>');
      }
      const [type, ...nameParts] = args;
      const name = nameParts.join('-');
      const branch = await gitManager.createBranch(type, name);
      await docUpdater.queueUpdate('branch', [type, name], 'Branch created');
      return `Created branch: ${branch}`;
    }
  },
  commit: {
    description: 'Create commit',
    usage: '#commit "<message>"',
    handler: async (args) => {
      if (args.length < 1) {
        throw new Error('Usage: #commit "<message>"');
      }
      const message = args.join(' ').replace(/^["']|["']$/g, '');
      await gitManager.createCommit(message);
      await docUpdater.queueUpdate('commit', [message], 'Commit created');
      return `Created commit: ${message}`;
    }
  },
  pr: {
    description: 'Manage pull requests',
    usage: '#pr <create|update|close>',
    handler: async (args) => {
      if (args.length < 1) {
        throw new Error('Usage: #pr <create|update|close>');
      }
      const [action] = args;
      await docUpdater.queueUpdate('pr', [action], 'PR action performed');
      return `To ${action} PR, use your git provider's interface`;
    }
  }
};

/**
 * Tool Commands
 */
const TOOL_COMMANDS = {
  write_to_file: {
    handler: async (args, result) => {
      await docUpdater.queueUpdate('write_to_file', args, result);
    }
  },
  apply_diff: {
    handler: async (args, result) => {
      await docUpdater.queueUpdate('apply_diff', args, result);
    }
  },
  insert_content: {
    handler: async (args, result) => {
      await docUpdater.queueUpdate('insert_content', args, result);
    }
  },
  search_and_replace: {
    handler: async (args, result) => {
      await docUpdater.queueUpdate('search_and_replace', args, result);
    }
  },
  execute_command: {
    handler: async (args, result) => {
      await docUpdater.queueUpdate('execute_command', args, result);
    }
  },
  browser_action: {
    handler: async (args, result) => {
      await docUpdater.queueUpdate('browser_action', args, result);
    }
  }
};

/**
 * Combined command registry
 */
const COMMANDS = {
  ...MEMORY_COMMANDS,
  ...GIT_COMMANDS
};

/**
 * Parse command from message
 */
function parseCommand(message) {
  const match = message.match(/^#(\w+)(?:\s+(.*))?$/);
  if (!match) return null;

  const [, command, argsStr] = match;
  const args = argsStr
    ? argsStr.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || []
    : [];

  return {
    command: command.toLowerCase(),
    args
  };
}

/**
 * Handle command
 */
async function handleCommand(message) {
  const parsed = parseCommand(message);
  if (!parsed) return null;

  const { command, args } = parsed;
  const handler = COMMANDS[command];

  if (!handler) {
    throw new Error(`Unknown command: ${command}`);
  }

  try {
    return await handler.handler(args);
  } catch (error) {
    throw new Error(`Command failed: ${error.message}`);
  }
}

/**
 * Handle tool result
 */
async function handleToolResult(tool, args, result) {
  const handler = TOOL_COMMANDS[tool];
  if (handler) {
    await handler.handler(args, result);
  }
}

/**
 * Get command help
 */
function getCommandHelp() {
  let help = 'Available Commands:\n\n';

  // Memory Commands
  help += 'Memory Commands:\n';
  Object.entries(MEMORY_COMMANDS).forEach(([name, cmd]) => {
    help += `#${name} - ${cmd.description}\n`;
  });

  // Git Commands
  help += '\nGit Commands:\n';
  Object.entries(GIT_COMMANDS).forEach(([name, cmd]) => {
    help += `#${name} - ${cmd.description}\n`;
    if (cmd.usage) help += `  Usage: ${cmd.usage}\n`;
  });

  return help;
}

/**
 * Initialize command system
 */
async function initializeCommands() {
  // Start git tracking
  await gitManager.updateStatus();

  // Set up auto-commit interval
  setInterval(() => {
    gitManager.checkAutoCommit().catch(console.error);
  }, 5 * 60 * 1000); // Check every 5 minutes

  // Force initial documentation update
  await docUpdater.forceUpdate();
}

// Export for use in memory bank system
export const commandHandler = {
  handleCommand,
  handleToolResult,
  getCommandHelp,
  initializeCommands
};