from logging.config import dictConfig
from your_config_module import LOGGING_CONFIG

def create_app():
    dictConfig(LOGGING_CONFIG)  # Must be called before any logger instances
    # Rest of app initialization
