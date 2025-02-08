#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

/**
 * Build tool recommendations based on project characteristics
 */
const BUILD_TOOL_MATRIX = {
  VITE: {
    bestFor: [
      'Quick prototypes',
      'Small to medium apps',
      'Modern browser support',
      'Fast development experience'
    ],
    limitations: [
      'Large monorepos',
      'Complex build configurations',
      'Legacy browser support'
    ]
  },
  NEXT: {
    bestFor: [
      'SSR requirements',
      'SEO critical',
      'Full-stack applications',
      'API routes needed'
    ],
    limitations: [
      'Simple SPAs',
      'Custom server setups',
      'Non-React projects'
    ]
  },
  CRA: {
    bestFor: [
      'Traditional SPAs',
      'Stable, proven setup',
      'Complex configurations',
      'Enterprise requirements'
    ],
    limitations: [
      'Build performance',
      'Bundle size optimization',
      'Custom webpack configs'
    ]
  }
};

/**
 * Project characteristics that influence build tool choice
 */
const PROJECT_CHARACTERISTICS = {
  SIZE: {
    SMALL: 'Small project (<10 routes, simple state)',
    MEDIUM: 'Medium project (10-30 routes, moderate complexity)',
    LARGE: 'Large project (>30 routes, complex state/data flow)'
  },
  FEATURES: {
    SSR: 'Server-side rendering required',
    SEO: 'Search engine optimization critical',
    API: 'API routes/Backend integration needed',
    LEGACY: 'Legacy browser support required',
    REAL_TIME: 'Real-time updates/subscriptions',
    FILE_UPLOAD: 'File upload capabilities',
    AUTH: 'Authentication required',
    OFFLINE: 'Offline capabilities needed'
  },
  PERFORMANCE: {
    BUILD: 'Build performance critical',
    LOAD: 'Initial load time critical',
    RUNTIME: 'Runtime performance critical'
  }
};

/**
 * Analyze project requirements and recommend build tool
 */
async function analyzeProject(projectInfo) {
  const {
    size = 'MEDIUM',
    features = [],
    performance = []
  } = projectInfo;

  let scores = {
    VITE: 0,
    NEXT: 0,
    CRA: 0
  };

  // Size considerations
  if (size === 'SMALL') {
    scores.VITE += 3;
    scores.NEXT += 1;
    scores.CRA += 2;
  } else if (size === 'MEDIUM') {
    scores.VITE += 2;
    scores.NEXT += 2;
    scores.CRA += 2;
  } else if (size === 'LARGE') {
    scores.VITE += 1;
    scores.NEXT += 3;
    scores.CRA += 2;
  }

  // Feature considerations
  if (features.includes('SSR') || features.includes('SEO')) {
    scores.NEXT += 3;
  }
  if (features.includes('API')) {
    scores.NEXT += 2;
  }
  if (features.includes('LEGACY')) {
    scores.CRA += 2;
    scores.VITE -= 1;
  }
  if (features.includes('REAL_TIME')) {
    scores.VITE += 1;
    scores.NEXT += 1;
  }

  // Performance considerations
  if (performance.includes('BUILD')) {
    scores.VITE += 2;
    scores.CRA -= 1;
  }
  if (performance.includes('LOAD')) {
    scores.VITE += 1;
    scores.NEXT += 2;
  }
  if (performance.includes('RUNTIME')) {
    scores.VITE += 1;
    scores.NEXT += 1;
  }

  // Find highest score
  const bestTool = Object.entries(scores)
    .reduce((a, b) => b[1] > a[1] ? b : a)[0];

  return {
    recommendation: bestTool,
    scores,
    matrix: BUILD_TOOL_MATRIX[bestTool]
  };
}

/**
 * Analyze Supabase requirements
 */
function analyzeSupabaseNeeds(features) {
  const requirements = {
    auth: features.includes('AUTH'),
    realtime: features.includes('REAL_TIME'),
    storage: features.includes('FILE_UPLOAD'),
    edge: features.includes('API'),
    offline: features.includes('OFFLINE')
  };

  return {
    features: requirements,
    setup: {
      auth: requirements.auth ? [
        'Enable Email auth',
        'Configure OAuth providers',
        'Set up password reset flow'
      ] : [],
      realtime: requirements.realtime ? [
        'Enable replication',
        'Configure publication',
        'Set up subscriptions'
      ] : [],
      storage: requirements.storage ? [
        'Create storage buckets',
        'Configure CORS',
        'Set up policies'
      ] : [],
      edge: requirements.edge ? [
        'Deploy edge functions',
        'Set up error handling',
        'Configure CORS'
      ] : [],
      offline: requirements.offline ? [
        'Implement local storage',
        'Set up sync logic',
        'Handle conflicts'
      ] : []
    }
  };
}

/**
 * Generate project configuration
 */
async function generateConfig(projectInfo) {
  const buildTool = await analyzeProject(projectInfo);
  const supabaseSetup = analyzeSupabaseNeeds(projectInfo.features);

  return {
    buildTool,
    supabase: supabaseSetup,
    nextSteps: [
      'Create project structure',
      'Set up build configuration',
      'Initialize Supabase client',
      'Configure authentication',
      'Set up database schema',
      'Implement base components'
    ],
    recommendations: {
      structure: [
        'Follow feature-based organization',
        'Implement proper type safety',
        'Set up error boundaries',
        'Add proper logging'
      ],
      development: [
        'Use TypeScript',
        'Implement proper testing',
        'Set up CI/CD',
        'Monitor performance'
      ]
    }
  };
}

export const projectAnalyzer = {
  analyzeProject,
  analyzeSupabaseNeeds,
  generateConfig,
  PROJECT_CHARACTERISTICS
};