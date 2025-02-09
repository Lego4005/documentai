import chalk from 'chalk';
import { ProjectMetrics, ChecklistStatus } from '../types/index.js';

export class MetricsReporter {
  private static formatPercentage(value: number): string {
    let color: 'green' | 'yellow' | 'red';
    if (value >= 70) {
      color = 'green';
    } else if (value >= 50) {
      color = 'yellow';
    } else {
      color = 'red';
    }
    return chalk[color](`${value.toFixed(1)}%`);
  }

  private static formatTokens(value: number): string {
    return chalk.cyan(`${value.toLocaleString()} tokens`);
  }

  private static getStatusSymbol(value: number, threshold: number = 70): string {
    let symbol: string;
    if (value >= threshold) {
      symbol = chalk.green('✓');
    } else if (value >= threshold * 0.7) {
      symbol = chalk.yellow('⚠');
    } else {
      symbol = chalk.red('✗');
    }
    return symbol;
  }

  private static formatChecklistStatus(status: ChecklistStatus): string {
    const items = [
      `Documentation: ${status.documentation ? chalk.green('✓') : chalk.red('✗')}`,
      `Metrics: ${status.metrics ? chalk.green('✓') : chalk.red('✗')}`,
      `Context: ${status.context ? chalk.green('✓') : chalk.red('✗')}`,
      `Health: ${status.health ? chalk.green('✓') : chalk.red('✗')}`,
      `Last Check: ${chalk.cyan(status.timestamp)}`
    ];
    return items.join('\n');
  }

  static generateReport(metrics: ProjectMetrics): string {
    const { id, memoryBank, optimization, metrics: stats, sessionCount } = metrics;
    
    const header = chalk.bold.blue('\n🔍 Chat Analytics Project Status\n');
    
    const projectInfo = [
      chalk.bold('Project Information'),
      `ID: ${chalk.cyan(id)}`,
      `Memory Bank: ${chalk.cyan(memoryBank)}`,
      `Total Sessions: ${chalk.cyan(sessionCount)}`,
      ''
    ].join('\n');

    const checklistInfo = metrics.checklistStatus ? [
      chalk.bold('Checklist Status'),
      this.formatChecklistStatus(metrics.checklistStatus),
      ''
    ].join('\n') : '';

    const optimizationStatus = [
      chalk.bold('Optimization Status'),
      `${this.getStatusSymbol(optimization.enabled ? 100 : 0)} Optimization: ${optimization.enabled ? chalk.green('Enabled') : chalk.red('Disabled')}`,
      `${this.getStatusSymbol(optimization.deduplication ? 100 : 0)} Deduplication: ${optimization.deduplication ? chalk.green('Active') : chalk.yellow('Inactive')}`,
      ''
    ].join('\n');

    const metricsStatus = [
      chalk.bold('Performance Metrics'),
      `${this.getStatusSymbol(stats.efficiency.cacheHitRate)} Cache Hit Rate: ${this.formatPercentage(stats.efficiency.cacheHitRate)}`,
      `${this.getStatusSymbol(stats.efficiency.contextReuse)} Context Reuse: ${this.formatPercentage(stats.efficiency.contextReuse)}`,
      `${this.getStatusSymbol(stats.efficiency.tokenOptimization)} Token Optimization: ${this.formatPercentage(stats.efficiency.tokenOptimization)}`,
      ''
    ].join('\n');

    const savingsInfo = [
      chalk.bold('Resource Savings'),
      `Tokens Saved: ${this.formatTokens(stats.session.tokensSaved)}`,
      `Cost Saved: ${chalk.green('$' + stats.session.costSaved.toFixed(2))}`,
      `Efficiency Score: ${this.formatPercentage(stats.efficiency.overallScore)}`,
      ''
    ].join('\n');

    const footer = chalk.dim('Run "update memory" to refresh metrics\n');

    return [
      header,
      projectInfo,
      checklistInfo,
      optimizationStatus,
      metricsStatus,
      savingsInfo,
      footer
    ].join('\n');
  }
}