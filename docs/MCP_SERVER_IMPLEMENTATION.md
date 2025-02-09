# MCP Server Implementation Guide

## Overview

The MCP (Model Context Protocol) server is designed to manage and expose tools through a Unix domain socket interface. This document explains the key components and implementation details.

## Key Components

### 1. Server Configuration

```typescript
interface MCPServerConfig {
  socketPath: string;
  tools: {
    [key: string]: {
      enabled: boolean;
      config?: unknown;
    };
  };
}
```

The server configuration defines:
- Socket path for local communication
- Tool configurations with enabled status and tool-specific settings

### 2. Tool Definition

```typescript
interface Tool {
  name: string;
  description: string;
  enabled: boolean;
  requires_setup: boolean;
  config?: unknown;
}
```

Each tool has:
- Unique name identifier
- Description of functionality
- Enabled/disabled status
- Setup requirements flag
- Optional configuration

## Implementation Details

### 1. Tool Registration Process

```typescript
private async loadTools(): Promise<void> {
  // Load configuration files
  const [configContent, toolsContent] = await Promise.all([
    fs.readFile(path.join(this.configDir, 'config.json'), 'utf-8'),
    fs.readFile(path.join(this.configDir, 'tools.json'), 'utf-8')
  ]);

  const config = JSON.parse(configContent);
  const tools = JSON.parse(toolsContent);

  // Register enabled tools
  for (const tool of tools.available_tools) {
    const toolConfig = config.tools[tool.name];
    if (toolConfig?.enabled) {
      this.toolRegistry.set(tool.name, {
        ...tool,
        enabled: true,
        config: toolConfig.config
      });
    }
  }
}
```

Key points:
- Tools are defined in `tools.json`
- Configurations are in `config.json`
- Only enabled tools are registered
- Tool registry is a Map for efficient lookups

### 2. Request Handling

```typescript
private async handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', `unix://${this.socketPath}`);
  const method = req.method ?? 'GET';

  // Handle different endpoints...
}
```

Endpoints:
- `GET /health` - Server health check
- `GET /tools` - List available tools
- `GET /tool/{name}` - Get tool details
- `POST /tool/{name}/execute` - Execute tool
- `GET /resources` - List resources
- `GET /resource_templates` - List resource templates

### 3. Tool Execution

```typescript
case method === 'POST' && url.pathname.startsWith('/tool/'):
  const execToolName = url.pathname.split('/')[2];
  const execTool = this.toolRegistry.get(execToolName);
  
  if (!execTool) {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Tool not found' }));
    return;
  }
  
  let body = '';
  for await (const chunk of req) {
    body += chunk;
  }
  
  const params = body ? JSON.parse(body) : {};
  // Execute tool with params...
```

Tool execution involves:
1. Tool lookup by name
2. Parameter parsing from request body
3. Execution with provided parameters
4. Response with execution results

## Configuration Files

### 1. tools.json Structure

```json
{
  "available_tools": [
    {
      "name": "tool-name",
      "description": "Tool description",
      "enabled": true,
      "requires_setup": false
    }
  ]
}
```

### 2. config.json Structure

```json
{
  "tools": {
    "tool-name": {
      "enabled": true,
      "config": {
        // Tool-specific configuration
      }
    }
  }
}
```

## Best Practices

1. **Tool Registration**
   - Register tools during server initialization
   - Validate tool configurations before enabling
   - Log registration status for debugging

2. **Error Handling**
   - Proper error handling for file operations
   - Graceful handling of missing configurations
   - Clear error messages for debugging

3. **Socket Management**
   - Clean up existing socket files
   - Create socket directory if needed
   - Proper cleanup on server shutdown

4. **Configuration Management**
   - Separate tool definitions from configurations
   - Enable/disable tools without removing configuration
   - Allow tool-specific configuration options

## Example: Adding a New Tool

1. Add tool definition to `tools.json`:
```json
{
  "available_tools": [
    {
      "name": "new-tool",
      "description": "New tool description",
      "enabled": true,
      "requires_setup": false
    }
  ]
}
```

2. Add tool configuration to `config.json`:
```json
{
  "tools": {
    "new-tool": {
      "enabled": true,
      "config": {
        "option1": "value1",
        "option2": "value2"
      }
    }
  }
}
```

3. Restart the server to load the new tool.

## Security Considerations

1. **Socket Permissions**
   - Unix socket provides local-only access
   - Set appropriate socket file permissions
   - Clean up socket file on shutdown

2. **Tool Validation**
   - Validate tool configurations
   - Check required setup status
   - Verify tool dependencies

3. **Error Handling**
   - Sanitize error messages
   - Prevent information leakage
   - Log errors securely 