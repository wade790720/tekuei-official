import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'
import { noSlopPlugin } from './scripts/noSlop.mjs'

export default defineConfig([
  globalIgnores(['dist', '.wrangler']),
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
])
