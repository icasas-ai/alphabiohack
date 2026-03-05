function normalizeSiteUrl(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

export function getSiteUrl() {
  return (
    normalizeSiteUrl(process.env.SITE_URL) ||
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    normalizeSiteUrl(process.env.URL) ||
    normalizeSiteUrl(process.env.DEPLOY_PRIME_URL) ||
    normalizeSiteUrl(process.env.DEPLOY_URL) ||
    normalizeSiteUrl(process.env.VERCEL_URL) ||
    "http://localhost:9001"
  );
}
