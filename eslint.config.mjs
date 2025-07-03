import babelParser from '@babel/eslint-parser';
import typescriptParser from '@typescript-eslint/parser';
import js from '@eslint/js';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    rules: {
      'prefer-const': 'warn',
      'no-unused-vars': 'warn',
      'no-undef': 'warn',
      'no-prototype-builtins': 'warn',
      'no-useless-escape': 'warn'
    },
    ignores: ['node_modules', 'dist', 'webapp', 'examples', 'dev', 'babel.config.js', '!*.js'],
    languageOptions: {
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ['@babel/preset-env']
        }
      },
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        sap: true
      }
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      'prefer-const': 'warn',
      'no-unused-vars': 'off',
      'no-undef': 'off',
      'no-prototype-builtins': 'warn',
      'no-useless-escape': 'warn'
    },
    ignores: ['node_modules', 'dist', 'webapp', 'examples', 'dev'],
    languageOptions: {
      parser: typescriptParser,
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        sap: true
      }
    }
  }
];
