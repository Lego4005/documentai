from typing import Dict, Type
from mcp.tools.base import BaseTool
from .tools.memory_bank import MemoryBankTool

TOOL_REGISTRY: Dict[str, Type[BaseTool]] = {
    "memory_bank": MemoryBankTool,
}

def register_tools() -> None:
    """Register all available tools with the MCP server."""
    from mcp.server import register_tool
    
    for tool_name, tool_class in TOOL_REGISTRY.items():
        register_tool(tool_name, tool_class)

def get_tool_config(tool_name: str) -> dict:
    """Get configuration for a specific tool."""
    import json
    import os
    
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    with open(config_path) as f:
        config = json.load(f)
    
    return config.get("tools", {}).get(tool_name, {}).get("config", {}) 