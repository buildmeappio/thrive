import * as path from 'path';
import "dotenv/config";

export default {
  schema: path.join("prisma"),
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
};