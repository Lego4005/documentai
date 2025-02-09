export class AnalyticsError extends Error {
  constructor(
    message: string,
    public code: string,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AnalyticsError';
  }
}

export interface CostMetrics {
  tokensSaved: number;
  costSaved: number;
  originalCost: number;
  optimizedCost: number;
}

export interface VectorMetadata {
  project_id: string;
  contextType: string;
  timestamp: number;
  [key: string]: unknown;
}

export interface VectorSearchResult {
  id: string;
  content: string;
  similarity: number;
  metadata: VectorMetadata;
  project_id: string;
}

export interface OptimizationResult {
  optimized: string;
  metrics: {
    originalTokens: number;
    optimizedTokens: number;
    reductionPercent: number;
    compressionRatio: number;
    cost: CostMetrics;
  };
}

export interface PerformanceMetrics {
  responseTime: number;
  cpuUsage: number;
  memoryUsage: number;
  throughput: number;
  timestamp: number;
}

export interface EfficiencyMetrics {
  cacheHitRate: number;
  contextReuse: number;
  tokenOptimization: number;
  overallScore: number;
  timestamp: number;
}

export interface OptimizationOptions {
  maxTokens: number;
  tokenBuffer: number;
  compressionRatio: number;
  priorityTokens: string[];
  optimizationStrategy: 'smart' | 'aggressive' | 'conservative';
}

export interface ContextConfig {
  maxTokens: number;
  retentionPeriod: number;
  optimizationOptions: OptimizationOptions;
  memoryBank: string;
  optimization: {
    enabled: boolean;
    deduplication: boolean;
    options?: {
      progressiveLoading: boolean;
      chunkSize: number;
      similarity: number;
    };
  };
  retrieval: {
    strategy: string;
    limit: number;
    chunkSize: number;
    overlap: number;
  };
  vectorStore?: {
    enabled: boolean;
    dimensions: number;
    similarity: 'cosine' | 'euclidean' | 'dot';
  };
}

export interface ProjectConfig {
  id: string;
  name: string;
  contextConfig: ContextConfig;
  resourceLimits: ResourceLimits;
}

export interface ResourceLimits {
  maxMemory: number;
  maxCPU: number;
  maxStorage: number;
  maxConcurrentOperations: number;
}

export const DEFAULT_RESOURCE_LIMITS: ResourceLimits = {
  maxMemory: 1024 * 1024 * 1024, // 1GB
  maxCPU: 100, // 100%
  maxStorage: 5 * 1024 * 1024 * 1024, // 5GB
  maxConcurrentOperations: 10
};

export interface ResourceAllocation {
  allocated: {
    memory: number;
    cpu: number;
    storage: number;
    operations: number;
  };
  available: {
    memory: number;
    cpu: number;
    storage: number;
    operations: number;
  };
}

export interface MetricsStore {
  projectId: string;
  metrics: {
    performance: PerformanceMetrics[];
    efficiency: EfficiencyMetrics[];
    optimization: OptimizationResult[];
  };
  performance: {
    responseTime: number;
    resources: {
      cpu: { percentage: number };
      memory: { percentage: number };
    };
    throughput: number;
  };
  efficiency: {
    cacheHitRate: number;
    contextReuse: number;
    tokenOptimization: number;
    overallScore: number;
  };
  session: {
    tokensSaved: number;
    costSaved: number;
    efficiency: number;
    duration: number;
    details: Array<Record<string, unknown>>;
  };
  history: Array<{
    timestamp: number;
    type: string;
    data: Record<string, unknown>;
  }>;
  checklistStatus?: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    documentation: boolean;
    metrics: boolean;
    context: boolean;
    health: boolean;
    timestamp: string;
    percentage: number;
  };
  timestamp: number;
}

export interface ProjectMetrics {
  id: string;
  name: string;
  memoryBank: string;
  optimization: {
    enabled: boolean;
    deduplication: boolean;
  };
  metrics: MetricsStore;
  config: ProjectConfig;
  sessionCount: number;
  checklistStatus: ChecklistStatus;
}

export interface TokenMetrics {
  input: number;
  output: number;
  total: number;
  saved: number;
  cost: CostMetrics;
}

export interface ProjectContext {
  id: string;
  config: ContextConfig;
  metrics: MetricsStore;
}

export interface Queue<T> {
  enqueue(item: T): void;
  dequeue(): T | undefined;
  peek(): T | undefined;
  size(): number;
  isEmpty(): boolean;
  clear(): void;
}

export interface PatternRequest {
  id: string;
  pattern: Pattern;
  priority: number;
  timestamp: number;
}

export interface Pattern {
  name: string;
  description: string;
  steps: Step[];
  cache?: Cache;
}

export interface Cache {
  enabled: boolean;
  ttl: number;
  maxSize: number;
}

export interface Step {
  id: string;
  action: string;
  params: Record<string, unknown>;
  next?: string[];
}

export interface ChecklistStatus {
  completed: boolean;
  documentation: boolean;
  metrics: boolean;
  context: boolean;
  health: boolean;
  timestamp: number;
  items: {
    id: string;
    description: string;
    completed: boolean;
    timestamp?: number;
  }[];
}

export const DEFAULT_METRICS: MetricsStore = {
  projectId: '',
  metrics: {
    performance: [],
    efficiency: [],
    optimization: []
  },
  performance: {
    responseTime: 0,
    resources: {
      cpu: {
        percentage: 0
      },
      memory: {
        percentage: 0
      }
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

export interface SystemStats {
  activeContexts: number;
  totalMetrics: number;
  lastUpdate: number;
  averageEfficiency?: number;
  totalTokensSaved?: number;
  totalCostSaved?: number;
  healthScore?: number;
}