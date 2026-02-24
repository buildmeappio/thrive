import { defineConfig } from "prisma/config";
import * as path from "path";
import { existsSync } from "fs";
import "dotenv/config";

const rootDir = process.cwd();
// Support both monorepo (apps/organization-web) and deployment (bundled packages/database)
const candidates = [
  path.resolve(rootDir, "packages/database"),
  path.resolve(rootDir, "../../packages/database"),
];
const databasePath =
  candidates.find((p) => existsSync(path.join(p, "prisma"))) ??
  path.resolve(rootDir, "../../packages/database");

export default defineConfig({
  schema: path.resolve(databasePath, "prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: path.resolve(databasePath, "src", "migrations"),
  },
  views: {
    path: path.resolve(databasePath, "src", "views"),
  },
  typedSql: {
    path: path.resolve(databasePath, "src", "queries"),
  },
});
