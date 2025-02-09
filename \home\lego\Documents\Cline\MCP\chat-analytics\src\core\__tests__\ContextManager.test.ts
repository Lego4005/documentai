import { ContextManager } from '../ContextManager.js';
import { ContextConfig, MetricsStore, ProjectMetrics } from '../../types/index.js';
import NodeCache from 'node-cache';

jest.mock('node-cache'); // Mock NodeCache

describe('ContextManager', () => {
  let contextManager: ContextManager;
  let mockCache: jest.Mocked<NodeCache>;

  const createTestConfig = (): ContextConfig => ({
    maxTokens: 4096,
    retentionPeriod: 3600,
    optimizationOptions: {
      maxTokens: 4096,
      tokenBuffer: 200,
      compressionRatio: 0.8,
      priorityTokens: ['code', 'error', 'context'],
      optimizationStrategy: 'smart'
    },
    memoryBank: 'test-memory-bank',
    optimization: {
      enabled: true,
      deduplication: true,
      options: {
        progressiveLoading: true,
        chunkSize: 1024,
        similarity: 0.8
      }
    },
    retrieval: {
      strategy: 'semantic',
      limit: 10,
      chunkSize: 512,
      overlap: 50
    },
    vectorStore: {
      enabled: true,
      dimensions: 1536,
      similarity: 'cosine'
    }
  });

  beforeEach(() => {
    mockCache = new NodeCache() as jest.Mocked<NodeCache>;
    contextManager = new ContextManager();
    //  we need to set the cache mock implementation
    (contextManager as any).cache = mockCache;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize a new context', async () => {
      const projectId = 'test-project';
      const config = createTestConfig();

      await contextManager.initialize(projectId, config);
      const metrics = await contextManager.getMetrics(projectId);
      expect(metrics).toBeDefined();
      expect(metrics.projectId).toBe(projectId);
    });

    it('should throw error if context already exists', async () => {
      const projectId = 'test-project';
      const config = createTestConfig();

      await contextManager.initialize(projectId, config);
      await expect(contextManager.initialize(projectId, config)).rejects.toThrow();
    });
  });

  describe('createContext', () => {
    it('should create a new context', async () => {
      const projectId = 'test-project';
      const config = createTestConfig();
      await contextManager.createContext(projectId, config);

      const context = contextManager.getContext(projectId);
      expect(context).toBeDefined();
      expect(mockCache.set).toHaveBeenCalledWith(`${projectId}:metrics`, expect.any(Object));
    });

    it('should throw an error if context already exists', async () => {
      const projectId = 'test-project';
      const config = createTestConfig();
      await contextManager.createContext(projectId, config);

      await expect(contextManager.createContext(projectId, config)).rejects.toThrow();
    });
  });

  describe('getContext', () => {
    it('should return the context if it exists', async () => {
      const projectId = 'test-project';
      const config = createTestConfig();
      await contextManager.createContext(projectId, config);

      const context = contextManager.getContext(projectId);
      expect(context).toBeDefined();
      expect(context.config).toEqual(config);
    });

    it('should throw an error if context does not exist', () => {
      const projectId = 'nonexistent-project';
      expect(() => contextManager.getContext(projectId)).toThrow();
    });
  });

  describe('updateMetrics', () => {
    it('should update the metrics store for a project', async () => {
      const projectId = 'test-project';
      const config = createTestConfig();
      await contextManager.createContext(projectId, config);

      const updatedMetrics: Partial<MetricsStore> = {
        performance: {
          responseTime: 100,
          resources: {
            cpu: { percentage: 50 },
            memory: { percentage: 60 }
          },
          throughput: 100
        },
        efficiency: {
          cacheHitRate: 0.8,
          contextReuse: 0.7,
          tokenOptimization: 0.9,
          overallScore: 0.8
        },
        session: {
          tokensSaved: 100,
          costSaved: 0.2,
          efficiency: 0.8,
          duration: 60,
          details: []
        }
      };

      await contextManager.updateMetrics(projectId, updatedMetrics);
      const metrics = await contextManager.getMetrics(projectId);
      expect(metrics.performance.responseTime).toBe(100);
      expect(metrics.efficiency.cacheHitRate).toBe(0.8);
    });

    it('should throw an error if context does not exist', async () => {
      const projectId = 'nonexistent-project';
      const updatedMetrics: Partial<MetricsStore> = {
        performance: {
          responseTime: 100,
          resources: {
            cpu: { percentage: 50 },
            memory: { percentage: 60 }
          },
          throughput: 100
        }
      };

      await expect(contextManager.updateMetrics(projectId, updatedMetrics)).rejects.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should remove a context and its associated data', async () => {
      const projectId = 'test-project';
      const config = createTestConfig();
      await contextManager.createContext(projectId, config);

      contextManager.cleanup(projectId);

      expect(() => contextManager.getContext(projectId)).toThrow();
      expect(mockCache.del).toHaveBeenCalledWith(`${projectId}:stats`);
      expect(mockCache.del).toHaveBeenCalledWith(`${projectId}:metrics`);
      expect(mockCache.del).toHaveBeenCalledWith(`${projectId}:history`);
    });
  });
}); 