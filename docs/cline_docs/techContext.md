# Technical Context
Version: 1.0.6
Last Updated: 2025-02-02 00:45

## Table of Contents
- [Technical Context](#technical-context)
  - [Table of Contents](#table-of-contents)
  - [Technology Stack](#technology-stack)
  - [Development Environment](#development-environment)
  - [Dependencies](#dependencies)
  - [Configuration](#configuration)
  - [Database Schema](#database-schema)
  - [API Integration](#api-integration)
  - [Performance Configuration](#performance-configuration)
  - [Current Technical Status](#current-technical-status)
  - [Technical Constraints](#technical-constraints)
  - [Monitoring Points](#monitoring-points)
  - [Technical Debt](#technical-debt)
  - [Next Technical Steps](#next-technical-steps)

## Technology Stack
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with pgvector
- **Vector Store**: Supabase
- **Embeddings**: OpenAI API
- **Testing**: Jest
- **Documentation**: Markdown
- **Version Control**: Git

## Development Environment
```bash
# Required Node.js version
node >= 16.x

# TypeScript configuration
"compilerOptions": {
  "target": "ES2020",
  "module": "ES2022",
  "moduleResolution": "node16",
  "strict": true
}

# Environment variables
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key
```

## Dependencies
```json
{
  "@modelcontextprotocol/sdk": "latest",
  "dotenv": "^16.x",
  "typescript": "^5.x",
  "jest": "^29.x",
  "@types/node": "^18.x"
}
```

## Configuration
```typescript
// Server Configuration
interface ServerConfig {
  maxProjects: number;
  resourceLimits: {
    maxMemory: number;    // 2GB
    maxCpu: number;       // 2 cores
    maxStorage: number;   // 10GB
  };
  optimization: {
    enabled: boolean;
    aggressive: boolean;
    targetEfficiency: number;
  };
}

// Cross-Project Learning Config
interface CrossProjectConfig {
  enabled: boolean;
  prioritizeCurrentProject: boolean;
  minSimilarityThreshold: number;
  maxGlobalResults: number;
  learningRate: number;
}

// Cache Configuration
interface CacheConfig {
  maxSize: number;
  ttl: number;
  strategy: 'LRU' | 'LFU';
}
```

## Database Schema
```sql
-- Vector store table
CREATE TABLE context_embeddings (
  id bigint generated always as identity primary key,
  project_id text not null,
  content text not null,
  embedding vector(1536) not null,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for cross-project search
CREATE INDEX context_embeddings_project_id_idx 
ON context_embeddings (project_id);

CREATE INDEX context_embeddings_embedding_idx 
ON context_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

## API Integration
```typescript
// OpenAI Configuration
interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
  temperature: number;
}

// Supabase Configuration
interface SupabaseConfig {
  url: string;
  key: string;
  schema: string;
  timeout: number;
}

// Vector Search Result
interface VectorSearchResult {
  id: number;
  content: string;
  similarity: number;
  metadata: VectorMetadata;
  project_id: string;
}
```

## Performance Configuration
```typescript
// Memory Bank Configuration
const MEMORY_BANK_CONFIG = {
  maxPatternQueueSize: 1000,
  batchSize: 10,
  cacheTTL: 3600000, // 1 hour
  maxCacheSize: 10000,
  vectorSearchProbes: 10,
  similarityThreshold: 0.8,
  crossProjectEnabled: true,
  prioritizeCurrentProject: true,
  maxGlobalResults: 5
};

// Resource Limits
const RESOURCE_LIMITS = {
  maxMemory: 2 * 1024 * 1024 * 1024, // 2GB
  maxCpu: 2,
  maxStorage: 10 * 1024 * 1024 * 1024 // 10GB
};

// Cross-Project Settings
const CROSS_PROJECT_CONFIG = {
  enabled: true,
  prioritizeCurrentProject: true,
  minSimilarityThreshold: 0.7,
  maxGlobalResults: 5,
  learningRate: 0.1
};
```

## Current Technical Status
✅ TypeScript Configuration
✅ Database Schema
✅ Vector Store Setup
✅ MCP Integration
✅ Cross-Project Learning
⚠️ Cache Tuning
⚠️ Performance Optimization

## Technical Constraints
1. Memory Limits: 2GB per instance
2. CPU Usage: 2 cores maximum
3. Storage: 10GB per project
4. Vector Dimensions: 1536
5. Cache TTL: 1 hour default
6. Batch Size: 10 patterns
7. Global Results: 5 per query

## Monitoring Points
1. Memory Usage
2. CPU Utilization
3. Cache Hit Rate
4. Vector Search Performance
5. Pattern Processing Time
6. Token Optimization Rate
7. Cross-Project Learning Rate

## Technical Debt
1. Cache parameter tuning
2. Vector index optimization
3. Pattern batch size testing
4. Resource limit validation
5. Performance profiling
6. Cross-project metrics

## Next Technical Steps
1. Deploy to new project
2. Monitor cross-project learning
3. Tune similarity thresholds
4. Optimize cache settings
5. Track learning effectiveness