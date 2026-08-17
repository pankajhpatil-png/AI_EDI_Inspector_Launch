export interface TransactionReferenceEntry {
  purpose: string;
  commonFailureModes: string[];
}

// Required segments and category live in TX_REFERENCE (src/lib/x12/reference.ts)
// so they can never drift from the actual validation rules — this file only
// adds the business-language prose the BRD calls for on Transaction Explorer.
export const TRANSACTION_REFERENCE: Record<string, TransactionReferenceEntry> = {
  "850": {
    purpose: "A buyer's purchase order to a supplier — what to ship, how much, and at what price.",
    commonFailureModes: [
      "Missing line items (PO1) — usually a trading-partner map failure, not a data-entry issue.",
      "Wrong buyer/ship-to identifiers, causing the order to route to the wrong warehouse.",
    ],
  },
  "855": {
    purpose: "A supplier's acknowledgment of a purchase order — accepted, rejected, or changed.",
    commonFailureModes: [
      "BAK02 = RJ (rejected) going unnoticed because the envelope itself still validates cleanly.",
      "Acknowledged line items that don't match the original PO1 quantities.",
    ],
  },
  "856": {
    purpose: "An Advance Ship Notice — tells the receiver what's in a shipment before it arrives.",
    commonFailureModes: [
      "Missing HL hierarchy — the single most common ASN failure, usually a sender-side mapping bug.",
      "Ship quantities that don't reconcile with the original PO.",
    ],
  },
  "810": {
    purpose: "An invoice — what to pay, for what, and against which PO.",
    commonFailureModes: [
      "Missing line items (IT1) or total (TDS) — either one should be rejected before it reaches AP.",
      "Invoice total that doesn't match the sum of its line items.",
    ],
  },
  "820": {
    purpose: "A payment order or remittance advice — notifies a payee that a payment has been made and for what.",
    commonFailureModes: [
      "Missing payer/payee identification (N1), leaving the payment unmatched to an account.",
      "Payment amount (BPR) that doesn't reconcile with the invoices it's meant to cover.",
    ],
  },
  "846": {
    purpose: "An inventory advice — reports on-hand quantities for items at a location.",
    commonFailureModes: [
      "Zero LIN (item) segments despite a valid envelope — usually an empty upstream extract.",
      "Stale report dates making the quantities look current when they aren't.",
    ],
  },
  "997": {
    purpose: "A functional acknowledgment — confirms a functional group was received and whether it passed basic EDI syntax checks.",
    commonFailureModes: [
      "AK9 = R (rejected) buried in an otherwise-valid-looking file — check this field first.",
      "No 997 sent back at all, leaving the original sender unsure whether their file arrived.",
    ],
  },
  "999": {
    purpose: "An implementation acknowledgment — like a 997, but checks against a specific implementation guide (common in healthcare EDI).",
    commonFailureModes: [
      "AK9 = R at the group level while individual transaction sets (IK5) show mixed results.",
      "Confusing a 999 rejection with a 997 rejection — they use the same AK9 field but different rule depth.",
    ],
  },
  "270": {
    purpose: "An eligibility inquiry — a provider asking a payer whether a patient has active coverage.",
    commonFailureModes: [
      "No EQ segment — the inquiry has no actual benefit/service category to check.",
      "GS08 that doesn't match the expected 5010 X279 implementation guide identifier.",
    ],
  },
  "271": {
    purpose: "An eligibility response — the payer's answer to a 270, with coverage and benefit details.",
    commonFailureModes: [
      "No EB segment — a response with no actual eligibility/benefit information returned.",
      "Hierarchical levels present but disconnected from any real subscriber/dependent data.",
    ],
  },
  "276": {
    purpose: "A claim status inquiry — a provider asking a payer for the status of a submitted claim.",
    commonFailureModes: [
      "No TRN (trace number) — the payer has no way to correlate its response back to this inquiry.",
    ],
  },
  "277": {
    purpose: "A claim status response — the payer's answer to a 276, with the claim's current status.",
    commonFailureModes: ["No STC segment — a response that never actually states a status for any claim."],
  },
  "278": {
    purpose: "A health care services review — a referral or prior-authorization request (or its response).",
    commonFailureModes: ["No UM segment — a review request with no actual service/certification information."],
  },
  "835": {
    purpose: "A remittance advice — explains how a health care claim payment was calculated, claim by claim.",
    commonFailureModes: [
      "No CLP segments — a remittance that never adjudicates any claims despite a valid envelope.",
      "No TRN (reassociation trace number) — provider systems can't match the remittance to the actual payment.",
    ],
  },
  "837": {
    purpose: "A health care claim — professional, institutional, or dental, submitted to a payer for reimbursement.",
    commonFailureModes: [
      "No CLM segment — no actual claim content, usually a sender-side mapping bug.",
      "GS08 subtype (X222/X223/X224) that doesn't match the billing scenario, routing the claim to the wrong adjudication path.",
    ],
  },
};
