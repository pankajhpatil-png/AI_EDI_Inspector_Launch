import type { Finding } from "@/lib/x12/types";
import { MSG_REFERENCE, msgDisplayName } from "./reference";
import type { EdifactMessage } from "./types";

export function requiredSegmentFindings(msg: EdifactMessage): Finding[] {
  const ref = MSG_REFERENCE[msg.messageType ?? ""];
  const findings: Finding[] = [];
  if (!ref) return findings;

  const present: Record<string, boolean> = {};
  msg.segments.forEach((s) => {
    present[s] = true;
  });

  ref.required.forEach((r) => {
    if (!present[r.seg]) {
      findings.push({
        severity: "missing",
        code: "MISSING_" + r.seg,
        message: (msgDisplayName(msg) || ref.name) + " (UNH " + msg.messageRef + "): missing " + r.seg + " (required, " + r.label + ")",
        note: r.note,
      });
    }
  });

  return findings.map((f) => ({ ...f, transactionSetId: msg.messageType ?? undefined }));
}
