export interface LocalHistoryEntry {
  id: string;
  createdAt: string;
  transactionSets: string[];
  fileCount: number;
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  missingCount: number;
}

const KEY = "aiEdiInspectorLocalHistory";
const MAX_ENTRIES = 50;

export function getLocalHistory(): LocalHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addLocalHistoryEntry(entry: Omit<LocalHistoryEntry, "id" | "createdAt">): LocalHistoryEntry {
  const full: LocalHistoryEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const existing = getLocalHistory();
  const next = [full, ...existing].slice(0, MAX_ENTRIES);
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // localStorage unavailable or quota exceeded — the entry just won't persist
  }
  return full;
}

export interface LocalHistorySummary {
  totalValidations: number;
  totalFiles: number;
  validRate: number;
  byTransactionSet: { code: string; count: number }[];
}

export function getLocalHistorySummary(): LocalHistorySummary {
  const entries = getLocalHistory();
  const totalValidations = entries.length;
  const totalFiles = entries.reduce((sum, e) => sum + e.fileCount, 0);
  const validCount = entries.filter((e) => e.isValid).length;
  const validRate = totalValidations > 0 ? validCount / totalValidations : 0;

  const counts = new Map<string, number>();
  for (const entry of entries) {
    for (const code of entry.transactionSets) {
      counts.set(code, (counts.get(code) || 0) + 1);
    }
  }
  const byTransactionSet = Array.from(counts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  return { totalValidations, totalFiles, validRate, byTransactionSet };
}
