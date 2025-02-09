import http from 'http';
import { ContextManager } from './core/ContextManager.js';
import { MetricsReporter } from './reporters/MetricsReporter.js';
import fs from 'fs/promises';
import path from 'path';
import { Logger, LogLevel } from './utils/Logger.js';

interface Tool {
  name: string;
  description: string;
  enabled: boolean;
  requires_setup: boolean;
  config?: unknown;
}

interface ResourceTemplate {
  id: string;
  name: string;
  description: string;
  schema: unknown;
}

interface MCPServerConfig {
  socketPath: string;
  tools: {
    [key: string]: {
      enabled: boolean;
      config?: unknown;
    };
  };
}

export class MCPServer {
  private readonly server: http.Server;
  private readonly contextManager: ContextManager;
  private readonly metricsReporter: MetricsReporter;
  private readonly toolRegistry: Map<string, Tool>;
  private readonly resourceTemplates: Map<string, ResourceTemplate>;
  private readonly socketPath: string;
  private readonly configDir: string;
  private initialized: boolean = false;
  private readonly logger: Logger;

  constructor(config: MCPServerConfig) {
    this.logger = Logger.getInstance();
    this.logger.setLogLevel(LogLevel.DEBUG); // Enable detailed logging
    
    this.socketPath = config.socketPath;
    this.contextManager = new ContextManager();
    this.metricsReporter = new MetricsReporter();
    this.toolRegistry = new Map();
    this.resourceTemplates = new Map();
    
    this.logger.info('Initializing MCP server configuration...');
    this.configDir = path.join(process.cwd(), '.cline', 'mcp');
    this.logger.debug('Config directory:', this.configDir);

    // Create HTTP server with proper error handling
    this.server = http.createServer((req, res) => {
      if (!this.initialized) {
        this.logger.warn('Received request while server is initializing');
        res.writeHead(503, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server initializing' }));
        return;
      }
      this.handleRequest(req, res).catch(error => {
        this.logger.error('Request error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Internal server error' }));
      });
    });
  }

  private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', `unix://${this.socketPath}`);
    const method = req.method ?? 'GET';

    this.logger.debug(`Handling ${method} request to ${url.pathname}`);

    try {
      switch (true) {
        case method === 'GET' && url.pathname === '/health':
          await this.handleHealthCheck(res);
          break;

        case method === 'GET' && url.pathname === '/tools':
          await this.handleToolsList(res);
          break;

        case method === 'GET' && url.pathname === '/resources':
          await this.handleResourcesList(res);
          break;

        case method === 'GET' && url.pathname === '/resource_templates':
          await this.handleResourceTemplatesList(res);
          break;

        case method === 'GET' && url.pathname.startsWith('/tool/'):
          await this.handleToolGet(req, res);
          break;

        case method === 'POST' && url.pathname.startsWith('/tool/'):
          await this.handleToolPost(req, res);
          break;

        default:
          this.handleNotFound(res);
      }
    } catch (error) {
      this.handleServerError(res, error);
    }
  }

  private async handleHealthCheck(res: http.ServerResponse): Promise<void> {
    this.logger.debug('Processing health check request');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      timestamp: Date.now(),
      initialized: this.initialized,
      toolCount: this.toolRegistry.size
    }));
  }

  private async handleToolsList(res: http.ServerResponse): Promise<void> {
    this.logger.debug('Processing tools list request');
    const tools = Array.from(this.toolRegistry.values());
    this.logger.info('Available tools:', tools.map(t => t.name));
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      tools,
      listChanged: false,
      initialized: this.initialized
    }));
  }

  private async handleResourcesList(res: http.ServerResponse): Promise<void> {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      resources: [],
      listChanged: false
    }));
  }

  private async handleResourceTemplatesList(res: http.ServerResponse): Promise<void> {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      templates: Array.from(this.resourceTemplates.values()),
      listChanged: false
    }));
  }

  private async handleToolGet(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', `unix://${this.socketPath}`);
    const toolName = url.pathname.split('/')[2];
    const tool = this.toolRegistry.get(toolName);

    if (!tool) {
      this.handleToolNotFound(res, toolName);
      return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(tool));
  }

  private async handleToolPost(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
    const url = new URL(req.url ?? '/', `unix://${this.socketPath}`);
    const execToolName = url.pathname.split('/')[2];
    const execTool = this.toolRegistry.get(execToolName);

    if (!execTool) {
      this.handleToolNotFound(res, execToolName);
      return;
    }

    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const params = body ? JSON.parse(body) : {};
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'executed',
      tool: execToolName,
      params
    }));
  }

  private handleNotFound(res: http.ServerResponse): void {
    this.logger.warn(`Unknown endpoint`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  private handleServerError(res: http.ServerResponse, error: any): void {
    this.logger.error('Request error:', error as Error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }

  private handleToolNotFound(res: http.ServerResponse, toolName: string): void {
    this.logger.warn(`Tool not found: ${toolName}`);
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Tool not found' }));
  }

  async initialize(): Promise<void> {
    this.logger.group('Server Initialization');
    try {
      this.logger.info('Starting MCP server initialization...');
      
      // Create socket directory if it doesn't exist
      const socketDir = path.dirname(this.socketPath);
      await fs.mkdir(socketDir, { recursive: true });
      this.logger.success('Socket directory created:', socketDir);

      // Clean up existing socket file if it exists
      try {
        await fs.unlink(this.socketPath);
        this.logger.success('Cleaned up existing socket file');
      } catch (err) {
        // Ignore error if socket doesn't exist
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw err;
        }
      }

      // Load tools
      await this.loadTools();
      
      this.initialized = true;
      this.logger.success('Server initialization complete');
    } catch (error) {
      this.logger.error('Server initialization failed:', error as Error);
      throw error;
    } finally {
      this.logger.groupEnd();
    }
  }

  private async loadTools(): Promise<void> {
    this.logger.group('Loading Tools');
    try {
      this.logger.info('Reading configuration files...');
      const [configContent, toolsContent] = await Promise.all([
        fs.readFile(path.join(this.configDir, 'config.json'), 'utf-8'),
        fs.readFile(path.join(this.configDir, 'tools.json'), 'utf-8')
      ]);

      const config = JSON.parse(configContent);
      const tools = JSON.parse(toolsContent);

      this.logger.debug('Clearing existing tool registry');
      this.toolRegistry.clear();

      let enabledCount = 0;
      let disabledCount = 0;

      // Register all enabled tools
      for (const tool of tools.available_tools) {
        const toolConfig = config.tools[tool.name];
        if (toolConfig?.enabled) {
          this.logger.info(`Registering tool: ${tool.name}`);
          this.toolRegistry.set(tool.name, {
            ...tool,
            enabled: true,
            config: toolConfig.config
          });
          enabledCount++;
        } else {
          this.logger.debug(`Skipping disabled tool: ${tool.name}`);
          disabledCount++;
        }
      }

      const registeredTools = Array.from(this.toolRegistry.keys());
      this.logger.success(`Tool loading complete. ${enabledCount} enabled, ${disabledCount} disabled`);
      
      if (registeredTools.length === 0) {
        this.logger.warn('No tools were registered. Check your configuration.');
      } else {
        this.logger.info('Registered tools:', registeredTools);
      }
    } catch (error) {
      this.logger.error('Failed to load tools:', error as Error);
      throw error;
    } finally {
      this.logger.groupEnd();
    }
  }

  async start(): Promise<void> {
    try {
      if (!this.initialized) {
        this.logger.info('Server not initialized. Running initialization...');
        await this.initialize();
      }

      await new Promise<void>((resolve, reject) => {
        this.server.listen(this.socketPath, () => {
          const tools = Array.from(this.toolRegistry.keys());
          this.logger.success(`Server running on Unix socket: ${this.socketPath}`);
          this.logger.info('Available tools:', tools);
          resolve();
        });
        this.server.on('error', reject);
      });
    } catch (err) {
      this.logger.error('Failed to start server:', err as Error);
      throw err;
    }
  }

  async stop(): Promise<void> {
    this.logger.info('Stopping server...');
    try {
      await new Promise<void>((resolve, reject) => {
        this.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Clean up socket file
      try {
        await fs.unlink(this.socketPath);
        this.logger.success('Cleaned up socket file');
      } catch (err) {
        // Ignore error if socket is already removed
        if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
          this.logger.warn('Failed to clean up socket file:', err);
        }
      }
      
      this.initialized = false;
      this.logger.success('Server stopped');
    } catch (err) {
      this.logger.error('Failed to stop server:', err as Error);
      throw err;
    }
  }
} 