import { ensureSchema, getSql } from "./client";
import type { HistoryRun } from "@/lib/analytics/types";

export interface InsertHistoryInput {
  transactionSets: string[];
  fileCount: number;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  missingCount: number;
  source: "upload" | "paste";
}

interface HistoryRunRow {
  id: string;
  created_at: string;
  transaction_sets: string[];
  file_count: number;
  is_valid: boolean;
  error_count: number;
  warning_count: number;
  missing_count: number;
  source: string;
}

function rowToHistoryRun(row: HistoryRunRow): HistoryRun {
  return {
    id: row.id,
    createdAt: new Date(row.created_at).toISOString(),
    transactionSets: row.transaction_sets,
    fileCount: row.file_count,
    isValid: row.is_valid,
    errorCount: row.error_count,
    warningCount: row.warning_count,
    missingCount: row.missing_count,
    source: row.source as HistoryRun["source"],
  };
}

export async function insertHistoryRun(input: InsertHistoryInput): Promise<HistoryRun> {
  await ensureSchema();
  const sql = getSql();
  const rows = (await sql`
    INSERT INTO history_runs (transaction_sets, file_count, is_valid, error_count, warning_count, missing_count, source)
    VALUES (${input.transactionSets}, ${input.fileCount}, ${input.isValid}, ${input.errorCount}, ${input.warningCount}, ${input.missingCount}, ${input.source})
    RETURNING *
  `) as unknown as HistoryRunRow[];
  return rowToHistoryRun(rows[0]);
}

export interface ListHistoryFilters {
  limit?: number;
  offset?: number;
  transactionSet?: string;
  validOnly?: boolean;
}

// neon's tagged-template driver can't compose SQL fragments conditionally,
// so filter combinations are branched into fixed query shapes instead of
// building query strings by hand (which would risk injection).
export async function listHistoryRuns(filters: ListHistoryFilters = {}): Promise<{ records: HistoryRun[]; total: number }> {
  await ensureSchema();
  const sql = getSql();
  const limit = Math.min(Math.max(filters.limit ?? 25, 1), 100);
  const offset = Math.max(filters.offset ?? 0, 0);

  let rows: HistoryRunRow[];
  let countRows: { count: string }[];

  if (filters.transactionSet && filters.validOnly) {
    rows = (await sql`SELECT * FROM history_runs WHERE ${filters.transactionSet} = ANY(transaction_sets) AND is_valid = true ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`) as unknown as HistoryRunRow[];
    countRows = (await sql`SELECT count(*) FROM history_runs WHERE ${filters.transactionSet} = ANY(transaction_sets) AND is_valid = true`) as unknown as { count: string }[];
  } else if (filters.transactionSet) {
    rows = (await sql`SELECT * FROM history_runs WHERE ${filters.transactionSet} = ANY(transaction_sets) ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`) as unknown as HistoryRunRow[];
    countRows = (await sql`SELECT count(*) FROM history_runs WHERE ${filters.transactionSet} = ANY(transaction_sets)`) as unknown as { count: string }[];
  } else if (filters.validOnly) {
    rows = (await sql`SELECT * FROM history_runs WHERE is_valid = true ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`) as unknown as HistoryRunRow[];
    countRows = (await sql`SELECT count(*) FROM history_runs WHERE is_valid = true`) as unknown as { count: string }[];
  } else {
    rows = (await sql`SELECT * FROM history_runs ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`) as unknown as HistoryRunRow[];
    countRows = (await sql`SELECT count(*) FROM history_runs`) as unknown as { count: string }[];
  }

  return {
    records: rows.map(rowToHistoryRun),
    total: Number(countRows[0].count),
  };
}
