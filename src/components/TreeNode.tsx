"use client";

import { useEffect, useRef, useState } from "react";
import type { SpecElement } from "@/lib/reference/specTypes";

function Badge({ children, tone }: { children: string; tone: "accent" | "muted" }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        color: tone === "accent" ? "var(--accent)" : "var(--ink-muted)",
        background: tone === "accent" ? "var(--accent-soft)" : "var(--surface-raised)",
      }}
    >
      {children}
    </span>
  );
}

export default function TreeNode({
  code,
  title,
  note,
  elements,
  indentLevel = 0,
  defaultOpen = false,
  highlighted = false,
  mandatory,
  repeatable,
  checkedByValidator = false,
}: {
  code: string;
  title?: string;
  note?: string;
  elements?: SpecElement[];
  indentLevel?: number;
  defaultOpen?: boolean;
  highlighted?: boolean;
  mandatory?: boolean;
  repeatable?: boolean;
  checkedByValidator?: boolean;
}) {
  // `highlighted` forces the node open regardless of manual toggling —
  // it reflects a deep link (e.g. from a validation finding), so it should
  // win over whatever the user last clicked.
  const [manualOpen, setManualOpen] = useState(defaultOpen);
  const open = manualOpen || highlighted;
  const ref = useRef<HTMLDivElement>(null);
  const hasDetail = Boolean(elements?.length) || Boolean(note);

  useEffect(() => {
    if (highlighted) ref.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlighted]);

  return (
    <div ref={ref} className="border-b" style={{ borderColor: "var(--border)", paddingLeft: indentLevel * 20 }}>
      <button
        type="button"
        onClick={() => hasDetail && setManualOpen((v) => !v)}
        className="flex w-full flex-wrap items-baseline gap-2 py-2 text-left"
        style={{ background: highlighted ? "var(--accent-soft)" : "transparent", cursor: hasDetail ? "pointer" : "default" }}
      >
        <svg
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          style={{
            width: 10,
            height: 10,
            color: hasDetail ? "var(--ink-muted)" : "transparent",
            transform: open ? "rotate(90deg)" : "none",
            flexShrink: 0,
          }}
        >
          <path d="M7 4l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="font-mono text-sm font-semibold" style={{ color: "var(--accent)" }}>
          {code}
        </span>
        {title && (
          <span className="text-sm" style={{ color: "var(--ink)" }}>
            {title}
          </span>
        )}
        {mandatory !== undefined && <Badge tone="muted">{mandatory ? "Mandatory" : "Situational"}</Badge>}
        {repeatable && <Badge tone="muted">Repeats</Badge>}
        {checkedByValidator && <Badge tone="accent">Checked by validator</Badge>}
      </button>
      {open && hasDetail && (
        <div className="pb-3" style={{ paddingLeft: 18 }}>
          {note && (
            <p className="mb-2 text-xs" style={{ color: "var(--ink-muted)" }}>
              {note}
            </p>
          )}
          {elements && elements.length > 0 && (
            <div className="flex flex-col gap-1.5">
              {elements.map((el) => (
                <div key={el.ref} className="flex flex-wrap gap-3 text-xs">
                  <span className="w-20 shrink-0 font-mono" style={{ color: "var(--ink-muted)" }}>
                    {el.ref}
                  </span>
                  <span style={{ color: "var(--ink)" }}>
                    {el.name}
                    {!el.mandatory && <span style={{ color: "var(--ink-muted)" }}> (optional)</span>}
                  </span>
                  {el.codes && (
                    <div className="ml-20 flex w-full flex-wrap gap-1.5 pl-3">
                      {Object.entries(el.codes).map(([codeValue, meaning]) => (
                        <span key={codeValue} className="chip" style={{ fontSize: "10.5px", padding: "2px 6px" }}>
                          <b>{codeValue}</b> {meaning}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
