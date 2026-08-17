import type { LocalHistoryEntry } from "@/lib/history/localHistory";

function timeAgo(iso: string): string {
  const seconds = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export default function RecentActivityList({ entries }: { entries: LocalHistoryEntry[] }) {
  if (entries.length === 0) {
    return (
      <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
        No validations run yet on this browser. Head to Validate EDI to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {entries.slice(0, 8).map((entry) => (
        <div
          key={entry.id}
          className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={`pill small ${entry.isValid ? "valid" : "invalid"}`}
              style={{ fontSize: "11px", padding: "3px 8px" }}
            >
              {entry.isValid ? "Valid" : "Invalid"}
            </span>
            <span className="font-mono text-xs truncate" style={{ color: "var(--ink-muted)" }}>
              {entry.transactionSets.join(", ") || "—"}
            </span>
          </div>
          <span className="text-xs shrink-0" style={{ color: "var(--ink-muted)" }}>
            {timeAgo(entry.createdAt)}
          </span>
        </div>
      ))}
    </div>
  );
}
