import { ensureSchema, getSql } from "./client";
import type { AnalyticsSummary } from "@/lib/analytics/types";

export async function getAnalyticsSummary(): Promise<AnalyticsSummary> {
  await ensureSchema();
  const sql = getSql();

  const totalsRows = (await sql`
    SELECT
      count(*) AS total_validations,
      coalesce(sum(file_count), 0) AS total_files,
      coalesce(avg(CASE WHEN is_valid THEN 1 ELSE 0 END), 0) AS valid_rate
    FROM history_runs
  `) as unknown as { total_validations: string; total_files: string; valid_rate: string }[];
  const totals = totalsRows[0];

  const byTxRows = (await sql`
    SELECT code, count(*) AS count, sum(CASE WHEN is_valid THEN 1 ELSE 0 END) AS valid_count
    FROM (SELECT unnest(transaction_sets) AS code, is_valid FROM history_runs) t
    GROUP BY code
    ORDER BY count DESC
  `) as unknown as { code: string; count: string; valid_count: string }[];

  const last30Rows = (await sql`
    SELECT
      to_char(date_trunc('day', created_at), 'YYYY-MM-DD') AS date,
      count(*) AS count,
      sum(CASE WHEN is_valid THEN 1 ELSE 0 END) AS valid_count
    FROM history_runs
    WHERE created_at >= now() - interval '30 days'
    GROUP BY date
    ORDER BY date ASC
  `) as unknown as { date: string; count: string; valid_count: string }[];

  return {
    totalValidations: Number(totals.total_validations),
    totalFiles: Number(totals.total_files),
    validRate: Number(totals.valid_rate),
    byTransactionSet: byTxRows.map((r) => ({ code: r.code, count: Number(r.count), validCount: Number(r.valid_count) })),
    last30Days: last30Rows.map((r) => ({ date: r.date, count: Number(r.count), validCount: Number(r.valid_count) })),
  };
}
