import "dotenv/config";

import { defineConfig } from "prisma/config";
import { getDefaultLocalDatabaseUrl, resolveDatabaseUrl } from "./lib/database-url";

const resolved = resolveDatabaseUrl(process.env);
const prismaDatasourceUrl = resolved.url ?? getDefaultLocalDatabaseUrl();

if (resolved.source === "DIRECT_URL") {
  console.warn(
    "DIRECT_URL is deprecated. Prefer DB_USER/DB_PASS/DB_HOST/DB_PORT/DB_NAME.",
  );
}

export default defineConfig({
  schema: "./prisma",
  datasource: {
    url: prismaDatasourceUrl,
  },
});
