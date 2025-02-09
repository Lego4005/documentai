import { configure } from 'log4js';

export const configureLogging = () => {
  configure({
    appenders: {
      console: { type: 'console' }
    },
    categories: {
      default: { appenders: ['console'], level: process.env.LOG_LEVEL || 'info' }
    }
  });
};
