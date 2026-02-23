import { defineConfig } from "prisma/config";
import "dotenv/config";

// Use shared database package schema and migrations (monorepo)
import database from "@thrive/database";

export default defineConfig({
  schema: database.schema,
  datasource: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    path: database.migrations,
    seed: "tsx src/seed.ts",
  },
  views: {
    path: database.views,
  },
  typedSql: {
    path: database.queries,
  },
});
