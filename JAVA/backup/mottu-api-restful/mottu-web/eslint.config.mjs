import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import unusedImports from 'eslint-plugin-unused-imports';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base Next.js + TS configs
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Global ignores
  {
    name: 'ignores',
    ignores: [
      '.next/**',
      'node_modules/**',
      '.turbo/**',
      'dist/**',
      'build/**'
    ]
  },
  // Project-wide settings and rules
  {
    name: 'project-rules',
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json']
      }
    },
    settings: {
      'import/resolver': {
        typescript: {
          // Always try to resolve types under `<root>@types` directory
          alwaysTryTypes: true,
          project: ['./tsconfig.json']
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx']
        }
      }
    },
    plugins: {
      'unused-imports': unusedImports
    },
    rules: {
      // Prefer plugin for unused handling
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        { vars: 'all', args: 'after-used', ignoreRestSiblings: true }
      ],

      // Import hygiene
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling', 'index']
          ],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true }
        }
      ],

      // Safer typings
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      '@typescript-eslint/no-explicit-any': ['warn', { ignoreRestArgs: false }]
    }
  }
];

export default eslintConfig;
