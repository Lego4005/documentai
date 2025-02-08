#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { projectAnalyzer } from './project-analyzer.mjs';
import { setupSupabase } from './setup-supabase.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Project templates for different build tools
 */
const PROJECT_TEMPLATES = {
  VITE: {
    create: (name) => `npm create vite@latest ${name} -- --template react-ts`,
    deps: [
      '@supabase/supabase-js',
      '@supabase/auth-ui-react',
      '@supabase/auth-ui-shared',
      'react-router-dom',
      'react-query'
    ]
  },
  NEXT: {
    create: (name) => `npx create-next-app@latest ${name} --typescript --tailwind --eslint`,
    deps: [
      '@supabase/supabase-js',
      '@supabase/auth-ui-react',
      '@supabase/auth-ui-shared',
      'react-query'
    ]
  },
  CRA: {
    create: (name) => `npx create-react-app ${name} --template typescript`,
    deps: [
      '@supabase/supabase-js',
      '@supabase/auth-ui-react',
      '@supabase/auth-ui-shared',
      'react-router-dom',
      'react-query'
    ]
  }
};

/**
 * Set up project structure
 */
async function setupProject(projectPath, projectInfo) {
  // Create src directories
  const directories = [
    'src/components',
    'src/contexts',
    'src/hooks',
    'src/lib',
    'src/pages',
    'src/types',
    'src/utils'
  ];

  for (const dir of directories) {
    await fs.mkdir(path.join(projectPath, dir), { recursive: true });
  }

  // Create base files
  const baseFiles = {
    'src/lib/supabase.ts': `import { createClient } from '@supabase/supabase-js'
import { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)`,

    'src/contexts/AuthContext.tsx': `import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

const AuthContext = createContext<{
  user: User | null
  loading: boolean
}>({
  user: null,
  loading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)`,

    'src/hooks/useRealtimeData.ts': `import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useRealtimeData<T>(
  table: string,
  query?: { column: string; value: any }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let queryBuilder = supabase
      .from(table)
      .select('*')

    if (query) {
      queryBuilder = queryBuilder.eq(query.column, query.value)
    }

    const fetchData = async () => {
      try {
        const { data, error } = await queryBuilder
        if (error) throw error
        setData(data)
      } catch (e) {
        setError(e as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    const subscription = supabase
      .channel(\`\${table}_changes\`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: table
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setData(prev => [...prev, payload.new])
          } else if (payload.eventType === 'DELETE') {
            setData(prev => prev.filter(item => item.id !== payload.old.id))
          } else if (payload.eventType === 'UPDATE') {
            setData(prev => prev.map(item => 
              item.id === payload.new.id ? payload.new : item
            ))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [table, query?.column, query?.value])

  return { data, loading, error }
}`,

    '.env': `VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`,

    '.env.example': `VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key`
  };

  for (const [file, content] of Object.entries(baseFiles)) {
    await fs.writeFile(path.join(projectPath, file), content);
  }
}

/**
 * Generate project
 */
async function generateProject(projectInfo) {
  try {
    // Analyze project requirements
    const analysis = await projectAnalyzer.generateConfig(projectInfo);
    
    console.log('\nAnalysis Results:');
    console.log('================');
    console.log(`Recommended build tool: ${analysis.buildTool.recommendation}`);
    console.log('Reasoning:');
    analysis.buildTool.matrix.bestFor.forEach(reason => console.log(`- ${reason}`));

    // Confirm with user
    const proceed = await question('\nProceed with this configuration? (y/n): ');
    if (proceed.toLowerCase() !== 'y') {
      console.log('Project generation cancelled');
      process.exit(0);
    }

    // Create project
    const template = PROJECT_TEMPLATES[analysis.buildTool.recommendation];
    console.log('\nCreating project...');
    execSync(template.create(projectInfo.name), { stdio: 'inherit' });

    // Install dependencies
    console.log('\nInstalling dependencies...');
    execSync(`cd ${projectInfo.name} && npm install ${template.deps.join(' ')}`, { stdio: 'inherit' });

    // Set up project structure
    console.log('\nSetting up project structure...');
    await setupProject(projectInfo.name, projectInfo);

    // Set up Supabase (always included by default)
    console.log('\nSetting up Supabase...');
    await setupSupabase.init(projectInfo.name);

    console.log('\nProject generated successfully!');
    console.log('\nNext steps:');
    console.log('1. Update .env with your Supabase credentials');
    console.log('2. Run npm run supabase:start to start local development');
    console.log('3. Run npm run dev to start the development server');
    
  } catch (error) {
    console.error('Project generation failed:', error);
    process.exit(1);
  }
}

// Export for use in CLI
export { generateProject };