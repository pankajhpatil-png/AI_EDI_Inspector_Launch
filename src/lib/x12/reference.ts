import type { TransactionSet, TxReferenceEntry } from "./types";

// Consolidated from tools/x12-edi-validator.html (commercial) and
// tools/hipaa-edi-validator.html (healthcare), plus a new 999 entry.
// `igFragment` is only set for the HIPAA-flavored sets, matching the
// source tool's soft GS08 implementation-guide check — 820 is kept in its
// commercial-supply-chain form per the BRD's own grouping, without that
// check. 834 existed in the source HIPAA tool but isn't one of the BRD's
// 15 MVP transaction sets, so it has no entry here (still envelope-
// validates like any other unlisted ST01).
export const TX_REFERENCE: Record<string, TxReferenceEntry> = {
  "850": {
    name: "Purchase Order",
    category: "commercial",
    required: [
      { seg: "BEG", label: "1", note: "Order has no beginning segment — PO number and type can't be determined." },
      { seg: "PO1", label: "1+", note: "Order has no line items. Almost always a trading-partner map failure upstream, not a data-entry issue." },
    ],
  },
  "855": {
    name: "PO Acknowledgment",
    category: "commercial",
    required: [
      { seg: "BAK", label: "1", note: "Acknowledgment has no beginning segment — can't tell which PO or ack type this covers." },
      { seg: "PO1", label: "1+", note: "Acknowledgment has no line items to confirm against the original order." },
    ],
  },
  "810": {
    name: "Invoice",
    category: "commercial",
    required: [
      { seg: "BIG", label: "1", note: "Invoice has no beginning segment — invoice number, date, and PO reference can't be determined." },
      { seg: "IT1", label: "1+", note: "Invoice has no line items — reject before it reaches AP." },
      { seg: "TDS", label: "1", note: "Invoice has no total amount, the field AP systems key off of." },
    ],
  },
  "856": {
    name: "Advance Ship Notice",
    category: "commercial",
    required: [
      { seg: "BSN", label: "1", note: "Shipment notice has no beginning segment or shipment ID." },
      { seg: "HL", label: "1+", note: "The single most common ASN failure mode — no Shipment/Order/Item hierarchy means no shipment content at all, despite a valid envelope. Usually a sender-side mapping bug." },
    ],
  },
  "820": {
    name: "Payment Order/Remittance Advice",
    category: "commercial",
    required: [
      { seg: "BPR", label: "1", note: "Payment order has no BPR segment — payment amount and method can't be determined." },
      { seg: "N1", label: "1+", note: "Payment order has no N1 (entity) segment — no payer/payee identification." },
    ],
  },
  "846": {
    name: "Inventory Advice",
    category: "commercial",
    required: [
      { seg: "BIA", label: "1", note: "Inventory file has no beginning segment or action code." },
      { seg: "LIN", label: "1+", note: "Inventory file reports zero items — usually an empty upstream extract." },
    ],
  },
  "997": {
    name: "Functional Acknowledgment",
    category: "commercial",
    required: [
      { seg: "AK1", label: "1", note: "Can't tell which functional group this is acknowledging." },
      { seg: "AK9", label: "1", note: "No accept/reject code (A/E/P/R) — this is the field that matters most in a 997." },
    ],
  },
  "999": {
    name: "Implementation Acknowledgment",
    category: "commercial",
    required: [
      { seg: "AK1", label: "1", note: "Can't tell which functional group this is acknowledging." },
      { seg: "AK9", label: "1", note: "No accept/reject code (A/E/P/R) — this is the field that matters most in a 999." },
    ],
  },
  "270": {
    name: "Eligibility Inquiry",
    category: "healthcare",
    igFragment: "X279",
    required: [
      { seg: "BHT", label: "1", note: "Inquiry has no beginning-of-hierarchical-transaction segment." },
      { seg: "HL", label: "1+", note: "Inquiry has no hierarchical levels — no subscriber/dependent structure to attach the eligibility question to." },
      { seg: "EQ", label: "1+", note: "Inquiry has no EQ segment — no eligibility/benefit category was actually requested." },
    ],
  },
  "271": {
    name: "Eligibility Response",
    category: "healthcare",
    igFragment: "X279",
    required: [
      { seg: "BHT", label: "1", note: "Response has no beginning-of-hierarchical-transaction segment." },
      { seg: "HL", label: "1+", note: "Response has no hierarchical levels — no subscriber/dependent structure." },
      { seg: "EB", label: "1+", note: "Response has no EB segment — no eligibility or benefit information was actually returned." },
    ],
  },
  "276": {
    name: "Claim Status Inquiry",
    category: "healthcare",
    igFragment: "X212",
    required: [
      { seg: "BHT", label: "1", note: "Inquiry has no beginning-of-hierarchical-transaction segment." },
      { seg: "HL", label: "1+", note: "Inquiry has no hierarchical levels — no provider/subscriber/claim structure." },
      { seg: "TRN", label: "1", note: "Inquiry has no TRN (trace number) — the payer can't correlate a status response back to this inquiry." },
    ],
  },
  "277": {
    name: "Claim Status Response",
    category: "healthcare",
    igFragment: "X212",
    required: [
      { seg: "BHT", label: "1", note: "Response has no beginning-of-hierarchical-transaction segment." },
      { seg: "HL", label: "1+", note: "Response has no hierarchical levels." },
      { seg: "STC", label: "1+", note: "Response has no STC segment — no actual status information was returned for any claim." },
    ],
  },
  "278": {
    name: "Health Care Services Review (Referral/Auth)",
    category: "healthcare",
    igFragment: "X217",
    required: [
      { seg: "BHT", label: "1", note: "Review request has no beginning-of-hierarchical-transaction segment." },
      { seg: "HL", label: "1+", note: "Review request has no hierarchical levels." },
      { seg: "UM", label: "1", note: "Review request has no UM segment — health care services review information is missing." },
    ],
  },
  "835": {
    name: "Remittance Advice",
    category: "healthcare",
    igFragment: "X221",
    required: [
      { seg: "BPR", label: "1", note: "Remittance has no BPR segment — payment amount and method can't be determined." },
      { seg: "TRN", label: "1", note: "Remittance has no TRN (reassociation trace number) — provider systems can't match this remittance to the payment." },
      { seg: "CLP", label: "1+", note: "Remittance has no CLP (claim payment) segments — no claims were actually adjudicated in this file." },
    ],
  },
  "837": {
    name: "Health Care Claim",
    category: "healthcare",
    igFragment: "X22",
    required: [
      { seg: "BHT", label: "1", note: "Claim transaction has no beginning-of-hierarchical-transaction segment." },
      { seg: "HL", label: "1+", note: "Claim transaction has no hierarchical levels — no billing provider/subscriber/patient structure." },
      { seg: "CLM", label: "1+", note: "Claim transaction has no CLM segment — no actual claim content, despite a valid envelope. Usually a sender-side mapping bug." },
    ],
  },
};

// 837 covers three implementation guides (Professional/Institutional/
// Dental) sharing the same ST01 = "837" — the guide is distinguished by
// GS08, not by any segment inside the transaction itself.
export const X837_SUBTYPES = [
  { match: "X222", label: "Professional" },
  { match: "X223", label: "Institutional" },
  { match: "X224", label: "Dental" },
];

export function classify837(gs08: string | null): string | null {
  if (!gs08) return null;
  for (const subtype of X837_SUBTYPES) {
    if (gs08.indexOf(subtype.match) !== -1) return subtype.label;
  }
  return null;
}

export function txDisplayName(txn: TransactionSet): string | null {
  const ref = TX_REFERENCE[txn.transactionSetId];
  if (!ref) return null;
  if (txn.transactionSetId === "837") {
    const subtype = classify837(txn.gs08);
    return ref.name + (subtype ? " (" + subtype + ")" : "");
  }
  return ref.name;
}
