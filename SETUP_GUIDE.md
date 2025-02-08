# Project Setup Guide

## Development Modes

Choose your preferred development mode:

### Local Development Mode
- Run Supabase locally via Docker
- Use migration files for schema changes
- Work offline when needed
- Best for: Development teams, complex schemas

### Direct Development Mode
- Work directly with production database
- Get SQL queries through chat
- No local setup required
- Best for: Quick prototypes, solo developers

## Prerequisites

Before starting project generation, you'll need:

1. Supabase Project Setup:
   - Go to https://supabase.com
   - Create new project
   - Get project credentials:
     ```
     Project URL: [Settings -> API -> Project URL]
     Anon Key: [Settings -> API -> anon/public]
     Service Role Key: [Settings -> API -> service_role]
     ```

2. Authentication Setup:
   - Go to [Authentication -> Providers]
   - Enable Email auth (minimum)
   - Optional: Configure additional providers
     - Google
     - GitHub
     - etc.

3. For Local Development Only:
   - Docker installed and running
   - Supabase CLI installed (`npm install -g supabase`)

## Required Information

Have these ready before running the generator:

```bash
# Supabase Credentials
SUPABASE_URL=your_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Auth Providers (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## Project Generation

1. Run the generator:
   ```bash
   node create-project.mjs
   ```

2. Choose Development Mode:
   - LOCAL: For local Supabase development
   - DIRECT: For direct production development

3. You'll be prompted for:
   - Project name and description
   - Project size and features
   - Supabase credentials
   - Auth provider credentials (if selected)

## Post-Setup Tasks

### For Local Development:

1. Database Setup:
   ```bash
   # Start local Supabase
   npm run supabase:start

   # Push schema to production when ready
   npm run db:push
   ```

2. Environment:
   ```bash
   # Copy .env.example
   cp .env.example .env

   # Update with your credentials
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

3. Create Migrations:
   ```bash
   # Create new migration
   supabase migration new my_change

   # Apply migration
   npm run db:push
   ```

### For Direct Development:

1. Environment:
   ```bash
   # Copy .env.example
   cp .env.example .env

   # Update with production credentials
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

2. Database Changes:
   - Copy SQL queries from chat
   - Run in Supabase SQL Editor
   - Verify changes in Dashboard
   - Save queries for reference

3. Schema Updates:
   - SQL queries will be provided in chat
   - Run queries in order given
   - Test changes immediately

## Auth Provider Setup

### For Both Modes:
1. Add callback URLs in provider dashboards:
   ```
   http://localhost:3000/auth/callback
   https://your-production-url/auth/callback
   ```

2. Configure CORS in Supabase dashboard:
   ```json
   {
     "origins": ["http://localhost:3000", "https://your-production-url"],
     "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
     "headers": ["Content-Type", "Authorization"]
   }
   ```

## Development Workflow

### Local Development:
1. Start Environment:
   ```bash
   npm run supabase:start
   npm run dev
   ```

2. Make Changes:
   - Create migrations
   - Test locally
   - Push to production

3. Type Generation:
   ```bash
   npm run supabase:types
   ```

### Direct Development:
1. Start Frontend:
   ```bash
   npm run dev
   ```

2. Make Changes:
   - Get SQL from chat
   - Run in SQL Editor
   - Test immediately

3. Type Generation:
   - Run after schema changes
   - Update from production

## Production Deployment

### For Both Modes:
1. Update Environment:
   - Add production URLs
   - Update callback URLs
   - Configure CORS

2. Deploy Frontend:
   ```bash
   npm run build
   # Deploy to your hosting
   ```

### Local Development Only:
3. Deploy Database:
   ```bash
   npm run db:push
   ```

## Security Checklist

- [ ] RLS policies configured
- [ ] Auth providers set up
- [ ] Storage policies defined
- [ ] Environment variables secured
- [ ] CORS configured
- [ ] File upload limits set
- [ ] API keys restricted

## Troubleshooting

### Local Development:
1. Supabase Issues:
   - Check Docker status
   - Verify ports available
   - Check migration order

2. Database Sync:
   - Verify credentials
   - Check migration status
   - Test local connection

### Direct Development:
1. SQL Errors:
   - Check syntax
   - Verify permissions
   - Test in SQL Editor

2. Schema Changes:
   - Run queries in order
   - Verify RLS policies
   - Check foreign keys

Keep this information secure and never commit sensitive credentials to version control.