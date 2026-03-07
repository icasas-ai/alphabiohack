type EnvLike = Record<string, string | undefined>;

const DEFAULT_LOCAL_DATABASE_URL =
  "postgresql://postgres:postgres@localhost:5432/alphabiohack?schema=public";

function trimValue(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function buildDatabaseUrlFromParts(env: EnvLike = process.env) {
  const user = trimValue(env.DB_USER);
  const host = trimValue(env.DB_HOST);
  const dbName = trimValue(env.DB_NAME);

  if (!user || !host || !dbName) {
    return null;
  }

  const port = trimValue(env.DB_PORT) || "5432";
  const password = env.DB_PASS ?? "";
  const encodedUser = encodeURIComponent(user);
  const encodedPassword = encodeURIComponent(password);
  const encodedDbName = encodeURIComponent(dbName);
  const query = trimValue(env.DB_QUERY);

  const authSegment =
    password === ""
      ? encodedUser
      : `${encodedUser}:${encodedPassword}`;
  const querySegment = query ? `?${query}` : "";

  return `postgresql://${authSegment}@${host}:${port}/${encodedDbName}${querySegment}`;
}

export function resolveDatabaseUrl(env: EnvLike = process.env) {
  const builtFromParts = buildDatabaseUrlFromParts(env);
  if (builtFromParts) {
    return {
      url: builtFromParts,
      source: "DB_PARTS" as const,
    };
  }

  const databaseUrl = trimValue(env.DATABASE_URL);
  if (databaseUrl) {
    return {
      url: databaseUrl,
      source: "DATABASE_URL" as const,
    };
  }

  const directUrl = trimValue(env.DIRECT_URL);
  if (directUrl) {
    return {
      url: directUrl,
      source: "DIRECT_URL" as const,
    };
  }

  return {
    url: null,
    source: "NONE" as const,
  };
}

export function getDefaultLocalDatabaseUrl() {
  return DEFAULT_LOCAL_DATABASE_URL;
}
