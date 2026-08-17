"use client";

import { useEffect, useState } from "react";
import KpiCard from "@/components/KpiCard";
import type { AnalyticsSummary } from "@/lib/analytics/types";

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [notConfigured, setNotConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/analytics/summary")
      .then(async (r) => {
        if (r.status === 503) {
          setNotConfigured(true);
          return;
        }
        if (!r.ok) throw new Error("Failed to load analytics");
        setSummary(await r.json());
      })
      .catch((e) => setError(e.message));
  }, []);

  const maxTxCount = summary ? Math.max(1, ...summary.byTransactionSet.map((t) => t.count)) : 1;
  const maxDayCount = summary ? Math.max(1, ...summary.last30Days.map((d) => d.count)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Analytics
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Site-wide usage and trends across every visitor.
        </p>
      </div>

      {notConfigured && (
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--border)", background: "var(--surface-raised)", color: "var(--ink-muted)" }}>
          Analytics isn&apos;t connected yet — see Settings for setup.
        </div>
      )}
      {error && (
        <div className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--danger)", background: "var(--danger-soft)", color: "var(--ink)" }}>
          {error}
        </div>
      )}

      {summary && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <KpiCard label="Total validations" value={String(summary.totalValidations)} />
            <KpiCard label="Total files validated" value={String(summary.totalFiles)} />
            <KpiCard label="Valid rate" value={`${Math.round(summary.validRate * 100)}%`} />
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
              By transaction set
            </h2>
            <div className="flex flex-col gap-2">
              {summary.byTransactionSet.length === 0 && (
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No data yet.</p>
              )}
              {summary.byTransactionSet.map((t) => (
                <div key={t.code} className="flex items-center gap-3">
                  <span className="w-10 shrink-0 font-mono text-xs font-semibold" style={{ color: "var(--accent)" }}>
                    {t.code}
                  </span>
                  <div className="h-2 flex-1 overflow-hidden rounded-full" style={{ background: "var(--surface-raised)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${(t.count / maxTxCount) * 100}%`, background: "var(--accent)" }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-xs" style={{ color: "var(--ink-muted)" }}>
                    {t.count} ({t.validCount} valid)
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
              Last 30 days
            </h2>
            {summary.last30Days.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>No data yet.</p>
            ) : (
              <div className="flex items-end gap-1" style={{ height: "80px" }}>
                {summary.last30Days.map((d) => (
                  <div
                    key={d.date}
                    title={`${d.date}: ${d.count} validations`}
                    className="flex-1 rounded-t"
                    style={{ height: `${Math.max(4, (d.count / maxDayCount) * 100)}%`, background: "var(--accent)" }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
