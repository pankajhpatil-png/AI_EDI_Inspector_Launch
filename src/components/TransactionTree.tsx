import type { ReactElement } from "react";
import TreeNode from "./TreeNode";
import { SEGMENT_REFERENCE } from "@/lib/reference/segments";
import { TRANSACTION_SPECS } from "@/lib/reference/specs";
import type { SpecSegment } from "@/lib/reference/specTypes";
import { TX_REFERENCE } from "@/lib/x12/reference";

function renderSegments(
  segments: SpecSegment[],
  depth: number,
  highlightSeg: string | null | undefined,
  requiredSet: Set<string>
): ReactElement[] {
  return segments.flatMap((seg, i) => [
    <TreeNode
      key={`${seg.tag}-${depth}-${i}`}
      code={seg.tag}
      title={seg.name}
      elements={seg.elements}
      indentLevel={depth}
      mandatory={seg.mandatory}
      repeatable={seg.repeatable}
      checkedByValidator={requiredSet.has(seg.tag)}
      highlighted={highlightSeg === seg.tag}
    />,
    ...(seg.children ? renderSegments(seg.children, depth + 1, highlightSeg, requiredSet) : []),
  ]);
}

export default function TransactionTree({ code, highlightSeg }: { code: string; highlightSeg?: string | null }) {
  const ref = TX_REFERENCE[code];
  if (!ref) {
    return (
      <p className="py-4 text-sm" style={{ color: "var(--ink-muted)" }}>
        Unknown transaction set &quot;{code}&quot;.
      </p>
    );
  }

  const spec = TRANSACTION_SPECS[code];
  const requiredSet = new Set(ref.required.map((r) => r.seg));

  return (
    <div>
      <TreeNode code="ISA" title={SEGMENT_REFERENCE.ISA?.label} elements={SEGMENT_REFERENCE.ISA?.elements} indentLevel={0} />
      <TreeNode code="GS" title={SEGMENT_REFERENCE.GS?.label} elements={SEGMENT_REFERENCE.GS?.elements} indentLevel={1} />
      <TreeNode code={`ST ${code}`} title={ref.name} elements={SEGMENT_REFERENCE.ST?.elements} indentLevel={2} defaultOpen />

      {spec ? (
        renderSegments(spec.segments, 3, highlightSeg, requiredSet)
      ) : (
        // Defensive fallback in case TX_REFERENCE ever gets an entry before
        // its full spec is drafted in specs.ts — shows the validator's
        // minimal required-segment list instead of nothing.
        ref.required.map((r) => (
          <TreeNode
            key={r.seg}
            code={r.seg}
            title={SEGMENT_REFERENCE[r.seg]?.label}
            note={r.note}
            elements={SEGMENT_REFERENCE[r.seg]?.elements}
            indentLevel={3}
            mandatory
            checkedByValidator
            highlighted={highlightSeg === r.seg}
          />
        ))
      )}

      <TreeNode code="SE" title={SEGMENT_REFERENCE.SE?.label} elements={SEGMENT_REFERENCE.SE?.elements} indentLevel={2} />
      <TreeNode code="GE" title={SEGMENT_REFERENCE.GE?.label} elements={SEGMENT_REFERENCE.GE?.elements} indentLevel={1} />
      <TreeNode code="IEA" title={SEGMENT_REFERENCE.IEA?.label} elements={SEGMENT_REFERENCE.IEA?.elements} indentLevel={0} />
    </div>
  );
}
