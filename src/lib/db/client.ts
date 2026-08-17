import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

export class DbNotConfiguredError extends Error {}

let cachedSql: NeonQueryFunction<false, false> | null = null;
let schemaReady = false;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getSql(): NeonQueryFunction<false, false> {
  if (!isDbConfigured()) throw new DbNotConfiguredError("DATABASE_URL is not set.");
  if (!cachedSql) cachedSql = neon(process.env.DATABASE_URL as string);
  return cachedSql;
}

// Called lazily on first request rather than at module load, so the app
// still boots (and every other feature still works) with no database
// connected — matches the graceful-degradation pattern already used for
// the KV usage counters in x12-edi-validator-publish/api/stats.js.
export async function ensureSchema(): Promise<void> {
  if (schemaReady) return;
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS history_runs (
      id uuid primary key default gen_random_uuid(),
      created_at timestamptz not null default now(),
      transaction_sets text[] not null,
      file_count int not null,
      is_valid boolean not null,
      error_count int not null default 0,
      warning_count int not null default 0,
      missing_count int not null default 0,
      source text not null
    )
  `;
  schemaReady = true;
}
