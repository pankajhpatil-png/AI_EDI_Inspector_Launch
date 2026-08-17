"use client";

import Link from "next/link";
import type { Finding } from "@/lib/x12/types";
import { segmentCodeFromFinding } from "@/lib/x12/findingLinks";

export interface ExplainState {
  status: "idle" | "loading" | "done" | "unconfigured" | "error";
  explanation?: string;
  suggestedFix?: string;
  errorMessage?: string;
}

const SEVERITY_STYLES: Record<Finding["severity"], { border: string; codeColor: string }> = {
  error: { border: "var(--danger)", codeColor: "var(--danger)" },
  missing: { border: "var(--warning)", codeColor: "var(--warning)" },
  warning: { border: "var(--warning)", codeColor: "var(--warning)" },
  info: { border: "var(--success)", codeColor: "var(--success)" },
};

export default function FindingRow({
  finding,
  transactionSetId,
  explainState,
  onExplain,
  aiConfigured,
}: {
  finding: Finding;
  transactionSetId?: string;
  explainState?: ExplainState;
  onExplain?: (finding: Finding, transactionSetId?: string) => void;
  aiConfigured?: boolean | null;
}) {
  const preDisabled = aiConfigured === false;
  const style = SEVERITY_STYLES[finding.severity];
  const segmentCode = segmentCodeFromFinding(finding.code);

  return (
    <div
      className="flex flex-col gap-2 rounded-lg p-3"
      style={{ background: "var(--surface-raised)", borderLeft: `3px solid ${style.border}` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span
            className="block font-mono text-[11px] font-semibold uppercase tracking-wide"
            style={{ color: style.codeColor }}
          >
            {finding.code}
          </span>
          <p className="mt-0.5 text-sm" style={{ color: "var(--ink)" }}>
            {finding.message}
          </p>
          {finding.note && (
            <p className="mt-1 text-xs" style={{ color: "var(--ink-muted)" }}>
              {finding.note}
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            {transactionSetId && (
              <Link href={`/transactions?code=${transactionSetId}`} className="chip" style={{ textDecoration: "none" }}>
                {transactionSetId}
              </Link>
            )}
            {segmentCode && transactionSetId && (
              <Link
                href={`/transactions?code=${transactionSetId}&seg=${segmentCode}`}
                className="chip"
                style={{ textDecoration: "none" }}
              >
                {segmentCode}
              </Link>
            )}
          </div>
        </div>
        {onExplain && (
          <button
            type="button"
            onClick={() => onExplain(finding, transactionSetId)}
            disabled={preDisabled || explainState?.status === "loading" || explainState?.status === "unconfigured"}
            className="shrink-0 rounded-md border px-2.5 py-1 text-xs font-semibold disabled:opacity-50"
            style={{ borderColor: "var(--border)", color: "var(--accent)", background: "var(--surface)" }}
            title={preDisabled ? "AI explanations are not configured yet — see Settings" : "Explain this finding"}
          >
            {explainState?.status === "loading" ? "Explaining…" : "Explain"}
          </button>
        )}
      </div>

      {explainState?.status === "done" && (
        <div
          className="rounded-md border p-3 text-sm"
          style={{ borderColor: "var(--accent)", background: "var(--accent-soft)", color: "var(--ink)" }}
        >
          <p>{explainState.explanation}</p>
          {explainState.suggestedFix && (
            <p className="mt-2">
              <span className="font-semibold">Suggested fix: </span>
              {explainState.suggestedFix}
            </p>
          )}
        </div>
      )}
      {explainState?.status === "unconfigured" && (
        <p className="text-xs" style={{ color: "var(--ink-muted)" }}>
          AI explanations aren&apos;t configured yet — see Settings.
        </p>
      )}
      {explainState?.status === "error" && (
        <p className="text-xs" style={{ color: "var(--danger)" }}>
          {explainState.errorMessage || "Couldn't get an explanation. Try again."}
        </p>
      )}
    </div>
  );
}
