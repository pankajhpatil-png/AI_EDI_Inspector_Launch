export interface AnalyticsSummary {
  totalValidations: number;
  totalFiles: number;
  validRate: number;
  byTransactionSet: { code: string; count: number; validCount: number }[];
  last30Days: { date: string; count: number; validCount: number }[];
}

export interface HistoryRun {
  id: string;
  createdAt: string;
  transactionSets: string[];
  fileCount: number;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  missingCount: number;
  source: "upload" | "paste";
}
