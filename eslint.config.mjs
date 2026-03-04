import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { createNextConfig } from '@thrive/eslint-config';
import workerConfig from './apps/worker/eslint.config.mjs';

const root = dirname(fileURLToPath(import.meta.url));

const nextApps = ['admin-web', 'central-web', 'examiner-web', 'organization-web'];

export default [
  ...nextApps.flatMap((app) =>
    createNextConfig(`${root}/apps/${app}`).map((c) => ({
      ...c,
      files: [`apps/${app}/**/*.{js,jsx,ts,tsx}`],
    }))
  ),
  ...workerConfig
    .filter((c) => c.files)
    .map((c) => ({
      ...c,
      files: [`apps/worker/${c.files[0]}`],
    })),
  { ignores: ['**/node_modules/**', '**/.next/**', '**/dist/**'] },
];
