#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

/**
 * Default database schema
 */
const DEFAULT_SCHEMA = `
-- Enable RLS
alter table auth.users enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  username text unique,
  full_name text,
  avatar_url text,
  website text,
  constraint username_length check (char_length(username) >= 3)
);

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create public profiles policy
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

-- Create policy to allow users to update own profile
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Create storage bucket for avatars
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Create storage policy for avatars
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Anyone can upload an avatar."
  on storage.objects for insert
  with check ( bucket_id = 'avatars' );

-- Function to handle new user creation
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (new.id, new.raw_user_meta_data->>'username');
  return new;
end;
$$;

-- Trigger for new user creation
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Enable realtime
alter publication supabase_realtime add table profiles;
`;

/**
 * Default Edge Function for user management
 */
const USER_MANAGEMENT_FUNCTION = `
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: { user } } = await supabase.auth.getUser(
      req.headers.get('Authorization')?.replace('Bearer ', '')
    )

    if (!user) throw new Error('Not authenticated')

    const { action } = await req.json()

    switch (action) {
      case 'get_profile':
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        return new Response(JSON.stringify({ profile }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

      default:
        throw new Error('Unknown action')
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
`;

/**
 * Initialize Supabase project
 */
async function initSupabase(projectPath) {
  try {
    // Check if Supabase CLI is installed
    try {
      execSync('supabase --version');
    } catch {
      console.log('Installing Supabase CLI...');
      execSync('npm install -g supabase');
    }

    // Initialize Supabase
    console.log('Initializing Supabase...');
    execSync('supabase init', { cwd: projectPath });

    // Create default schema file
    const schemaPath = path.join(projectPath, 'supabase', 'migrations', '0_init.sql');
    await fs.mkdir(path.dirname(schemaPath), { recursive: true });
    await fs.writeFile(schemaPath, DEFAULT_SCHEMA);

    // Create Edge Function
    const functionPath = path.join(projectPath, 'supabase', 'functions', 'user-management', 'index.ts');
    await fs.mkdir(path.dirname(functionPath), { recursive: true });
    await fs.writeFile(functionPath, USER_MANAGEMENT_FUNCTION);

    // Create types directory
    await fs.mkdir(path.join(projectPath, 'src', 'types'), { recursive: true });

    // Add Supabase scripts to package.json
    const packageJsonPath = path.join(projectPath, 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
    
    packageJson.scripts = {
      ...packageJson.scripts,
      'supabase:start': 'supabase start',
      'supabase:stop': 'supabase stop',
      'supabase:types': 'supabase gen types typescript --local > src/types/database.ts',
      'db:reset': 'supabase db reset',
      'db:push': 'supabase db push',
    };

    await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));

    // Create README section for Supabase
    const supabaseReadme = `
## Supabase Setup

1. Install Supabase CLI:
\`\`\`bash
npm install -g supabase
\`\`\`

2. Start local development:
\`\`\`bash
npm run supabase:start
\`\`\`

3. Generate types:
\`\`\`bash
npm run supabase:types
\`\`\`

4. Create new migration:
\`\`\`bash
supabase migration new <migration-name>
\`\`\`

5. Reset database:
\`\`\`bash
npm run db:reset
\`\`\`

### Default Schema

- Profiles table with RLS
- Avatar storage bucket
- User management functions
- Realtime enabled
- Auth triggers

### Edge Functions

- \`user-management\`: Handle user-related operations

### Environment Variables

Add to your \`.env\`:

\`\`\`bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
\`\`\`
`;

    const readmePath = path.join(projectPath, 'README.md');
    const readme = await fs.readFile(readmePath, 'utf8');
    await fs.writeFile(readmePath, readme + supabaseReadme);

    console.log('✓ Supabase initialized successfully');
    
  } catch (error) {
    console.error('Failed to initialize Supabase:', error);
    throw error;
  }
}

export const setupSupabase = {
  init: initSupabase,
  DEFAULT_SCHEMA,
  USER_MANAGEMENT_FUNCTION
};