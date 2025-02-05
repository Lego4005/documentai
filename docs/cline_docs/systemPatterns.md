# System Patterns
Version: 1.0.6
Last Updated: 2025-02-02 00:45

## Cross-Project Learning Patterns

### Vector Search
```sql
-- Function for cross-project similarity search
CREATE OR REPLACE FUNCTION match_context_embeddings(
    match_count integer,
    match_threshold float,
    p_project_id text,
    query_embedding vector(1536)
) RETURNS TABLE (
    id bigint,
    content text,
    similarity float,
    metadata jsonb,
    project_id text
) AS $$
BEGIN
    -- First get matches from specific project
    CREATE TEMP TABLE project_matches AS
    SELECT
        ce.id,
        ce.content,
        1 - (ce.embedding <=> query_embedding) as similarity,
        ce.metadata,
        ce.project_id
    FROM
        public.context_embeddings ce
    WHERE
        ce.project_id = p_project_id
        AND 1 - (ce.embedding <=> query_embedding) > match_threshold;

    -- Then get matches from all projects
    CREATE TEMP TABLE global_matches AS
    SELECT
        ce.id,
        ce.content,
        1 - (ce.embedding <=> query_embedding) as similarity,
        ce.metadata,
        ce.project_id
    FROM
        public.context_embeddings ce
    WHERE
        ce.project_id != p_project_id
        AND 1 - (ce.embedding <=> query_embedding) > match_threshold;

    -- Combine results with priority
    RETURN QUERY
    SELECT * FROM project_matches
    UNION ALL
    SELECT * FROM global_matches
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$ LANGUAGE plpgsql;
```

### Pattern Management
```typescript
// Cross-project pattern handling
class PatternManager {
  private queue: Queue<PatternRequest>;
  private cache: Cache<Pattern>;
  
  async queuePattern(request: PatternRequest): Promise<void>;
  private async processQueue(): Promise<void>;
  private async processPatternBatch(patterns: PatternRequest[]): Promise<void>;
}

// Pattern tracking with source
interface Pattern {
  id: string;
  type: 'navigation' | 'interaction' | 'form';
  project_id: string;
  content: string;
  similarity: number;
  metadata: VectorMetadata;
}
```

### Project Isolation
```typescript
// Project-based metrics
interface MetricsStore {
  session: {
    tokensSaved: number;
    costSaved: number;
  };
  efficiency: {
    cacheHitRate: number;
    contextReuse: number;
    tokenOptimization: number;
    overallScore: number;
  };
}

// Cross-project recommendations
async function generateRecommendations(
  metrics: MetricsStore,
  projectId: string,
  content: string
): Promise<string[]> {
  // Project-specific patterns
  const projectPatterns = await findPatterns(projectId);
  
  // Global learning patterns
  const globalPatterns = await findCrossProjectPatterns();
  
  return combineRecommendations(projectPatterns, globalPatterns);
}
```

## Memory Bank Patterns

### Data Organization
```typescript
// Memory bank structure
interface MemoryBank {
  patterns: Map<string, Pattern>;
  vectorStore: VectorStore;
  cache: Cache;
}

// Vector store integration
interface VectorStore {
  findSimilarContext(
    projectId: string,
    content: string,
    limit?: number,
    threshold?: number
  ): Promise<VectorSearchResult[]>;
}
```

### Caching System
```typescript
// Multi-level cache
interface Cache<T> {
  get(key: string): Promise<T | null>;
  set(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
}

// Cache configuration
interface CacheConfig {
  maxSize: number;
  ttl: number;
  strategy: 'LRU' | 'LFU';
}
```

## Usage Patterns

### Cross-Project Learning
1. Search within current project first
2. Extend search to all projects
3. Combine and rank results
4. Track pattern sources
5. Update recommendations

### Memory Bank Updates
1. Load current metrics
2. Update documentation files
3. Store new metrics
4. Track changes with timestamps
5. Maintain cross-references

### Project Management
1. Initialize project if needed
2. Load project metrics
3. Process patterns async
4. Update vector store
5. Track performance

### Error Handling
1. Queue processing errors
2. Cache misses
3. Vector store failures
4. Metric collection issues
5. Project initialization problems

## Current Status
✅ Cross-project learning implemented
✅ Pattern system updated
✅ Vector store enhanced
✅ Documentation current
⚠️ First-time setup needed
⚠️ Metrics collection pending

## Next Steps
1. Deploy to new project
2. Initialize metrics system
3. Start pattern collection
4. Monitor learning effectiveness
5. Tune performance settings

## Implementation Notes
- Use async/await for operations
- Maintain project isolation
- Track all metrics
- Handle errors gracefully
- Document changes
- Cross-reference updates