import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

/**
 * Creates the shared ESLint config for Next.js apps.
 * Pass the directory of the consuming package (where next is installed).
 * @param {string} baseDirectory - Directory of the app/package using this config
 * @returns {import('eslint').Linter.Config[]}
 */
export function createNextConfig(baseDirectory) {
  const compat = new FlatCompat({ baseDirectory });

  return [
    ...compat.extends('next/core-web-vitals', 'next/typescript'),
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'import/no-anonymous-default-export': 'off',
        '@typescript-eslint/no-unused-vars': [
          'warn',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
          },
        ],
      },
    },
    {
      ignores: ['node_modules/**', '.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
    },
  ];
}
