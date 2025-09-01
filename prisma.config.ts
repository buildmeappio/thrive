import path from 'path';
import "dotenv/config";
import type { PrismaConfig } from "prisma";

export default {
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("src", "migrations"),
		seed: 'tsx src/seed.ts'
  },
  views: {
    path: path.join("src", "views"),
  },
  typedSql: {
    path: path.join("src", "queries"),
  },
} satisfies PrismaConfig;