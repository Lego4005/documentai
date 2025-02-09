import { 
  AnalyticsError,
  MetricsStore,
  ProjectMetrics,
  ContextConfig,
  ProjectContext,
  DEFAULT_METRICS,
  DEFAULT_RESOURCE_LIMITS,
  OptimizationOptions,
  SystemStats
} from '../types/index.js';
import NodeCache from 'node-cache';

export class ContextManager {
  private readonly contexts: Map<string, ProjectContext>;
  private readonly optimizationSettings: Map<string, OptimizationOptions>;
  private readonly cache: NodeCache;
  private metrics: MetricsStore[];

  constructor() {
    this.contexts = new Map();
    this.optimizationSettings = new Map();
    this.cache = new NodeCache();
    this.metrics = [];
  }

  async createContext(projectId: string, config: ContextConfig): Promise<void> {
    if (this.contexts.has(projectId)) {
      throw new AnalyticsError('Context already exists for this project', 'CONTEXT_ALREADY_EXISTS');
    }

    const defaultOptimization: OptimizationOptions = {
      maxTokens: 4096,
      tokenBuffer: 200,
      compressionRatio: 0.8,
      priorityTokens: ['code', 'error', 'context'],
      optimizationStrategy: 'smart'
    };

    const projectContext: ProjectContext = {
      id: projectId,
      config,
      metrics: this.getDefaultMetrics()
    };

    this.contexts.set(projectId, projectContext);
    this.optimizationSettings.set(projectId, defaultOptimization);

    await this.updateContext(projectId);
  }

  getContext(projectId: string): ProjectContext {
    const context = this.contexts.get(projectId);
    if (!context) {
      throw new AnalyticsError('Context not found for this project', 'CONTEXT_NOT_FOUND');
    }
    return context;
  }

  async updateMetrics(projectId: string, metrics: Partial<MetricsStore>): Promise<void> {
    const context = this.getContext(projectId);
    context.metrics = { ...context.metrics, ...metrics }; // Merge existing metrics with new metrics.

    // Update cache with new metrics
    console.log(`Updating metrics for project ${projectId}:`, context.metrics); // Added logging
    this.cache.set(`${projectId}:metrics`, context.metrics); // Cache the updated metrics.

    await this.updateContext(projectId);
  }

  getDefaultMetrics(): MetricsStore {
    return {
      projectId: '',
      metrics: {
        performance: [],
        efficiency: [],
        optimization: []
      },
      performance: {
        responseTime: 0,
        resources: {
          cpu: { percentage: 0 },
          memory: { percentage: 0 }
        },
        throughput: 0
      },
      efficiency: {
        cacheHitRate: 0,
        contextReuse: 0,
        tokenOptimization: 0,
        overallScore: 0
      },
      session: {
        tokensSaved: 0,
        costSaved: 0,
        efficiency: 0,
        duration: 0,
        details: []
      },
      history: [],
      timestamp: Date.now()
    };
  }

  addSessionEntry(projectId: string, entry: { type: string; data: Record<string, unknown> }): void {
    const context = this.getContext(projectId);
    if (!context.metrics.history) {
      context.metrics.history = [];
    }
    const timestamp = Date.now();
    context.metrics.history.push({ timestamp, ...entry });

    this.cache.set(`${projectId}:history`, context.metrics.history);
  }

  displayMetrics(projectId: string): void {
    const context = this.getContext(projectId);
    console.log('Project Metrics:', context.metrics);
  }

  async getProjectStats(projectId: string): Promise<{
    totalTokensProcessed: number;
    totalCostSaved: number;
    averageEfficiency: number;
  }> {
    let stats = this.cache.get<{
      totalTokensProcessed: number;
      totalCostSaved: number;
      averageEfficiency: number;
    }>(`${projectId}:stats`);
    
    if (!stats) {
      stats = {
        totalTokensProcessed: 0,
        totalCostSaved: 0,
        averageEfficiency: 0
      };
      this.cache.set(`${projectId}:stats`, stats);
    }
    return stats;
  }

  async updateProjectStats(projectId: string, metrics: MetricsStore): Promise<void> {
    const stats = await this.getProjectStats(projectId);
    const sessionMetrics = metrics.session;
    
    // Update stats using the correct properties from MetricsStore
    stats.totalTokensProcessed = (stats.totalTokensProcessed || 0) + sessionMetrics.tokensSaved;
    stats.totalCostSaved = (stats.totalCostSaved || 0) + sessionMetrics.costSaved;
    stats.averageEfficiency = (stats.averageEfficiency + metrics.efficiency.overallScore) / 2;

    this.cache.set(`${projectId}:stats`, stats);
  }

  async verifyChecklist(projectId: string): Promise<{ success: boolean; warnings: string[] }> {
    const context = this.getContext(projectId);
    const warnings: string[] = [];
    let completed = 0;
    const total = 4;

    if (context.config.memoryBank) {
      completed++;
    } else {
      warnings.push('Memory bank not configured');
    }

    if (context.config.optimization.enabled) {
      completed++;
    } else {
      warnings.push('Optimization not enabled');
    }

    if (context.metrics) {
      completed++;
    } else {
      warnings.push('Metrics not initialized');
    }
    if (context.config.optimization.deduplication) {
      completed++;
    } else {
      warnings.push('Deduplication not enabled');
    }

    const percentage = (completed / total) * 100;

    if (!context.metrics.checklistStatus) {
      context.metrics.checklistStatus = {
        total,
        completed,
        inProgress: 0,
        pending: total - completed,
        documentation: !!context.config.memoryBank,
        metrics: !!context.metrics,
        context: true,
        health: percentage >= 75,
        timestamp: new Date().toISOString(),
        percentage,
      };
    } else {
      Object.assign(context.metrics.checklistStatus, {
        total,
        completed,
        inProgress: 0,
        pending: total - completed,
        documentation: !!context.config.memoryBank,
        metrics: !!context.metrics,
        context: true,
        health: percentage >= 75,
        timestamp: new Date().toISOString(),
        percentage,
      });
    }

    await this.updateContext(projectId);

    return { success: warnings.length === 0, warnings };
  }

  async updateContext(projectId: string): Promise<void> {
    const context = this.contexts.get(projectId);
    if (!context) {
      throw new AnalyticsError('Context not found', 'CONTEXT_NOT_FOUND');
    }

    // Update context timestamp and perform necessary updates
    context.metrics.timestamp = Date.now();
    
    // Verify checklist and update status
    const checklistResult = await this.verifyChecklist(projectId);
    if (!checklistResult.success) {
      console.warn('Update checklist warnings:', checklistResult.warnings);
    }

    // Update cache
    this.cache.set(`${projectId}:metrics`, context.metrics);
  }

  cleanup(projectId: string): void {
    this.addSessionEntry(projectId, {
      type: 'session_end',
      data: {
        status: 'completed',
        timestamp: Date.now()
      }
    });
    this.displayMetrics(projectId);

    this.contexts.delete(projectId);
    this.optimizationSettings.delete(projectId);
    this.cache.del(`${projectId}:stats`);
    this.cache.del(`${projectId}:metrics`);
    this.cache.del(`${projectId}:history`);
  }

  async findSimilarContext(projectId: string): Promise<Array<{
    id: string;
    similarity: number;
    matchingFeatures: string[];
  }>> {
    const targetContext = this.getContext(projectId);
    const results: Array<{
      id: string;
      similarity: number;
      matchingFeatures: string[];
    }> = [];

    for (const [otherId, otherContext] of this.contexts.entries()) {
      if (otherId === projectId) continue;

      const matchingFeatures: string[] = [];
      let similarityScore = 0;

      // Compare optimization settings
      if (otherContext.config.optimization?.enabled === targetContext.config.optimization?.enabled) {
        matchingFeatures.push('optimization_enabled');
        similarityScore += 0.2;
      }
      if (otherContext.config.optimization?.deduplication === targetContext.config.optimization?.deduplication) {
        matchingFeatures.push('deduplication');
        similarityScore += 0.2;
      }

      // Compare memory bank configuration
      if (otherContext.config.memoryBank === targetContext.config.memoryBank) {
        matchingFeatures.push('memory_bank');
        similarityScore += 0.2;
      }

      // Compare performance metrics
      const perfDiff = Math.abs(
        otherContext.metrics.performance.responseTime - targetContext.metrics.performance.responseTime
      ) / Math.max(targetContext.metrics.performance.responseTime, 1);
      if (perfDiff < 0.2) {
        matchingFeatures.push('performance');
        similarityScore += 0.2;
      }

      // Compare efficiency metrics
      const effDiff = Math.abs(
        otherContext.metrics.efficiency.overallScore - targetContext.metrics.efficiency.overallScore
      );
      if (effDiff < 0.2) {
        matchingFeatures.push('efficiency');
        similarityScore += 0.2;
      }

      if (similarityScore > 0.5) {
        results.push({
          id: otherId,
          similarity: similarityScore,
          matchingFeatures
        });
      }
    }

    // Sort by similarity score in descending order
    return results.sort((a, b) => b.similarity - a.similarity);
  }

  async initialize(projectId: string, config: ContextConfig): Promise<void> {
    if (this.contexts.has(projectId)) {
      throw new AnalyticsError('Context already exists', 'CONTEXT_EXISTS');
    }

    const defaultOptimization: OptimizationOptions = {
      maxTokens: 4096,
      tokenBuffer: 200,
      compressionRatio: 0.8,
      priorityTokens: ['code', 'error', 'context'],
      optimizationStrategy: 'smart'
    };

    const context: ProjectContext = {
      id: projectId,
      config: {
        ...config,
        optimization: {
          enabled: config.optimization?.enabled || false,
          deduplication: config.optimization?.deduplication || false
        }
      },
      metrics: {
        ...DEFAULT_METRICS,
        projectId
      }
    };

    this.contexts.set(projectId, context);
    this.optimizationSettings.set(projectId, defaultOptimization);
  }

  async getMetrics(projectId: string): Promise<MetricsStore> {
    const context = this.contexts.get(projectId);
    if (!context) {
      throw new AnalyticsError('Context not found', 'CONTEXT_NOT_FOUND');
    }
    return context.metrics;
  }

  async getProjectMetrics(projectId: string): Promise<ProjectMetrics> {
    const context = this.contexts.get(projectId);
    if (!context) {
      throw new AnalyticsError('Context not found', 'CONTEXT_NOT_FOUND');
    }

    return {
      id: context.id,
      name: context.id,
      memoryBank: context.config.memoryBank,
      optimization: {
        enabled: context.config.optimization?.enabled || false,
        deduplication: context.config.optimization?.deduplication || false
      },
      metrics: context.metrics,
      config: {
        id: context.id,
        name: context.id,
        contextConfig: context.config,
        resourceLimits: DEFAULT_RESOURCE_LIMITS
      },
      sessionCount: 0,
      checklistStatus: {
        completed: false,
        documentation: false,
        metrics: false,
        context: false,
        health: false,
        timestamp: Date.now(),
        items: []
      }
    };
  }

  async getAllProjectMetrics(): Promise<ProjectMetrics[]> {
    return Array.from(this.contexts.values()).map(context => ({
      id: context.id,
      name: context.id,
      memoryBank: context.config.memoryBank,
      optimization: {
        enabled: context.config.optimization?.enabled || false,
        deduplication: context.config.optimization?.deduplication || false
      },
      metrics: context.metrics,
      config: {
        id: context.id,
        name: context.id,
        contextConfig: context.config,
        resourceLimits: DEFAULT_RESOURCE_LIMITS
      },
      sessionCount: 0,
      checklistStatus: {
        completed: false,
        documentation: false,
        metrics: false,
        context: false,
        health: false,
        timestamp: Date.now(),
        items: []
      }
    }));
  }

  async getSystemStats(): Promise<SystemStats> {
    const contexts = Array.from(this.contexts.values());
    const totalTokensSaved = contexts.reduce(
      (sum, ctx) => sum + ctx.metrics.session.tokensSaved,
      0
    );
    const totalCostSaved = contexts.reduce(
      (sum, ctx) => sum + ctx.metrics.session.costSaved,
      0
    );
    const averageEfficiency = contexts.reduce(
      (sum, ctx) => sum + ctx.metrics.efficiency.overallScore,
      0
    ) / Math.max(contexts.length, 1);

    const healthScore = contexts.reduce(
      (sum, ctx) => sum + (ctx.metrics.checklistStatus?.health ? 1 : 0),
      0
    ) / Math.max(contexts.length, 1) * 100;

    return {
      activeContexts: this.contexts.size,
      totalMetrics: this.metrics.length,
      lastUpdate: Date.now(),
      averageEfficiency,
      totalTokensSaved,
      totalCostSaved,
      healthScore
    };
  }

  async updateSystemStats(updates: Partial<SystemStats>): Promise<void> {
    const currentStats = await this.getSystemStats();
    const updatedStats: SystemStats = {
      ...currentStats,
      ...updates,
      lastUpdate: Date.now()
    };

    // Cache the updated system stats
    this.cache.set('system:stats', updatedStats);

    // Add to metrics history
    this.metrics.push({
      projectId: 'system',
      metrics: {
        performance: [],
        efficiency: [],
        optimization: []
      },
      performance: {
        responseTime: 0,
        resources: {
          cpu: { percentage: 0 },
          memory: { percentage: 0 }
        },
        throughput: 0
      },
      efficiency: {
        cacheHitRate: 0,
        contextReuse: 0,
        tokenOptimization: 0,
        overallScore: updatedStats.averageEfficiency || 0
      },
      session: {
        tokensSaved: updatedStats.totalTokensSaved || 0,
        costSaved: updatedStats.totalCostSaved || 0,
        efficiency: updatedStats.averageEfficiency || 0,
        duration: 0,
        details: []
      },
      history: [],
      timestamp: Date.now()
    });

    // Trim metrics history if it gets too large
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  async record(projectId: string, sessionId: string, metrics: Partial<MetricsStore>): Promise<void> {
    const context = this.contexts.get(projectId);
    if (!context) {
      throw new AnalyticsError('Context not found', 'CONTEXT_NOT_FOUND');
    }

    // Update metrics for the context
    context.metrics = {
      ...context.metrics,
      ...metrics,
      timestamp: Date.now()
    };
  }
}
