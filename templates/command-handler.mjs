#!/usr/bin/env node

import { gitManager } from './git-manager.mjs';
import { docUpdater } from './doc-updater.mjs';
import fs from 'fs/promises'; // Import fs.promises for file operations

// Update parseCommand to handle # commands and multi-word commands
function parseCommand(message) {
  if (!message) return null;
  const parts = message.trim().split(' ');
  
  // Check if command starts with #
  if (!parts[0].startsWith('#')) {
    return null;
  }
  
  // Remove # from first part
  parts[0] = parts[0].substring(1);
  
  // Handle multi-word commands
  const knownCommands = Object.keys(COMMANDS);
  let command = parts[0];
  let args = parts.slice(1);
  
  // Try to match two-word commands
  if (parts.length > 1) {
    const twoWordCmd = `${parts[0]} ${parts[1]}`;
    if (knownCommands.includes(twoWordCmd)) {
      command = twoWordCmd;
      args = parts.slice(2);
    }
  }
  
  return { command, args };
}

/**
 * Unified Commands
 */
const COMMANDS = {
  'load project': {
    description: '🚀 Initialize/Load Project', // Emoji and shorter description
    handler: async () => {
      await gitManager.updateStatus();
      await docUpdater.processUpdates();
      return 'Memory bank initialized';
    }
  },
  'status check': {
    description: '📊 Check Project Status', // Emoji and shorter description
    handler: async () => {
      await gitManager.updateStatus();
      await docUpdater.forceUpdate();
      return 'Status updated in memory bank';
    }
  },
  'update memory': { // Renamed from updatememory
    description: '💾 Update Memory Bank', // Emoji and shorter description
    handler: async () => {
      await gitManager.checkAutoCommit();
      await docUpdater.forceUpdate();
      return 'Memory bank updated';
    }
  },
  'create branch': { // Renamed from branch
    description: '🌱 Create Branch', // Emoji and shorter description
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
  'create commit': { // Renamed from commit
    description: '✍️ Create Commit', // Emoji and shorter description
    usage: '#commit "<message>"',
    handler: async (args) => {
      if (args.length < 1) {
        throw new Error('Usage: #commit "<message>"');
      }
      const message = args.join(' ').replace(/(^["'])|(["']$)/g, '');
      await gitManager.createCommit(message);
      await docUpdater.queueUpdate('commit', [message], 'Commit created');
      return `Created commit: ${message}`;
    }
  },
  'manage pr': { // Renamed from pr
    description: '🤝 Manage PR', // Emoji and shorter description
    usage: '#pr <create|update|close>',
    handler: async (args) => {
      if (args.length < 1) {
        throw new Error('Usage: #pr <create|update|close>');
      }
      const [action] = args;
      await docUpdater.queueUpdate('pr', [action], 'PR action performed');
      return `To ${action} PR, use your git provider's interface`;
    }
  },
  'create file': { // New command
    description: '📝 Create File', // Emoji and shorter description
    usage: '#create file <path/to/new_file.js>',
    handler: async (args) => {
      if (args.length < 1) {
        throw new Error('Usage: #create file <path/to/new_file.js>');
      }
      const filePath = args[0]; // Extract file path from arguments
      console.log(`Creating new file: ${filePath}`);
      
      // Add default content based on file extension
      let defaultContent = '';
      if (filePath.endsWith('.txt')) {
        defaultContent = 'Created by Memory Bank System\n';
      }
      
      // Use write_to_file tool to create the file
      try {
        await handleToolResult('write_to_file', [{ path: filePath, content: defaultContent }], 'File created successfully');
        console.log(`Successfully created file: ${filePath}`);
        return `File created successfully: ${filePath}`;
      } catch (error) {
        console.error(`Failed to create file: ${error.message}`);
        throw new Error(`Failed to create file: ${error.message}`);
      }
    }
  },
  'update file': { // New command
    description: '✏️ Update File', // Emoji and shorter description
    usage: '#update file <path/to/existing_file.js> -m "<message>"',
    handler: async (args) => {
      if (args.length < 3) {
        throw new Error('Usage: #update file <path/to/existing_file.js> -m "<message>"');
      }
      const filePath = args[2];
      const message = args.slice(4).join(' ').replace(/(^["'])|(["']$)/g, '');
      console.log(`Placeholder: Updating file: ${filePath} with message: ${message}`);
      return `Placeholder: File update command received for: ${filePath} with message: ${message}`;
    }
  },
  'analyze code quality': { // New command
    description: '🔍 Analyze Code Quality', // Emoji and shorter description
    handler: async (args) => {
      console.log('Placeholder: Analyzing code quality...'); // Placeholder action
      return 'Placeholder: Code quality analysis command received.';
    }
  },
  'test run unit': { // New command
    description: '✅ Run Unit Tests', // Emoji and shorter description
    handler: async (args) => {
      console.log('Placeholder: Running unit tests...'); // Placeholder action
      return 'Placeholder: Run unit tests command received.';
    }
  },
  'deploy staging': { // New command
    description: '📦 Deploy Staging (% Complete)', // Emoji and shorter description
    handler: async (args) => {
      // Example of progress reporting - Placeholder for now
      console.log('Placeholder: Deploying to staging... 0%');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate deployment time
      console.log('Placeholder: Deploying to staging... 50%');
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Placeholder: Deploying to staging... 100%');
      
      // Placeholder completion message
      return 'Placeholder: Deploy to staging command received. Deployment to staging complete! 🚀 (Placeholder)'; 
    }
  }
};

/**
 * Tool Commands - Keeping this for tool result handling, but not directly exposed as user commands
 */
const TOOL_COMMANDS = { 
  write_to_file: {
    handler: async (args, result) => {
      console.log('Creating file with args:', args);
      const [{ path, content }] = args;
      console.log(`Attempting to create file at: ${path}`);
      try {
        await fs.writeFile(path, content);
        console.log(`Successfully wrote to file: ${path}`);
        await docUpdater.queueUpdate('write_to_file', args, result);
        return `File created: ${path}`;
      } catch (error) {
        console.error(`Error creating file: ${error.message}`);
        throw error;
      }
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

const handleToolResult = async (command, args, result) => {
  const toolCommand = TOOL_COMMANDS[command];
  if (toolCommand && typeof toolCommand.handler === 'function') {
    return await toolCommand.handler(args, result);
  }
  throw new Error(`Tool command handler not found for command: ${command}`);
};

/**
 * Get command help
 */
function getCommandHelp() {
  let help = 'Available Commands:\n\n';

  // Commands
  help += 'Commands:\n'; 
  Object.entries(COMMANDS).forEach(([name, cmd]) => { 
    help += `#${name} - ${cmd.description}\n`;
    if (cmd.usage) help += `  Usage: ${cmd.usage}\n`; 
  });

  return help;
}

/**
 * Initialize command system
 */
async function initializeCommands() {
  try {
    // Check for projectInstructions.md
    const instructionsPath = './projectInstructions.md';
    try {
      await fs.readFile(instructionsPath, 'utf8');
      // Prompt user to load instructions (or auto-load if configured) - Placeholder for now
      console.log('Project instructions found in projectInstructions.md. Load project instructions now? (yes/no)');
      // For now, assume yes and load instructions
      console.log('Loading project instructions...');
    } catch (error) {
      console.log('No projectInstructions.md found. Please provide project instructions or create projectInstructions.md.');
      return; // Exit initialization
    }

    // Load project instructions (Placeholder - actual logic to process instructions and create files will be added later)
      console.log('Project instructions loaded.');

    // Ensure projectOverview.md exists (Placeholder - creation logic will be added later)
    console.log('Ensuring projectOverview.md exists...');

    // Start git tracking and auto-commit
    await gitManager.updateStatus();
    setInterval(() => {
      gitManager.checkAutoCommit().catch(console.error);
    }, 5 * 60 * 1000); // Check every 5 minutes

    // Force initial documentation update
    await docUpdater.forceUpdate();

    console.log('Project initialization complete.');

  } catch (error) {
    console.error('Error initializing commands:', error);
  }
}

/**
 * Handle command
 */
async function handleCommand(message) { // Modified handleCommand function
  const parsed = parseCommand(message);
  if (!parsed) return null;

  const { command, args } = parsed;
  const handler = COMMANDS[command]; // Use unified COMMANDS registry

  if (!handler) {
    // Check for tool commands - Placeholder, will integrate tool commands later if needed
    if (TOOL_COMMANDS[command]) {
      return handleToolResult(command, args, {}); // Pass empty result for now
    }
    throw new Error(`Unknown command: #${command}. Type '#help' to see available commands.`); // Enhanced "Unknown command" error
  }

  try {
    console.log(`Handling command: ${command} with args: ${args}`); // Add log for command handling
    return await handler.handler(args);
  } catch (error) {
    throw new Error(`Command '#${command}' failed: ${error.message}`); // Enhanced "Command failed" error
  }
}

// Export for use in memory bank system
export const commandHandler = {
  handleCommand,
  handleToolResult,
  getCommandHelp, 
  initializeCommands
};

// Basic command-line interface for testing - REMOVE LATER
if (process.argv[2] === 'help') {
  const helpMessage = commandHandler.getCommandHelp();
  console.log(helpMessage);
} else if (process.argv[2]) {
  // Add # prefix if not present for command parsing
  const command = process.argv.slice(2).join(' ');
  const prefixedCommand = command.startsWith('#') ? command : '#' + command;
  commandHandler.handleCommand(prefixedCommand)
    .then(result => {
      if (result) console.log(result);
    })
    .catch(error => {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    });
}
