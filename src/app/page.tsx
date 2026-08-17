"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import KpiCard from "@/components/KpiCard";
import RecentActivityList from "@/components/RecentActivityList";
import {
  getLocalHistory,
  getLocalHistorySummary,
  type LocalHistoryEntry,
  type LocalHistorySummary,
} from "@/lib/history/localHistory";
import type { AnalyticsSummary } from "@/lib/analytics/types";

const EMPTY_SUMMARY: LocalHistorySummary = { totalValidations: 0, totalFiles: 0, validRate: 0, byTransactionSet: [] };

export default function DashboardPage() {
  const [entries, setEntries] = useState<LocalHistoryEntry[]>([]);
  const [local, setLocal] = useState<LocalHistorySummary>(EMPTY_SUMMARY);
  const [allTime, setAllTime] = useState<AnalyticsSummary | null>(null);

  useEffect(() => {
    // localStorage isn't available during SSR — reading it in a lazy
    // useState initializer instead would make the client's first hydrated
    // render diverge from the server-rendered empty state and trigger a
    // hydration mismatch, so this has to happen post-mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEntries(getLocalHistory());
    setLocal(getLocalHistorySummary());
    fetch("/api/analytics/summary")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAllTime(data))
      .catch(() => setAllTime(null));
  }, []);

  const topSets = local.byTransactionSet.slice(0, 3);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Dashboard
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Structural + AI-assisted validation for ANSI X12 and EDIFACT EDI — commercial supply-chain, HIPAA
          healthcare, and EDIFACT message types.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <KpiCard label="This browser — validations" value={String(local.totalValidations)} />
        <KpiCard label="This browser — files validated" value={String(local.totalFiles)} />
        <KpiCard
          label="This browser — valid rate"
          value={local.totalValidations > 0 ? `${Math.round(local.validRate * 100)}%` : "—"}
        />
        <KpiCard
          label="Top transaction set"
          value={topSets[0]?.code || "—"}
          sublabel={topSets[0] ? `${topSets[0].count} run${topSets[0].count === 1 ? "" : "s"}` : undefined}
        />
      </div>

      {allTime && (
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
            All users, all time
          </h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <KpiCard label="Total validations" value={String(allTime.totalValidations)} />
            <KpiCard label="Total files validated" value={String(allTime.totalFiles)} />
            <KpiCard label="Valid rate" value={`${Math.round(allTime.validRate * 100)}%`} />
          </div>
        </div>
      )}

      <div
        className="rounded-[10px] border p-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            Recent activity
          </h2>
          <Link href="/validate" className="text-xs font-semibold" style={{ color: "var(--accent)" }}>
            Validate a file →
          </Link>
        </div>
        <RecentActivityList entries={entries} />
      </div>
    </div>
  );
}
