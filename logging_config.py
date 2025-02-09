LOGGING_CONFIG = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'default': {
            'level': 'WARNING',
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'pinecone-mcp': {
            'handlers': ['default'],
            'level': 'WARNING',
            'propagate': False  # Prevent double logging
        },
        'mcp.server.lowlevel.server': {
            'handlers': ['default'],
            'level': 'ERROR',
            'propagate': False
        }
    }
}
