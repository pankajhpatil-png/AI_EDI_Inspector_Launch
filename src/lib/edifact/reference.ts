import type { EdifactMessage, MsgReferenceEntry } from "./types";

// Ported from tools/edifact-validator.html. To support another message
// type, add an entry here keyed by its UNH message-type code (the first
// component of UNH02). `required` lists the top-level segments this engine
// expects; `label` is "1" (exactly one) or "1+" (at least one). No other
// code changes are needed — envelope-level checks (UNB/UNZ, UNG/UNE,
// UNH/UNT control numbers and counts) already apply to every message type
// regardless of whether it has an entry here.
export const MSG_REFERENCE: Record<string, MsgReferenceEntry> = {
  ORDERS: {
    name: "Purchase Order",
    required: [
      { seg: "BGM", label: "1", note: "Order has no beginning-of-message segment — order number and function code can't be determined." },
      { seg: "LIN", label: "1+", note: "Order has no line items. Almost always a trading-partner map failure upstream, not a data-entry issue." },
    ],
  },
  ORDRSP: {
    name: "Order Response",
    required: [
      { seg: "BGM", label: "1", note: "Order response has no beginning-of-message segment." },
      { seg: "LIN", label: "1+", note: "Order response has no line items to confirm against the original order." },
    ],
  },
  INVOIC: {
    name: "Invoice",
    required: [
      { seg: "BGM", label: "1", note: "Invoice has no beginning-of-message segment — invoice number and function code can't be determined." },
      { seg: "LIN", label: "1+", note: "Invoice has no line items — reject before it reaches AP." },
      { seg: "MOA", label: "1", note: "Invoice has no monetary amount segment, the field AP systems key off of." },
    ],
  },
  DESADV: {
    name: "Dispatch Advice (ASN)",
    required: [
      { seg: "BGM", label: "1", note: "Dispatch advice has no beginning-of-message segment or shipment reference." },
      {
        seg: "LIN",
        label: "1+",
        note: "The single most common ASN failure mode — no line/item detail means no shipment content at all, despite a valid envelope. Usually a sender-side mapping bug.",
      },
    ],
  },
  INVRPT: {
    name: "Inventory Report",
    required: [
      { seg: "BGM", label: "1", note: "Inventory report has no beginning-of-message segment." },
      { seg: "LIN", label: "1+", note: "Inventory report has zero items — usually an empty upstream extract." },
    ],
  },
  CONTRL: {
    name: "Functional Acknowledgment (Syntax)",
    required: [{ seg: "UCI", label: "1", note: "No interchange response segment — accept/reject status of the interchange can't be determined." }],
  },
};

export function msgDisplayName(msg: EdifactMessage): string | null {
  const ref = MSG_REFERENCE[msg.messageType ?? ""];
  return ref ? ref.name : null;
}
