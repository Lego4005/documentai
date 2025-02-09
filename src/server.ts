import { MCPServer } from './mcp-server.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

async function loadConfig() {
  try {
    const configPath = path.join(process.cwd(), '.cline', 'mcp', 'config.json');
    const configContent = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(configContent);
    
    // Use Unix socket in the user's home directory
    const socketPath = path.join(os.homedir(), '.cline', 'mcp.sock');
    
    // Ensure the .cline directory exists
    await fs.mkdir(path.join(os.homedir(), '.cline'), { recursive: true });
    
    // Remove existing socket if it exists
    try {
      await fs.unlink(socketPath);
    } catch (err) {
      // Ignore error if socket doesn't exist
    }

    return {
      socketPath,
      tools: config.tools
    };
  } catch (error) {
    console.error('Failed to load config:', error);
    throw error;
  }
}

async function main() {
  try {
    const config = await loadConfig();
    const server = new MCPServer(config);

    // Handle cleanup on exit
    const cleanup = async () => {
      console.log('Shutting down server...');
      await server.stop();
      // Remove socket file
      try {
        await fs.unlink(config.socketPath);
      } catch (err) {
        // Ignore error if socket is already removed
      }
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection:', err);
      process.exit(1);
    });

    await server.start();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main(); 