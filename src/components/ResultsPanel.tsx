"use client";

import Link from "next/link";
import { useState } from "react";
import FindingRow, { type ExplainState } from "./FindingRow";
import { msgDisplayName } from "@/lib/edifact/reference";
import type { EdifactMessage, EdifactValidationResult } from "@/lib/edifact/types";
import { txDisplayName } from "@/lib/x12/reference";
import type { Finding, ValidationResult } from "@/lib/x12/types";

export type AnyValidationResult = ValidationResult | EdifactValidationResult;

function StatusPill({ result }: { result: AnyValidationResult }) {
  if (result.fatalError) {
    return <span className="pill fatal">Unreadable</span>;
  }
  return (
    <span className={`pill ${result.isValid ? "valid" : "invalid"}`}>
      {result.isValid ? "Valid" : `Invalid — ${result.issueCount} issue${result.issueCount === 1 ? "" : "s"}`}
    </span>
  );
}

function X12EnvelopeTree({ result }: { result: ValidationResult }) {
  if (!result.structure) {
    return <p className="text-xs" style={{ color: "var(--ink-muted)" }}>No envelope could be built — see findings.</p>;
  }
  const { interchange } = result.structure;
  return (
    <div className="font-mono text-xs">
      <div className="flex items-baseline gap-2 border-b py-1.5 font-semibold" style={{ borderColor: "var(--border)" }}>
        <span style={{ color: "var(--accent)" }}>ISA</span>
        <span style={{ color: "var(--ink)" }}>control {interchange.isaControlNumber}</span>
        <span style={{ color: "var(--ink-muted)" }}>
          {interchange.sender} → {interchange.receiver} · {interchange.usage}
        </span>
      </div>
      {interchange.functionalGroups.map((g, gi) => (
        <div key={gi}>
          <div className="flex items-baseline gap-2 border-b py-1.5 pl-4" style={{ borderColor: "var(--border)" }}>
            <span style={{ color: "var(--accent)" }}>GS</span>
            <span style={{ color: "var(--ink)" }}>control {g.gsControlNumber}</span>
            <span style={{ color: "var(--ink-muted)" }}>{g.functionalIdCode}</span>
          </div>
          {g.transactionSets.map((t, ti) => (
            <div
              key={ti}
              className="flex items-baseline gap-2 border-b py-1.5 pl-8 last:border-b-0"
              style={{ borderColor: "var(--border)" }}
            >
              <Link href={`/transactions?code=${t.transactionSetId}`} style={{ color: "var(--accent)", textDecoration: "none" }}>
                ST {t.transactionSetId}
              </Link>
              <span style={{ color: "var(--ink)" }}>control {t.stControlNumber}</span>
              <span style={{ color: "var(--ink-muted)" }}>
                {txDisplayName(t) ? `${txDisplayName(t)} · ` : ""}
                {t.segments.length} segments
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function EdifactEnvelopeTree({ result }: { result: EdifactValidationResult }) {
  if (!result.structure) {
    return <p className="text-xs" style={{ color: "var(--ink-muted)" }}>No envelope could be built — see findings.</p>;
  }
  const { interchange } = result.structure;

  function MessageRow({ msg, indent }: { msg: EdifactMessage; indent: string }) {
    return (
      <div className={`flex items-baseline gap-2 border-b py-1.5 ${indent} last:border-b-0`} style={{ borderColor: "var(--border)" }}>
        <span style={{ color: "var(--accent)" }}>UNH {msg.messageType}</span>
        <span style={{ color: "var(--ink)" }}>ref {msg.messageRef}</span>
        <span style={{ color: "var(--ink-muted)" }}>
          {msgDisplayName(msg) ? `${msgDisplayName(msg)} · ` : ""}
          {msg.version}:{msg.release} · {msg.segments.length} segments
        </span>
      </div>
    );
  }

  return (
    <div className="font-mono text-xs">
      <div className="flex items-baseline gap-2 border-b py-1.5 font-semibold" style={{ borderColor: "var(--border)" }}>
        <span style={{ color: "var(--accent)" }}>UNB</span>
        <span style={{ color: "var(--ink)" }}>ref {interchange.controlRef}</span>
        <span style={{ color: "var(--ink-muted)" }}>
          {interchange.sender} → {interchange.recipient} · {interchange.syntaxId}:{interchange.syntaxVersion}
        </span>
      </div>
      {interchange.groups.map((g, gi) => (
        <div key={gi}>
          <div className="flex items-baseline gap-2 border-b py-1.5 pl-4" style={{ borderColor: "var(--border)" }}>
            <span style={{ color: "var(--accent)" }}>UNG</span>
            <span style={{ color: "var(--ink)" }}>ref {g.groupControlRef}</span>
            <span style={{ color: "var(--ink-muted)" }}>{g.identifier}</span>
          </div>
          {g.messages.map((m, mi) => <MessageRow key={mi} msg={m} indent="pl-8" />)}
        </div>
      ))}
      {interchange.messages.map((m, mi) => <MessageRow key={mi} msg={m} indent="pl-4" />)}
    </div>
  );
}

function EnvelopeTree({ result }: { result: AnyValidationResult }) {
  if (result.format === "EDIFACT") return <EdifactEnvelopeTree result={result} />;
  return <X12EnvelopeTree result={result} />;
}

function FindingsList({
  result,
  explainStates,
  onExplain,
  aiConfigured,
}: {
  result: AnyValidationResult;
  explainStates: Record<string, ExplainState>;
  onExplain?: (finding: Finding, transactionSetId?: string) => void;
  aiConfigured?: boolean | null;
}) {
  const all: Finding[] = [...result.errors, ...result.missingFindings, ...result.warnings];
  if (all.length === 0) {
    return (
      <div
        className="rounded-lg p-3 text-sm"
        style={{ background: "var(--success-soft)", color: "var(--ink)" }}
      >
        No structural errors, missing segments, or warnings found. This file is clean to transmit.
      </div>
    );
  }
  // The /transactions reference pages are X12-only, so the transaction-set
  // link chip in FindingRow only makes sense for X12 results — for EDIFACT,
  // omit it rather than link a message type (e.g. "ORDERS") to a page that
  // only knows X12 transaction-set codes.
  const linkable = result.format === "X12";
  return (
    <div className="flex flex-col gap-2.5">
      {all.map((f, i) => (
        <FindingRow
          key={`${f.code}-${i}`}
          finding={f}
          transactionSetId={linkable ? f.transactionSetId : undefined}
          explainState={explainStates[explainKey(result.filename, f, i)]}
          onExplain={onExplain}
          aiConfigured={aiConfigured}
        />
      ))}
    </div>
  );
}

export function explainKey(filename: string, finding: Finding, index: number): string {
  return `${filename}::${finding.code}::${index}`;
}

export default function ResultsPanel({
  results,
  explainStates,
  onExplain,
  onExport,
  onClear,
  aiConfigured,
}: {
  results: AnyValidationResult[];
  explainStates: Record<string, ExplainState>;
  onExplain?: (finding: Finding, transactionSetId?: string) => void;
  onExport?: (result: ValidationResult) => void;
  onClear: () => void;
  aiConfigured?: boolean | null;
}) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set(results.length === 1 ? [0] : results.map((r, i) => (r.fatalError || !r.isValid ? i : -1)).filter((i) => i >= 0)));

  if (results.length === 0) return null;

  const validCount = results.filter((r) => !r.fatalError && r.isValid).length;
  const invalidCount = results.length - validCount;

  function toggle(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 text-sm" style={{ color: "var(--ink-muted)" }}>
        <span>
          <strong style={{ color: "var(--ink)" }}>{results.length}</strong> file{results.length === 1 ? "" : "s"} checked
          — <strong style={{ color: "var(--ink)" }}>{validCount}</strong> valid,{" "}
          <strong style={{ color: "var(--ink)" }}>{invalidCount}</strong> invalid
        </span>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border px-3 py-1.5 text-xs font-semibold"
          style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}
        >
          Clear all
        </button>
      </div>

      {results.map((result, i) => (
        <div key={i} className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <button
            type="button"
            onClick={() => toggle(i)}
            className="flex w-full items-center gap-3 p-3 text-left"
          >
            <StatusPill result={result} />
            <span className="min-w-0 flex-1 truncate font-mono text-sm" style={{ color: "var(--ink)" }}>
              {result.filename}
            </span>
            {result.structure && (
              <span className="chip">
                {result.format === "X12" ? `v${result.structure.version}` : `syntax v${result.structure.interchange.syntaxVersion}`}
              </span>
            )}
          </button>
          {expanded.has(i) && (
            <div className="border-t p-4" style={{ borderColor: "var(--border)" }}>
              {result.fatalError ? (
                <div role="alert" className="rounded-lg border p-4 text-sm" style={{ borderColor: "var(--danger)", background: "var(--danger-soft)", color: "var(--ink)" }}>
                  <strong style={{ color: "var(--danger)" }}>Could not parse this file.</strong>
                  <br />
                  {result.fatalError}
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
                        Envelope structure
                      </h3>
                    </div>
                    <EnvelopeTree result={result} />
                  </div>
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
                        Findings
                      </h3>
                      {onExport && result.format === "X12" && (
                        <button
                          type="button"
                          onClick={() => onExport(result)}
                          className="rounded-md border px-2.5 py-1 text-xs font-semibold"
                          style={{ borderColor: "var(--border)", color: "var(--accent)" }}
                        >
                          Export PDF
                        </button>
                      )}
                    </div>
                    <FindingsList result={result} explainStates={explainStates} onExplain={onExplain} aiConfigured={aiConfigured} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <p className="border-t pt-3 text-xs" style={{ borderColor: "var(--border)", color: "var(--ink-muted)" }}>
        {results[0]?.format === "EDIFACT" ? (
          <>
            Scope: this checks structure against the generic UN/EDIFACT syntax (ISO 9735) — UNA delimiter
            declaration, UNB/UNZ and UNG/UNE control-number integrity, UNH/UNT segment counts, and required
            top-level segments. It does not validate against a specific subset (EANCOM, ODETTE, etc.) or
            trading-partner implementation guide — a file can pass here and still be rejected for subset-specific
            code-list or content rules. Supported message types: ORDERS, ORDRSP, INVOIC, DESADV, INVRPT, CONTRL.
          </>
        ) : (
          <>
            Scope: this checks structure against the generic X12 standard (control-number integrity, segment counts,
            required top-level segments) plus a soft GS08 implementation-guide check for HIPAA sets. It does not
            validate against a specific trading partner&apos;s or payer&apos;s full implementation guide — a file can
            pass here and still be rejected downstream. Supported transaction sets: 850, 855, 856, 810, 820, 846, 997,
            999, 270, 271, 276, 277, 278, 835, 837.
          </>
        )}
      </p>
    </div>
  );
}
