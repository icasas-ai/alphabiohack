import "dotenv/config";

import { defineConfig } from "prisma/config";

const prismaDatasourceUrl =
  process.env.DIRECT_URL ??
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/alphabiohack?schema=public";

export default defineConfig({
  schema: "./prisma",
  datasource: {
    url: prismaDatasourceUrl,
  },
});
