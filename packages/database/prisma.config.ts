import { defineConfig } from 'prisma/config';
import * as path from 'node:path';
import 'dotenv/config';

// Expects cwd = packages/database (monorepo dev and deploy). App-level prisma.config.ts
// files resolve to this package via path candidates.
const rootDir = process.cwd();

export default defineConfig({
  schema: path.resolve(rootDir, 'prisma'),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: path.resolve(rootDir, 'src', 'migrations'),
    seed: 'tsx src/seed.ts',
  },
  views: {
    path: path.resolve(rootDir, 'src', 'views'),
  },
  typedSql: {
    path: path.resolve(rootDir, 'src', 'queries'),
  },
});
