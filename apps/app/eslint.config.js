import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import svelteConfig from './svelte.config.js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  { ignores: ['.svelte-kit/**', 'build/**', 'node_modules/**', 'static/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...svelte.configs['flat/recommended'],
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      },
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        extraFileExtensions: ['.svelte']
      }
    },
    rules: {
      indent: ['error', 2],
      quotes: ['error', 'single', { avoidEscape: true }],
      semi: ['error', 'always'],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
      ],
      '@typescript-eslint/no-unused-expressions': [
        'error',
        { allowShortCircuit: true, allowTernary: true }
      ]
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        svelteConfig,
        extraFileExtensions: ['.svelte']
      }
    }
  }
];
