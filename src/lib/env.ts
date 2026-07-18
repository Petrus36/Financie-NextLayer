/** Resolve DB URL from standard or Vercel/Neon-prefixed env vars. */
export function resolveDatabaseUrl(): string | undefined {
  const direct =
    process.env.DATABASE_URL ??
    process.env.POSTGRES_PRISMA_URL ??
    process.env.POSTGRES_URL;

  if (direct) return direct;

  const keys = Object.keys(process.env);
  const pooledSuffixes = ["POSTGRES_PRISMA_URL", "POSTGRES_URL", "DATABASE_URL"];
  for (const suffix of pooledSuffixes) {
    const key = keys.find((k) => k.endsWith(`_${suffix}`) || k === suffix);
    const value = key ? process.env[key] : undefined;
    if (value) return value;
  }

  return undefined;
}

export function resolveDatabaseUrlUnpooled(): string | undefined {
  const direct =
    process.env.DATABASE_URL_UNPOOLED ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (direct) return direct;

  const keys = Object.keys(process.env);
  const unpooledSuffixes = ["POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED"];
  for (const suffix of unpooledSuffixes) {
    const key = keys.find((k) => k.endsWith(`_${suffix}`) || k === suffix);
    const value = key ? process.env[key] : undefined;
    if (value) return value;
  }

  return resolveDatabaseUrl();
}

export function resolveAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}
