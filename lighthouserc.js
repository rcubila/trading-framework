export default {
  ci: {
    collect: {
      startServerCommand: 'npm run dev',
      url: ['http://localhost:5173/trading-framework'],
      numberOfRuns: 3,
    },
    assert: {
      assertions: {
        'categories:performance': ['error', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.8}],
        'categories:best-practices': ['error', {minScore: 0.8}],
        'categories:seo': ['error', {minScore: 0.8}],
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
}; 