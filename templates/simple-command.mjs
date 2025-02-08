#!/usr/bin/env node

import { simpleUpdater } from './simple-updater.mjs';

/**
 * Memory Bank Commands
 */
const MEMORY_COMMANDS = {
  loadmemory: {
    description: 'Initialize memory bank system',
    handler: async () => {
      await simpleUpdater.forceUpdate();
      return 'Memory bank initialized';
    }
  },
  status: {
    description: 'Check system status',
    handler: async () => {
      await simpleUpdater.forceUpdate();
      return 'Status updated in memory bank';
    }
  },
  updatememory: {
    description: 'Update memory bank with current state',
    handler: async () => {
      await simpleUpdater.forceUpdate();
      return 'Memory bank updated';
    }
  }
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
  const handler = MEMORY_COMMANDS[command];

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
  await simpleUpdater.updateAfterTool(tool, args, result);
}

/**
 * Get command help
 */
function getCommandHelp() {
  let help = 'Available Commands:\n\n';

  Object.entries(MEMORY_COMMANDS).forEach(([name, cmd]) => {
    help += `#${name} - ${cmd.description}\n`;
  });

  return help;
}

// Export for use in memory bank system
export const commandHandler = {
  handleCommand,
  handleToolResult,
  getCommandHelp
};