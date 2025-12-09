import { defineConfig } from "prisma/config";
import * as path from "path";
import "dotenv/config";

export default defineConfig({
  schema: path.join("prisma"),
  datasource: {
    url: process.env.DATABASE_URL,
  },
  migrations: {
    path: path.join("src", "migrations"),
    seed: "tsx src/seed.ts",
  },
  views: {
    path: path.join("src", "views"),
  },
  typedSql: {
    path: path.join("src", "queries"),
  },
});
