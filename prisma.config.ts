import { defineConfig } from "prisma/config";
import * as path from "path";
import "dotenv/config";

const rootDir = process.cwd();

export default defineConfig({
  schema: path.resolve(rootDir, "prisma"),
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: path.resolve(rootDir, "src", "migrations"),
    seed: "tsx src/seed.ts",
  },
  views: {
    path: path.resolve(rootDir, "src", "views"),
  },
  typedSql: {
    path: path.resolve(rootDir, "src", "queries"),
  },
});
