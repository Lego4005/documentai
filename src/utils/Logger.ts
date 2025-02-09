import chalk from 'chalk';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export class Logger {
  private static instance: Logger;
  private logLevel: LogLevel = LogLevel.INFO;
  private groupLevel: number = 0;
  private readonly indent = '  ';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setLogLevel(level: LogLevel): void {
    this.logLevel = level;
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getIndentation(): string {
    return this.indent.repeat(this.groupLevel);
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.logLevel;
  }

  private formatMessage(level: string, message: string, ...args: any[]): string {
    const timestamp = chalk.gray(`[${this.getTimestamp()}]`);
    const indentation = this.getIndentation();
    const formattedArgs = args.map(arg => {
      if (typeof arg === 'object') {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    }).join(' ');

    return `${timestamp} ${indentation}${level} ${message} ${formattedArgs}`.trim();
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const level = chalk.blue('[DEBUG]');
      console.log(this.formatMessage(level, message, ...args));
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const level = chalk.white('[INFO]');
      console.log(this.formatMessage(level, message, ...args));
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const level = chalk.yellow('[WARN]');
      console.warn(this.formatMessage(level, message, ...args));
    }
  }

  error(message: string, error?: Error, ...args: any[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const level = chalk.red('[ERROR]');
      console.error(this.formatMessage(level, message, ...args));
      if (error?.stack) {
        console.error(chalk.red(this.getIndentation() + error.stack));
      }
    }
  }

  success(message: string, ...args: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const level = chalk.green('[SUCCESS]');
      console.log(this.formatMessage(level, message, ...args));
    }
  }

  group(label?: string): void {
    if (label && this.shouldLog(LogLevel.DEBUG)) {
      const level = chalk.cyan('[GROUP]');
      console.log(this.formatMessage(level, label));
    }
    this.groupLevel++;
  }

  groupEnd(): void {
    if (this.groupLevel > 0) {
      this.groupLevel--;
    }
  }

  table(data: any[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      const indentation = this.getIndentation();
      console.log(chalk.cyan(`${indentation}[TABLE]`));
      console.table(data);
    }
  }
} 