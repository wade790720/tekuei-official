import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { noSlopPlugin } from './scripts/noSlop.ts'

export default defineConfig([
  globalIgnores(['dist', 'build', '.wrangler', '.react-router', 'worker-configuration.d.ts']),
  {
    files: ['**/*.{js,jsx,mjs,ts,tsx,mts}'],
    linterOptions: { noInlineConfig: true },
    plugins: { 'no-slop': noSlopPlugin },
    rules: { 'no-slop/comments': 'error' },
  },
  {
    files: ['vite.config.*', 'scripts/**/*.{js,mjs,ts,mts}', 'eslint.config.*'],
    languageOptions: {
      globals: globals.node,
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['**/*.{ts,tsx,mts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strict,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
  // React Router reads these exports from a route module; the component still hot-reloads.
  {
    files: ['src/routes/**/*.{ts,tsx}', 'src/root.tsx'],
    rules: {
      'react-refresh/only-export-components': [
        'error',
        { allowExportNames: ['loader', 'clientLoader', 'headers', 'handle', 'shouldRevalidate', 'Layout', 'ErrorBoundary', 'meta', 'links'] },
      ],
    },
  },
  // Server code runs for every reader on one Worker: adminApi.ts keeps a module-level copy of data.json
  // (siteDataRequest) that would be shared across requests. Client code must not pull in server modules.
  {
    files: ['src/**/*.{ts,tsx}'],
    ignores: ['src/routes/**', 'src/**/*.server.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/*.server', '**/*.server.ts'], message: 'Server-only module: import it from a route module or another *.server.ts.' }] }],
    },
  },
  {
    files: ['src/routes/**/*.{ts,tsx}', 'src/**/*.server.ts', 'src/lib/pageData.ts', 'workers/**/*.ts', 'functions/**/*.ts'],
    rules: {
      'no-restricted-imports': ['error', { patterns: [{ group: ['**/adminApi', '**/adminApi.ts'], message: 'adminApi.ts is browser-only; read R2 with readSite (src/lib/cf.server.ts).' }] }],
    },
  },
])
