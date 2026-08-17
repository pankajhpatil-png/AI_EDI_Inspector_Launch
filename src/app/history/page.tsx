"use client";

import { useEffect, useState } from "react";
import type { HistoryRun } from "@/lib/analytics/types";

export default function HistoryPage() {
  const [records, setRecords] = useState<HistoryRun[] | null>(null);
  const [total, setTotal] = useState(0);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/history?limit=50")
      .then(async (r) => {
        if (r.status === 503) {
          setNotConfigured(true);
          return;
        }
        if (!r.ok) throw new Error("Failed to load history");
        const data = await r.json();
        setRecords(data.records);
        setTotal(data.total);
      })
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          History
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Site-wide validation runs — sanitized summaries only, never raw file content.
        </p>
      </div>

      {notConfigured && (
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--border)", background: "var(--surface-raised)", color: "var(--ink-muted)" }}>
          History isn&apos;t connected yet — see Settings for setup. Your own recent runs still show up on the
          Dashboard for this browser.
        </div>
      )}
      {error && (
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--danger)", background: "var(--danger-soft)", color: "var(--ink)" }}>
          {error}
        </div>
      )}
      {records && records.length === 0 && !notConfigured && (
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          No validations recorded yet.
        </p>
      )}
      {records && records.length > 0 && (
        <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border)" }}>
          <table className="w-full text-left text-sm">
            <thead>
              <tr style={{ background: "var(--surface-raised)" }}>
                {["When", "Transaction sets", "Files", "Status", "Errors", "Warnings", "Missing"].map((h) => (
                  <th key={h} className="px-3 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--ink-muted)" }}>
                    {new Date(r.createdAt).toLocaleString()}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs" style={{ color: "var(--ink)" }}>
                    {r.transactionSets.join(", ") || "—"}
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--ink)" }}>
                    {r.fileCount}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`pill small ${r.isValid ? "valid" : "invalid"}`} style={{ fontSize: "11px", padding: "3px 8px" }}>
                      {r.isValid ? "Valid" : "Invalid"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--ink-muted)" }}>{r.errorCount}</td>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--ink-muted)" }}>{r.warningCount}</td>
                  <td className="px-3 py-2 text-xs" style={{ color: "var(--ink-muted)" }}>{r.missingCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-t px-3 py-2 text-xs" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}>
            Showing {records.length} of {total}
          </div>
        </div>
      )}
    </div>
  );
}
