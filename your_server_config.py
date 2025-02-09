import logging

# Add at the VERY START of your configuration
logging.basicConfig(
    level=logging.WARNING,  # Set global minimum level
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Then configure specific loggers
logging.getLogger('pinecone-mcp').setLevel(logging.WARNING)
logging.getLogger('mcp.server.lowlevel.server').setLevel(logging.ERROR)
