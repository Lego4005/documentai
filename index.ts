import { configureLogging } from './config/logging';
import { Server } from './server';

// Must be FIRST IMPORTANT STATEMENT
configureLogging();

// Then create server instance
const server = new Server();
server.start();
