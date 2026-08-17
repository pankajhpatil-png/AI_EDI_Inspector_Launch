"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import TransactionTree from "@/components/TransactionTree";
import { TRANSACTION_REFERENCE } from "@/lib/reference/transactions";
import { TX_REFERENCE } from "@/lib/x12/reference";

function TransactionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const seg = searchParams.get("seg");

  const commercial = useMemo(() => Object.entries(TX_REFERENCE).filter(([, e]) => e.category === "commercial"), []);
  const healthcare = useMemo(() => Object.entries(TX_REFERENCE).filter(([, e]) => e.category === "healthcare"), []);

  const selected = code && TX_REFERENCE[code] ? code : null;
  const extra = selected ? TRANSACTION_REFERENCE[selected] : null;
  const ref = selected ? TX_REFERENCE[selected] : null;

  function handleSelect(next: string) {
    router.push(next ? `/transactions?code=${next}` : "/transactions");
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--ink)" }}>
          Transaction Explorer
        </h1>
        <p className="mt-1 text-sm" style={{ color: "var(--ink-muted)" }}>
          Pick a transaction set to see its full envelope-to-element structure — every segment it requires,
          and every element inside each segment.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label htmlFor="tx-select" className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--ink-muted)" }}>
          Transaction set
        </label>
        <select
          id="tx-select"
          value={selected ?? ""}
          onChange={(e) => handleSelect(e.target.value)}
          className="rounded-md border px-3 py-2 text-sm font-mono"
          style={{ borderColor: "var(--border)", background: "var(--surface)", color: "var(--ink)" }}
        >
          <option value="" disabled>
            Select a transaction set…
          </option>
          <optgroup label="Commercial supply-chain">
            {commercial.map(([c, e]) => (
              <option key={c} value={c}>
                {c} — {e.name}
              </option>
            ))}
          </optgroup>
          <optgroup label="HIPAA healthcare">
            {healthcare.map(([c, e]) => (
              <option key={c} value={c}>
                {c} — {e.name}
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {!selected && (
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Select a transaction set above to see its structure.
        </p>
      )}

      {selected && ref && (
        <>
          <div>
            {extra && (
              <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                {extra.purpose}
              </p>
            )}
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="chip">{ref.category === "healthcare" ? "HIPAA healthcare" : "Commercial supply-chain"}</span>
              {ref.igFragment && (
                <span className="chip">
                  Expected GS08 fragment: <b>{ref.igFragment}</b>
                </span>
              )}
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <div className="px-3">
              <TransactionTree code={selected} highlightSeg={seg} />
            </div>
          </div>

          {extra && extra.commonFailureModes.length > 0 && (
            <div>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>
                Common failure modes
              </h2>
              <ul className="flex flex-col gap-1.5 text-sm" style={{ color: "var(--ink)" }}>
                {extra.commonFailureModes.map((mode, i) => (
                  <li key={i} className="flex gap-2">
                    <span style={{ color: "var(--warning)" }}>•</span>
                    {mode}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={null}>
      <TransactionsPageContent />
    </Suspense>
  );
}
