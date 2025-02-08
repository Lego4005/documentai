# Project Technology Stack Guide

## Overview

This guide outlines our technology stack with two development approaches:
1. Local Development: Run Supabase locally for development
2. Direct Development: Work directly with production database

## Core Stack

### Backend (Supabase)
```json
{
  "platform": "Supabase",
  "features": {
    "auth": "Built-in authentication with multiple providers",
    "database": "PostgreSQL with real-time subscriptions",
    "storage": "File storage with security policies",
    "edge": "Serverless Edge Functions",
    "vectors": "Vector similarity search"
  },
  "developmentModes": {
    "local": {
      "benefits": [
        "Local development environment",
        "Migration-based changes",
        "Offline capability",
        "Test data isolation"
      ],
      "requirements": [
        "Docker installed",
        "Supabase CLI",
        "Local ports available"
      ]
    },
    "direct": {
      "benefits": [
        "No local setup needed",
        "SQL queries via chat",
        "Immediate feedback",
        "Real production data"
      ],
      "requirements": [
        "Supabase project",
        "SQL Editor access",
        "Careful schema changes"
      ]
    }
  }
}
```

### Frontend (Flexible)
```json
{
  "base": "React + TypeScript",
  "buildTools": {
    "Vite": {
      "bestFor": [
        "Quick prototypes",
        "Small to medium apps",
        "Modern browser support",
        "Fast development experience"
      ],
      "limitations": [
        "Large monorepos",
        "Complex build configurations",
        "Legacy browser support"
      ]
    },
    "Next.js": {
      "bestFor": [
        "SSR requirements",
        "SEO critical",
        "Full-stack applications",
        "API routes needed"
      ],
      "limitations": [
        "Simple SPAs",
        "Custom server setups",
        "Non-React projects"
      ]
    },
    "Create React App": {
      "bestFor": [
        "Traditional SPAs",
        "Stable, proven setup",
        "Complex configurations",
        "Enterprise requirements"
      ],
      "limitations": [
        "Build performance",
        "Bundle size optimization",
        "Custom webpack configs"
      ]
    }
  }
}
```

## Project Structure

### Local Development Mode
```
project/
├── src/
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts (auth, theme)
│   ├── hooks/         # Custom hooks (real-time, forms)
│   ├── lib/          # Utilities and configurations
│   ├── pages/        # Route components
│   └── types/        # TypeScript types
├── supabase/
│   ├── migrations/    # Database migrations
│   └── functions/     # Edge Functions
└── tests/            # Test files
```

### Direct Development Mode
```
project/
├── src/
│   ├── components/    # Reusable UI components
│   ├── contexts/      # React contexts (auth, theme)
│   ├── hooks/         # Custom hooks (real-time, forms)
│   ├── lib/          # Utilities and configurations
│   ├── pages/        # Route components
│   └── types/        # TypeScript types
└── tests/            # Test files
```

## Database Management

### Local Development
- Migration-based changes
- Version controlled schema
- Local testing
- Planned deployments

### Direct Development
- SQL queries via chat
- Immediate changes
- Production testing
- Quick iterations

## Development Workflow

### Local Development
1. Create migration files
2. Test locally
3. Push to production
4. Generate types

### Direct Development
1. Get SQL from chat
2. Run in SQL Editor
3. Test changes
4. Update types

## Best Practices

### Both Modes
1. TypeScript Usage:
   - Strict mode enabled
   - Proper type definitions
   - Type safety enforced

2. State Management:
   - React Query for server state
   - Context for app state
   - Local state when possible

3. Performance:
   - Code splitting
   - Lazy loading
   - Proper caching

4. Testing:
   - Unit tests
   - Integration tests
   - E2E when needed

### Local Development Specific
1. Database:
   - Clear migration names
   - Reversible changes
   - Test migrations locally

2. Schema:
   - Version control
   - Migration dependencies
   - Rollback plans

### Direct Development Specific
1. Database:
   - Save SQL queries
   - Document changes
   - Test thoroughly

2. Schema:
   - Backup before changes
   - Small iterations
   - Verify constraints

## Security

### Both Modes
1. Authentication:
   - Proper provider setup
   - Secure session handling
   - Token management

2. Database:
   - RLS policies
   - Input validation
   - Query optimization

3. Storage:
   - Bucket policies
   - File validation
   - Access control

## Deployment

### Local Development
1. Frontend:
   - Build assets
   - Deploy to hosting
   - Update environment

2. Database:
   - Review migrations
   - Apply to production
   - Verify changes

### Direct Development
1. Frontend:
   - Build assets
   - Deploy to hosting
   - Update environment

2. Database:
   - Already in production
   - Monitor performance
   - Backup regularly

The system adapts to your preferred development style while maintaining best practices and security standards.