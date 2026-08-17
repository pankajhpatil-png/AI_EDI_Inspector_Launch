import { TX_REFERENCE, txDisplayName } from "./reference";
import type { Finding, TransactionSet } from "./types";

export function requiredSegmentFindings(txn: TransactionSet): Finding[] {
  const ref = TX_REFERENCE[txn.transactionSetId];
  const findings: Finding[] = [];
  if (!ref) return findings;

  const present: Record<string, boolean> = {};
  txn.segments.forEach((s) => {
    present[s] = true;
  });

  ref.required.forEach((r) => {
    if (!present[r.seg]) {
      findings.push({
        severity: "missing",
        code: "MISSING_" + r.seg,
        message: (txDisplayName(txn) || ref.name) + " (ST " + txn.stControlNumber + "): missing " + r.seg + " (required, " + r.label + ")",
        note: r.note,
      });
    }
  });

  // 837's three implementation guides share ST01, so we don't second-guess
  // GS08 against itself the way we do for the other HIPAA sets.
  if (ref.igFragment && txn.transactionSetId !== "837" && txn.gs08 && txn.gs08.indexOf(ref.igFragment) === -1) {
    findings.push({
      severity: "warning",
      code: "HIPAA_IG_VERSION",
      message: "GS08 (" + txn.gs08 + ") does not contain '" + ref.igFragment + "' — does not look like the expected HIPAA 5010 implementation-guide identifier for a " + txn.transactionSetId + " (" + ref.name + ").",
      note: null,
    });
  }

  findings.push(...businessRuleFindings(txn));

  return findings.map((f) => ({ ...f, transactionSetId: txn.transactionSetId }));
}

function businessRuleFindings(txn: TransactionSet): Finding[] {
  const findings: Finding[] = [];

  if (txn.transactionSetId === "855" && txn.raw.BAK && txn.raw.BAK[2] === "RJ") {
    findings.push({
      severity: "error",
      code: "ORDER_REJECTED",
      message: "BAK02 = RJ — the entire order was rejected by the seller.",
      note: null,
    });
  }

  if ((txn.transactionSetId === "997" || txn.transactionSetId === "999") && txn.raw.AK9) {
    const ak901 = txn.raw.AK9[1];
    const label = txn.transactionSetId;
    if (ak901 === "R") {
      findings.push({
        severity: "error",
        code: "GROUP_REJECTED",
        message: "AK9 = R — the entire functional group was rejected at the EDI syntax level. The trading partner never processed the business content.",
        note: null,
      });
    } else if (ak901 === "E" || ak901 === "P") {
      findings.push({
        severity: "warning",
        code: "GROUP_PARTIAL",
        message: "AK9 = " + ak901 + " — group was only partially accepted. Check for AK3/AK4" + (label === "999" ? "/IK3/IK4" : "") + " segments for the specific syntax error.",
        note: null,
      });
    }
  }

  // IK5 repeats per transaction set inside a 999's AK2 loop; `raw.IK5` only
  // captures the last occurrence, which is enough for this structural
  // engine's purpose (flagging that at least one rejection exists) without
  // tracking loop repetitions.
  if (txn.transactionSetId === "999" && txn.raw.IK5 && txn.raw.IK5[1] === "R") {
    findings.push({
      severity: "error",
      code: "TRANSACTION_SET_REJECTED",
      message: "IK5 = R — a specific transaction set within the group was rejected against its implementation guide, even though the group itself may show accepted.",
      note: null,
    });
  }

  return findings;
}
