import { configure, getLogger } from 'log4js';

configure({
  appenders: {
    out: { type: 'console' }
  },
  categories: {
    default: {
      appenders: ['out'],
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    }
  }
});

export const logger = getLogger();
