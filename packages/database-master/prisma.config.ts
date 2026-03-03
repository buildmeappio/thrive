import { defineConfig } from 'prisma/config';
import * as path from 'node:path';
import 'dotenv/config';

const rootDir = process.cwd();

export default defineConfig({
  schema: path.resolve(rootDir, 'prisma'),
  datasource: {
    url: process.env.MASTER_DATABASE_URL!,
  },
  migrations: {
    path: path.resolve(rootDir, 'src', 'migrations'),
  },
});
