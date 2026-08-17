import { TX_REFERENCE } from "@/lib/x12/reference";
import type { SpecElement } from "./specTypes";

export interface SegmentReferenceEntry {
  label: string;
  description: string;
  elements: SpecElement[];
}

// Element lists cover the positions that matter for understanding a
// segment's business purpose, not the full X12 spec down to every rarely-
// populated banking/composite field — consistent with this tool's own
// stated scope (structural/business-language reference, not a full
// implementation-guide validator).
const DESCRIPTIONS: Record<string, SegmentReferenceEntry> = {
  ISA: {
    label: "Interchange Control Header",
    description:
      "Opens the interchange — identifies sender, receiver, date/time, and the control number that must match the closing IEA.",
    elements: [
      { ref: "ISA01", name: "Authorization Information Qualifier", mandatory: true },
      { ref: "ISA02", name: "Authorization Information", mandatory: true },
      { ref: "ISA03", name: "Security Information Qualifier", mandatory: true },
      { ref: "ISA04", name: "Security Information", mandatory: true },
      { ref: "ISA05", name: "Interchange ID Qualifier (Sender)", mandatory: true },
      { ref: "ISA06", name: "Interchange Sender ID", mandatory: true },
      { ref: "ISA07", name: "Interchange ID Qualifier (Receiver)", mandatory: true },
      { ref: "ISA08", name: "Interchange Receiver ID", mandatory: true },
      { ref: "ISA09", name: "Interchange Date", mandatory: true },
      { ref: "ISA10", name: "Interchange Time", mandatory: true },
      { ref: "ISA11", name: "Repetition Separator", mandatory: true },
      { ref: "ISA12", name: "Interchange Control Version Number", mandatory: true },
      { ref: "ISA13", name: "Interchange Control Number", mandatory: true },
      { ref: "ISA14", name: "Acknowledgment Requested", mandatory: true },
      { ref: "ISA15", name: "Usage Indicator (Test/Production)", mandatory: true },
      { ref: "ISA16", name: "Component Element Separator", mandatory: true },
    ],
  },
  GS: {
    label: "Functional Group Header",
    description:
      "Opens a functional group — groups one or more transaction sets of the same type and carries the version/implementation-guide identifier.",
    elements: [
      { ref: "GS01", name: "Functional Identifier Code", mandatory: true },
      { ref: "GS02", name: "Application Sender's Code", mandatory: true },
      { ref: "GS03", name: "Application Receiver's Code", mandatory: true },
      { ref: "GS04", name: "Date", mandatory: true },
      { ref: "GS05", name: "Time", mandatory: true },
      { ref: "GS06", name: "Group Control Number", mandatory: true },
      { ref: "GS07", name: "Responsible Agency Code", mandatory: true },
      { ref: "GS08", name: "Version/Release/Industry Identifier Code", mandatory: true },
    ],
  },
  ST: {
    label: "Transaction Set Header",
    description: "Opens a single transaction set (e.g. one PO, one claim) and states which transaction set code follows.",
    elements: [
      { ref: "ST01", name: "Transaction Set Identifier Code", mandatory: true },
      { ref: "ST02", name: "Transaction Set Control Number", mandatory: true },
      { ref: "ST03", name: "Implementation Convention Reference", mandatory: true },
    ],
  },
  SE: {
    label: "Transaction Set Trailer",
    description: "Closes a transaction set — its segment count and control number must match the opening ST.",
    elements: [
      { ref: "SE01", name: "Number of Included Segments", mandatory: true },
      { ref: "SE02", name: "Transaction Set Control Number", mandatory: true },
    ],
  },
  GE: {
    label: "Functional Group Trailer",
    description: "Closes a functional group — its transaction-set count and control number must match the opening GS.",
    elements: [
      { ref: "GE01", name: "Number of Transaction Sets Included", mandatory: true },
      { ref: "GE02", name: "Group Control Number", mandatory: true },
    ],
  },
  IEA: {
    label: "Interchange Control Trailer",
    description: "Closes the interchange — its group count and control number must match the opening ISA.",
    elements: [
      { ref: "IEA01", name: "Number of Included Functional Groups", mandatory: true },
      { ref: "IEA02", name: "Interchange Control Number", mandatory: true },
    ],
  },
  BEG: {
    label: "Beginning Segment for Purchase Order",
    description: "Carries the PO number, order type, and date — the first thing a receiving system reads off an 850.",
    elements: [
      { ref: "BEG01", name: "Transaction Set Purpose Code", mandatory: true },
      { ref: "BEG02", name: "Purchase Order Type Code", mandatory: true },
      { ref: "BEG03", name: "Purchase Order Number", mandatory: true },
      { ref: "BEG04", name: "Release Number", mandatory: true },
      { ref: "BEG05", name: "Date", mandatory: true },
    ],
  },
  PO1: {
    label: "Baseline Item Data",
    description: "One line item on a purchase order or acknowledgment — quantity, unit price, and product/item identifiers.",
    elements: [
      { ref: "PO101", name: "Assigned Identification", mandatory: true },
      { ref: "PO102", name: "Quantity Ordered", mandatory: true },
      { ref: "PO103", name: "Unit or Basis for Measurement Code", mandatory: true },
      { ref: "PO104", name: "Unit Price", mandatory: true },
      { ref: "PO105", name: "Basis of Unit Price Code", mandatory: true },
      { ref: "PO106", name: "Product/Service ID Qualifier", mandatory: true },
      { ref: "PO107", name: "Product/Service ID", mandatory: true },
    ],
  },
  BAK: {
    label: "Beginning Segment for Purchase Order Acknowledgment",
    description: "States which PO is being acknowledged and whether the order is accepted, rejected, or changed.",
    elements: [
      { ref: "BAK01", name: "Transaction Set Purpose Code", mandatory: true },
      { ref: "BAK02", name: "Acknowledgment Type", mandatory: true },
      { ref: "BAK03", name: "Purchase Order Number", mandatory: true },
      { ref: "BAK04", name: "Date (Purchase Order Date)", mandatory: true },
    ],
  },
  BIG: {
    label: "Beginning Segment for Invoice",
    description: "Carries the invoice number, invoice date, and the PO reference it bills against.",
    elements: [
      { ref: "BIG01", name: "Invoice Date", mandatory: true },
      { ref: "BIG02", name: "Invoice Number", mandatory: true },
      { ref: "BIG03", name: "Purchase Order Date", mandatory: true },
      { ref: "BIG04", name: "Purchase Order Number", mandatory: true },
    ],
  },
  IT1: {
    label: "Baseline Item Data (Invoice)",
    description: "One billed line item on an invoice — quantity, price, and product identifiers.",
    elements: [
      { ref: "IT101", name: "Assigned Identification", mandatory: true },
      { ref: "IT102", name: "Quantity Invoiced", mandatory: true },
      { ref: "IT103", name: "Unit or Basis for Measurement Code", mandatory: true },
      { ref: "IT104", name: "Unit Price", mandatory: true },
      { ref: "IT105", name: "Basis of Unit Price Code", mandatory: true },
      { ref: "IT106", name: "Product/Service ID Qualifier", mandatory: true },
      { ref: "IT107", name: "Product/Service ID", mandatory: true },
    ],
  },
  TDS: {
    label: "Total Monetary Value Summary",
    description: "The invoice's total amount due — the figure accounts-payable systems key off of.",
    elements: [{ ref: "TDS01", name: "Amount (Total Invoice Amount)", mandatory: true }],
  },
  BSN: {
    label: "Beginning Segment for Ship Notice",
    description: "Carries the shipment ID and date for an Advance Ship Notice.",
    elements: [
      { ref: "BSN01", name: "Transaction Set Purpose Code", mandatory: true },
      { ref: "BSN02", name: "Shipment Identification", mandatory: true },
      { ref: "BSN03", name: "Date", mandatory: true },
      { ref: "BSN04", name: "Time", mandatory: true },
      { ref: "BSN05", name: "Hierarchical Structure Code", mandatory: true },
    ],
  },
  HL: {
    label: "Hierarchical Level",
    description:
      "Builds the shipment/order/item (or provider/subscriber/claim) hierarchy that everything else in the transaction hangs off of.",
    elements: [
      { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
      { ref: "HL02", name: "Hierarchical Parent ID Number", mandatory: true },
      { ref: "HL03", name: "Hierarchical Level Code", mandatory: true },
      { ref: "HL04", name: "Hierarchical Child Code", mandatory: true },
    ],
  },
  BPR: {
    label: "Beginning Segment for Payment Order/Remittance Advice",
    description: "States the payment amount, method, and date for a remittance or premium payment.",
    elements: [
      { ref: "BPR01", name: "Transaction Handling Code", mandatory: true },
      { ref: "BPR02", name: "Monetary Amount", mandatory: true },
      { ref: "BPR03", name: "Credit/Debit Flag Code", mandatory: true },
      { ref: "BPR04", name: "Payment Method Code", mandatory: true },
      { ref: "BPR05", name: "Payment Format Code", mandatory: true },
    ],
  },
  N1: {
    label: "Name",
    description: "Identifies a party to the transaction — buyer, seller, payer, payee, ship-to, etc.",
    elements: [
      { ref: "N101", name: "Entity Identifier Code", mandatory: true },
      { ref: "N102", name: "Name", mandatory: true },
      { ref: "N103", name: "Identification Code Qualifier", mandatory: true },
      { ref: "N104", name: "Identification Code", mandatory: true },
    ],
  },
  BIA: {
    label: "Beginning Segment for Inventory Inquiry/Advice",
    description: "Carries the report date and action code for an inventory advice.",
    elements: [
      { ref: "BIA01", name: "Transaction Set Purpose Code", mandatory: true },
      { ref: "BIA02", name: "Report Type Code", mandatory: true },
      { ref: "BIA03", name: "Action Code", mandatory: true },
      { ref: "BIA04", name: "Date", mandatory: true },
    ],
  },
  LIN: {
    label: "Item Identification",
    description: "One item line on an inventory advice.",
    elements: [
      { ref: "LIN01", name: "Assigned Identification", mandatory: true },
      { ref: "LIN02", name: "Product/Service ID Qualifier", mandatory: true },
      { ref: "LIN03", name: "Product/Service ID", mandatory: true },
    ],
  },
  AK1: {
    label: "Functional Group Response Header",
    description: "States which functional group a 997/999 acknowledgment is responding to.",
    elements: [
      { ref: "AK101", name: "Functional Identifier Code", mandatory: true },
      { ref: "AK102", name: "Group Control Number", mandatory: true },
      { ref: "AK103", name: "Version/Release/Industry Identifier Code", mandatory: true },
    ],
  },
  AK9: {
    label: "Functional Group Response Trailer",
    description: "The accept/reject code (A/E/P/R) for the acknowledged functional group — the single most important field in a 997/999.",
    elements: [
      { ref: "AK901", name: "Functional Group Acknowledge Code", mandatory: true },
      { ref: "AK902", name: "Number of Transaction Sets Included", mandatory: true },
      { ref: "AK903", name: "Number of Received Transaction Sets", mandatory: true },
      { ref: "AK904", name: "Number of Accepted Transaction Sets", mandatory: true },
    ],
  },
  IK5: {
    label: "Implementation Transaction Set Response Trailer",
    description: "The accept/reject code for one specific transaction set inside a 999, separate from the group-level AK9 result.",
    elements: [
      { ref: "IK501", name: "Transaction Set Acknowledgment Code", mandatory: true },
      { ref: "IK502", name: "Implementation Transaction Set Syntax Error Code", mandatory: true },
    ],
  },
  BHT: {
    label: "Beginning of Hierarchical Transaction",
    description: "Opens a hierarchical transaction (claim, eligibility inquiry, status request) with its purpose and reference codes.",
    elements: [
      { ref: "BHT01", name: "Hierarchical Structure Code", mandatory: true },
      { ref: "BHT02", name: "Transaction Set Purpose Code", mandatory: true },
      { ref: "BHT03", name: "Reference Identification", mandatory: true },
      { ref: "BHT04", name: "Date", mandatory: true },
      { ref: "BHT05", name: "Time", mandatory: true },
      { ref: "BHT06", name: "Transaction Type Code", mandatory: true },
    ],
  },
  EQ: {
    label: "Eligibility or Benefit Inquiry",
    description: "States which benefit/service type is being asked about on a 270 eligibility inquiry.",
    elements: [
      { ref: "EQ01", name: "Service Type Code", mandatory: true },
      { ref: "EQ02", name: "Composite Medical Procedure Identifier", mandatory: true },
    ],
  },
  EB: {
    label: "Eligibility or Benefit Information",
    description: "The actual coverage/benefit answer returned on a 271 eligibility response.",
    elements: [
      { ref: "EB01", name: "Eligibility or Benefit Information Code", mandatory: true },
      { ref: "EB02", name: "Coverage Level Code", mandatory: true },
      { ref: "EB03", name: "Service Type Code", mandatory: true },
      { ref: "EB04", name: "Insurance Type Code", mandatory: true },
      { ref: "EB05", name: "Plan Coverage Description", mandatory: true },
      { ref: "EB06", name: "Time Period Qualifier", mandatory: true },
      { ref: "EB07", name: "Monetary Amount", mandatory: true },
    ],
  },
  TRN: {
    label: "Trace Number",
    description: "A reference number letting the sender match a response back to its original request or payment.",
    elements: [
      { ref: "TRN01", name: "Trace Type Code", mandatory: true },
      { ref: "TRN02", name: "Reference Identification (Trace Number)", mandatory: true },
      { ref: "TRN03", name: "Originating Company Identifier", mandatory: true },
      { ref: "TRN04", name: "Reference Identification", mandatory: true },
    ],
  },
  STC: {
    label: "Status Information",
    description: "The claim status details returned on a 277 claim status response.",
    elements: [
      { ref: "STC01", name: "Health Care Claim Status", mandatory: true },
      { ref: "STC02", name: "Date", mandatory: true },
      { ref: "STC03", name: "Action Code", mandatory: true },
      { ref: "STC04", name: "Monetary Amount", mandatory: true },
    ],
  },
  UM: {
    label: "Health Care Services Review Information",
    description: "The certification/authorization details on a 278 services review request.",
    elements: [
      { ref: "UM01", name: "Request Category Code", mandatory: true },
      { ref: "UM02", name: "Certification Type Code", mandatory: true },
      { ref: "UM03", name: "Service Type Code", mandatory: true },
      { ref: "UM04", name: "Health Care Service Location Information", mandatory: true },
    ],
  },
  CLP: {
    label: "Claim Payment Information",
    description: "One adjudicated claim's payment result on an 835 remittance advice.",
    elements: [
      { ref: "CLP01", name: "Patient Control Number", mandatory: true },
      { ref: "CLP02", name: "Claim Status Code", mandatory: true },
      { ref: "CLP03", name: "Monetary Amount (Total Claim Charge)", mandatory: true },
      { ref: "CLP04", name: "Monetary Amount (Claim Payment Amount)", mandatory: true },
      { ref: "CLP05", name: "Monetary Amount (Patient Responsibility)", mandatory: true },
      { ref: "CLP06", name: "Claim Filing Indicator Code", mandatory: true },
      { ref: "CLP07", name: "Reference Identification (Payer Claim Control Number)", mandatory: true },
    ],
  },
  CLM: {
    label: "Claim",
    description: "The core claim data — charges, place of service, and related codes — on an 837 health care claim.",
    elements: [
      { ref: "CLM01", name: "Claim Submitter's Identifier", mandatory: true },
      { ref: "CLM02", name: "Monetary Amount (Total Claim Charge Amount)", mandatory: true },
      { ref: "CLM05", name: "Health Care Service Location Information", mandatory: true },
      { ref: "CLM06", name: "Provider or Supplier Signature Indicator", mandatory: true },
      { ref: "CLM07", name: "Assignment or Plan Participation Code", mandatory: true },
      { ref: "CLM08", name: "Benefits Assignment Certification Indicator", mandatory: true },
      { ref: "CLM09", name: "Release of Information Code", mandatory: true },
    ],
  },
};

export type SegmentReference = SegmentReferenceEntry & { usedIn: string[] };

// `usedIn` is derived from TX_REFERENCE rather than hand-maintained, so it
// can never drift from the actual validation rules.
export const SEGMENT_REFERENCE: Record<string, SegmentReference> = (() => {
  const usedIn: Record<string, Set<string>> = {};
  const allTxCodes = Object.keys(TX_REFERENCE);

  for (const [txCode, entry] of Object.entries(TX_REFERENCE)) {
    for (const rule of entry.required) {
      if (!usedIn[rule.seg]) usedIn[rule.seg] = new Set();
      usedIn[rule.seg].add(txCode);
    }
  }

  // Envelope segments apply to every transaction set regardless of the
  // required-segment table; IK5 is a 999-only business-rule segment that
  // never appears in `required`.
  for (const seg of ["ISA", "GS", "ST", "SE", "GE", "IEA"]) usedIn[seg] = new Set(allTxCodes);
  usedIn["IK5"] = new Set(["999"]);

  const result: Record<string, SegmentReference> = {};
  for (const [code, desc] of Object.entries(DESCRIPTIONS)) {
    result[code] = { ...desc, usedIn: Array.from(usedIn[code] || []).sort() };
  }
  return result;
})();
