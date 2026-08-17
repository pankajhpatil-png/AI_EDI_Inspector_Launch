"use client";

import { useEffect, useState } from "react";
import ResultsPanel, { explainKey, type AnyValidationResult } from "@/components/ResultsPanel";
import UploadPanel, { type EdiFormat, type LoadedFile } from "@/components/UploadPanel";
import type { ExplainState } from "@/components/FindingRow";
import { allMessages } from "@/lib/edifact/envelope";
import { validateInterchange as validateEdifact } from "@/lib/edifact/validate";
import { addLocalHistoryEntry } from "@/lib/history/localHistory";
import { buildValidationReportPdf } from "@/lib/pdf/buildReport";
import { validateInterchange as validateX12 } from "@/lib/x12/validate";
import type { Finding, ValidationResult } from "@/lib/x12/types";

export default function ValidatePage() {
  const [format, setFormat] = useState<EdiFormat>("X12");
  const [results, setResults] = useState<AnyValidationResult[]>([]);
  const [explainStates, setExplainStates] = useState<Record<string, ExplainState>>({});
  const [aiConfigured, setAiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setAiConfigured(data ? Boolean(data.aiConfigured) : null))
      .catch(() => setAiConfigured(null));
  }, []);

  function handleFormatChange(next: EdiFormat) {
    setFormat(next);
    setResults([]);
    setExplainStates({});
  }

  function handleFilesReady(files: LoadedFile[]) {
    const validated: AnyValidationResult[] =
      format === "EDIFACT" ? files.map((f) => validateEdifact(f.name, f.text)) : files.map((f) => validateX12(f.name, f.text));
    setResults(validated);
    setExplainStates({});

    const transactionSets = Array.from(
      new Set(
        validated.flatMap((r) => {
          if (!r.structure) return [];
          if (r.format === "EDIFACT") return allMessages(r.structure).map((m) => m.messageType).filter((t): t is string => Boolean(t));
          return r.structure.interchange.functionalGroups.flatMap((g) => g.transactionSets.map((t) => t.transactionSetId));
        })
      )
    );
    const errorCount = validated.reduce((sum, r) => sum + r.errors.length, 0);
    const warningCount = validated.reduce((sum, r) => sum + r.warnings.length, 0);
    const missingCount = validated.reduce((sum, r) => sum + r.missingFindings.length, 0);
    const isValid = validated.every((r) => !r.fatalError && r.isValid);

    addLocalHistoryEntry({
      transactionSets,
      fileCount: validated.length,
      isValid,
      errorCount,
      warningCount,
      missingCount,
    });

    fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionSets,
        fileCount: validated.length,
        isValid,
        errorCount,
        warningCount,
        missingCount,
        source: "upload",
      }),
    }).catch(() => {});
  }

  function handleExplain(finding: Finding, transactionSetId?: string) {
    const resultIndex = results.findIndex((r) => [...r.errors, ...r.missingFindings, ...r.warnings].includes(finding));
    if (resultIndex === -1) return;
    const result = results[resultIndex];
    const all = [...result.errors, ...result.missingFindings, ...result.warnings];
    const findingIndex = all.indexOf(finding);
    const key = explainKey(result.filename, finding, findingIndex);

    setExplainStates((prev) => ({ ...prev, [key]: { status: "loading" } }));

    fetch("/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: finding.code,
        message: finding.message,
        note: finding.note ?? null,
        severity: finding.severity,
        transactionSet: transactionSetId ? { id: transactionSetId } : null,
      }),
    })
      .then(async (r) => {
        if (r.status === 503) {
          setExplainStates((prev) => ({ ...prev, [key]: { status: "unconfigured" } }));
          return;
        }
        if (!r.ok) throw new Error("Explain request failed");
        const data = await r.json();
        setExplainStates((prev) => ({
          ...prev,
          [key]: { status: "done", explanation: data.explanation, suggestedFix: data.suggestedFix },
        }));
      })
      .catch((e) => {
        setExplainStates((prev) => ({ ...prev, [key]: { status: "error", errorMessage: e.message } }));
      });
  }

  async function handleExport(result: ValidationResult) {
    const blob = await buildValidationReportPdf(result);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.filename.replace(/\.[^.]+$/, "")}-validation-report.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Validate EDI
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Drop or paste a raw {format === "EDIFACT" ? "UN/EDIFACT interchange" : "X12 interchange"}. Parsing and
          validation run entirely in this browser — files never leave your machine.
        </p>
      </div>

      <div className="inline-flex self-start rounded-md border p-1" style={{ borderColor: "var(--border)", background: "var(--surface)" }} role="tablist" aria-label="EDI format">
        {(["X12", "EDIFACT"] as const).map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={format === f}
            onClick={() => handleFormatChange(f)}
            className="rounded-[6px] px-4 py-1.5 text-sm font-semibold transition-colors duration-150"
            style={
              format === f
                ? { background: "var(--accent)", color: "var(--accent-ink)" }
                : { background: "transparent", color: "var(--ink-muted)" }
            }
          >
            {f === "EDIFACT" ? "UN/EDIFACT" : "X12"}
          </button>
        ))}
      </div>

      <UploadPanel format={format} onFilesReady={handleFilesReady} />

      <ResultsPanel
        results={results}
        explainStates={explainStates}
        onExplain={handleExplain}
        onExport={handleExport}
        onClear={() => setResults([])}
        aiConfigured={aiConfigured}
      />
    </div>
  );
}
