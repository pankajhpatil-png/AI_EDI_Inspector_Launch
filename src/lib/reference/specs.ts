import type { TransactionSpec } from "./specTypes";

// Full segment/loop/element specifications for each supported transaction
// set — this is a much deeper reference than TX_REFERENCE (the validator's
// minimal required-segment table). 850 is transcribed directly from
// tools/edi-supplier-translator/schemas/850.json, an already-authored
// source of truth in this repo. The other 14 are drafted from general X12
// 005010 standard knowledge, covering the segments/elements/loops most
// commonly seen in practice — not an exhaustive reproduction of every
// situational rule in an official TR3/companion guide. Treat this as a
// reviewable draft, not a substitute for a real implementation guide.
export const TRANSACTION_SPECS: Record<string, TransactionSpec> = {
  "850": {
    docType: "850",
    name: "Purchase Order",
    version: "005010",
    segments: [
      {
        tag: "BEG",
        name: "Beginning Segment for Purchase Order",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BEG01", name: "Transaction Set Purpose Code", mandatory: true, codes: { "00": "Original", "01": "Cancellation", "04": "Change", "05": "Replace" } },
          { ref: "BEG02", name: "Purchase Order Type Code", mandatory: true, codes: { NE: "New Order", CN: "Consigned Order", RO: "Rush Order", SA: "Stand-alone Order", RL: "Release/Delivery Order" } },
          { ref: "BEG03", name: "Purchase Order Number", mandatory: true },
          { ref: "BEG04", name: "Release Number", mandatory: false },
          { ref: "BEG05", name: "Date", mandatory: true },
          { ref: "BEG06", name: "Contract Number", mandatory: false },
        ],
      },
      {
        tag: "CUR",
        name: "Currency",
        mandatory: false,
        repeatable: false,
        elements: [
          { ref: "CUR01", name: "Entity Identifier Code", mandatory: true, codes: { BY: "Buying Party", SE: "Selling Party" } },
          { ref: "CUR02", name: "Currency Code", mandatory: true, codes: { USD: "US Dollar", CAD: "Canadian Dollar", EUR: "Euro", GBP: "British Pound", MXN: "Mexican Peso" } },
        ],
      },
      {
        tag: "REF",
        name: "Reference Identification",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { DP: "Department Number", IA: "Internal Vendor Number", CO: "Customer Order Number", VN: "Vendor Order Number", ZZ: "Mutually Defined" } },
          { ref: "REF02", name: "Reference Identification", mandatory: true },
        ],
      },
      {
        tag: "PER",
        name: "Administrative Communications Contact",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "PER01", name: "Contact Function Code", mandatory: true, codes: { BD: "Buyer Name/Department", OC: "Order Contact", IC: "Information Contact" } },
          { ref: "PER02", name: "Name", mandatory: false },
          { ref: "PER03", name: "Communication Qualifier", mandatory: false, codes: { TE: "Telephone", EM: "Email", FX: "Facsimile" } },
          { ref: "PER04", name: "Communication Number", mandatory: false },
        ],
      },
      {
        tag: "FOB",
        name: "F.O.B. Related Instructions",
        mandatory: false,
        repeatable: false,
        elements: [
          { ref: "FOB01", name: "Shipment Method of Payment", mandatory: true, codes: { CC: "Collect", PP: "Prepaid (by Seller)", PC: "Prepaid and Charged to Customer", FO: "FOB Port of Call" } },
          { ref: "FOB02", name: "Location Qualifier", mandatory: false, codes: { OR: "Origin (Shipping Point)", DE: "Destination" } },
          { ref: "FOB03", name: "Location Description", mandatory: false },
        ],
      },
      {
        tag: "ITD",
        name: "Terms of Sale",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "ITD01", name: "Terms Type Code", mandatory: false, codes: { "01": "Basic", "02": "End of Month", "03": "Fixed Date", "08": "Basic Discount Offered" } },
          { ref: "ITD02", name: "Terms Basis Date Code", mandatory: false, codes: { "1": "Ship Date", "2": "Delivery Date", "3": "Invoice Date" } },
          { ref: "ITD03", name: "Terms Discount Percent", mandatory: false },
          { ref: "ITD05", name: "Terms Discount Days Due", mandatory: false },
          { ref: "ITD07", name: "Terms Net Days Due", mandatory: false },
        ],
      },
      {
        tag: "DTM",
        name: "Date/Time Reference",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "002": "Delivery Requested", "010": "Requested Ship", "037": "Ship Not Before", "038": "Ship Not Later", "118": "Required Delivery", "063": "Do Not Deliver After" } },
          { ref: "DTM02", name: "Date", mandatory: true },
        ],
      },
      {
        tag: "N1",
        name: "Name (Party Identification)",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "N101", name: "Entity Identifier Code", mandatory: true, codes: { BT: "Bill-to Party", ST: "Ship-to Party", VN: "Vendor", SF: "Ship From", SU: "Supplier/Manufacturer" } },
          { ref: "N102", name: "Name", mandatory: false },
          { ref: "N103", name: "Identification Code Qualifier", mandatory: false, codes: { "92": "Assigned by Buyer", "91": "Assigned by Seller", ZZ: "Mutually Defined", UL: "GLN" } },
          { ref: "N104", name: "Identification Code", mandatory: false },
        ],
        children: [
          {
            tag: "N3",
            name: "Address Information",
            mandatory: false,
            repeatable: false,
            elements: [
              { ref: "N301", name: "Address Line 1", mandatory: false },
              { ref: "N302", name: "Address Line 2", mandatory: false },
            ],
          },
          {
            tag: "N4",
            name: "Geographic Location",
            mandatory: false,
            repeatable: false,
            elements: [
              { ref: "N401", name: "City", mandatory: false },
              { ref: "N402", name: "State", mandatory: false },
              { ref: "N403", name: "Postal Code", mandatory: false },
              { ref: "N404", name: "Country Code", mandatory: false },
            ],
          },
        ],
      },
      {
        tag: "PO1",
        name: "Baseline Item Data",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "PO101", name: "Line Number", mandatory: false },
          { ref: "PO102", name: "Quantity Ordered", mandatory: true },
          { ref: "PO103", name: "Unit of Measure", mandatory: true, codes: { EA: "Each", CA: "Case", DZ: "Dozen", LB: "Pound", PK: "Package", CT: "Carton" } },
          { ref: "PO104", name: "Unit Price", mandatory: true },
          { ref: "PO105", name: "Basis of Unit Price Code", mandatory: false, codes: { PE: "Price per Each", CT: "Price per Contract" } },
          { ref: "PO106", name: "Product/Service ID Qualifier (1)", mandatory: false, codes: { VN: "Vendor's Item Number", UP: "UPC", EN: "EAN", SK: "SKU", IN: "Buyer's Item Number" } },
          { ref: "PO107", name: "Product/Service ID (1)", mandatory: false },
          { ref: "PO108", name: "Product/Service ID Qualifier (2)", mandatory: false, codes: { VN: "Vendor's Item Number", UP: "UPC", EN: "EAN", SK: "SKU", IN: "Buyer's Item Number" } },
          { ref: "PO109", name: "Product/Service ID (2)", mandatory: false },
        ],
        children: [
          {
            tag: "PID",
            name: "Product/Item Description",
            mandatory: false,
            repeatable: true,
            elements: [
              { ref: "PID01", name: "Description Type", mandatory: true, codes: { F: "Free-form" } },
              { ref: "PID05", name: "Description", mandatory: false },
            ],
          },
        ],
      },
      {
        tag: "CTT",
        name: "Transaction Totals",
        mandatory: false,
        repeatable: false,
        elements: [{ ref: "CTT01", name: "Number of Line Items", mandatory: true }],
      },
    ],
  },

  "855": {
    docType: "855",
    name: "PO Acknowledgment",
    version: "005010",
    segments: [
      {
        tag: "BAK",
        name: "Beginning Segment for Purchase Order Acknowledgment",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BAK01", name: "Transaction Set Purpose Code", mandatory: true, codes: { "00": "Original", "04": "Change", "05": "Replace" } },
          { ref: "BAK02", name: "Acknowledgment Type", mandatory: true, codes: { AC: "Acknowledge - No Detail or Change", AD: "Acknowledge - With Detail and No Change", AK: "Acknowledge, Any Discrepancies Noted", RJ: "Rejected - No Detail" } },
          { ref: "BAK03", name: "Purchase Order Number", mandatory: true },
          { ref: "BAK04", name: "Date (Purchase Order Date)", mandatory: true },
        ],
      },
      {
        tag: "REF",
        name: "Reference Identification",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { DP: "Department Number", CO: "Customer Order Number", VN: "Vendor Order Number" } },
          { ref: "REF02", name: "Reference Identification", mandatory: true },
        ],
      },
      {
        tag: "FOB",
        name: "F.O.B. Related Instructions",
        mandatory: false,
        repeatable: false,
        elements: [{ ref: "FOB01", name: "Shipment Method of Payment", mandatory: true, codes: { CC: "Collect", PP: "Prepaid (by Seller)" } }],
      },
      {
        tag: "DTM",
        name: "Date/Time Reference",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "010": "Requested Ship", "068": "Current Schedule Ship", "118": "Required Delivery" } },
          { ref: "DTM02", name: "Date", mandatory: true },
        ],
      },
      {
        tag: "N1",
        name: "Name (Party Identification)",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "N101", name: "Entity Identifier Code", mandatory: true, codes: { BT: "Bill-to Party", ST: "Ship-to Party", VN: "Vendor" } },
          { ref: "N102", name: "Name", mandatory: false },
        ],
        children: [
          { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
          {
            tag: "N4",
            name: "Geographic Location",
            mandatory: false,
            repeatable: false,
            elements: [
              { ref: "N401", name: "City", mandatory: false },
              { ref: "N402", name: "State", mandatory: false },
              { ref: "N403", name: "Postal Code", mandatory: false },
            ],
          },
        ],
      },
      {
        tag: "PO1",
        name: "Baseline Item Data",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "PO101", name: "Line Number", mandatory: false },
          { ref: "PO102", name: "Quantity Ordered", mandatory: true },
          { ref: "PO103", name: "Unit of Measure", mandatory: true, codes: { EA: "Each", CA: "Case", DZ: "Dozen" } },
          { ref: "PO104", name: "Unit Price", mandatory: true },
          { ref: "PO106", name: "Product/Service ID Qualifier", mandatory: false, codes: { VN: "Vendor's Item Number", UP: "UPC" } },
          { ref: "PO107", name: "Product/Service ID", mandatory: false },
        ],
        children: [
          {
            tag: "ACK",
            name: "Line Item Acknowledgment",
            mandatory: true,
            repeatable: false,
            elements: [
              { ref: "ACK01", name: "Line Item Status Code", mandatory: true, codes: { IA: "Item Accepted", IB: "Item Backordered", IC: "Item Changed", ID: "Item Deleted", IE: "Item Accepted - Changes Made", IR: "Item Rejected" } },
              { ref: "ACK02", name: "Quantity Ordered", mandatory: true },
              { ref: "ACK03", name: "Unit of Measure", mandatory: false, codes: { EA: "Each", CA: "Case", DZ: "Dozen" } },
              { ref: "ACK04", name: "Date (Scheduled for Shipment)", mandatory: false },
            ],
          },
          { tag: "PID", name: "Product/Item Description", mandatory: false, repeatable: true, elements: [{ ref: "PID05", name: "Description", mandatory: false }] },
        ],
      },
      { tag: "CTT", name: "Transaction Totals", mandatory: false, repeatable: false, elements: [{ ref: "CTT01", name: "Number of Line Items", mandatory: true }] },
    ],
  },

  "856": {
    docType: "856",
    name: "Advance Ship Notice",
    version: "005010",
    segments: [
      {
        tag: "BSN",
        name: "Beginning Segment for Ship Notice",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BSN01", name: "Transaction Set Purpose Code", mandatory: true, codes: { "00": "Original", "04": "Change" } },
          { ref: "BSN02", name: "Shipment Identification", mandatory: true },
          { ref: "BSN03", name: "Date", mandatory: true },
          { ref: "BSN04", name: "Time", mandatory: true },
          { ref: "BSN05", name: "Hierarchical Structure Code", mandatory: false, codes: { "0001": "Shipment/Order/Pack/Item", "0002": "Shipment/Order/Item" } },
        ],
      },
      {
        tag: "DTM",
        name: "Date/Time Reference",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "011": "Shipped", "017": "Estimated Delivery", "067": "Current Schedule Delivery" } },
          { ref: "DTM02", name: "Date", mandatory: true },
        ],
      },
      {
        tag: "HL",
        name: "Hierarchical Level (Shipment)",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
          { ref: "HL02", name: "Hierarchical Parent ID Number", mandatory: false },
          { ref: "HL03", name: "Hierarchical Level Code", mandatory: true, codes: { S: "Shipment", O: "Order", P: "Pack", I: "Item" } },
          { ref: "HL04", name: "Hierarchical Child Code", mandatory: false, codes: { "0": "No Subordinate HL Segment", "1": "Has Subordinate HL Segment" } },
        ],
        children: [
          {
            tag: "TD1",
            name: "Carrier Details (Quantity and Weight)",
            mandatory: false,
            repeatable: true,
            elements: [
              { ref: "TD101", name: "Packaging Code", mandatory: false },
              { ref: "TD102", name: "Lading Quantity", mandatory: false },
              { ref: "TD109", name: "Weight", mandatory: false },
              { ref: "TD110", name: "Unit or Basis for Measurement Code", mandatory: false, codes: { LB: "Pound", KG: "Kilogram" } },
            ],
          },
          {
            tag: "TD5",
            name: "Carrier Details (Routing)",
            mandatory: false,
            repeatable: true,
            elements: [
              { ref: "TD501", name: "Routing Sequence Code", mandatory: false, codes: { B: "Origin Carrier", O: "Origin/Delivery Carrier" } },
              { ref: "TD502", name: "Identification Code Qualifier", mandatory: false },
              { ref: "TD503", name: "Identification Code (SCAC)", mandatory: false },
              { ref: "TD504", name: "Transportation Method/Type Code", mandatory: false, codes: { M: "Motor", A: "Air", O: "Ocean", LT: "LTL" } },
            ],
          },
          {
            tag: "REF",
            name: "Reference Identification",
            mandatory: false,
            repeatable: true,
            elements: [
              { ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { CO: "Customer Order Number", BM: "Bill of Lading Number" } },
              { ref: "REF02", name: "Reference Identification", mandatory: true },
            ],
          },
          {
            tag: "N1",
            name: "Name (Party Identification)",
            mandatory: false,
            repeatable: true,
            elements: [{ ref: "N101", name: "Entity Identifier Code", mandatory: true, codes: { SF: "Ship From", ST: "Ship To", BT: "Bill-to Party" } }],
            children: [
              { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
              { tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }, { ref: "N402", name: "State", mandatory: false }] },
            ],
          },
          {
            tag: "HL",
            name: "Hierarchical Level (Item)",
            mandatory: false,
            repeatable: true,
            elements: [
              { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
              { ref: "HL02", name: "Hierarchical Parent ID Number", mandatory: true },
              { ref: "HL03", name: "Hierarchical Level Code", mandatory: true, codes: { I: "Item" } },
            ],
            children: [
              {
                tag: "LIN",
                name: "Item Identification",
                mandatory: true,
                repeatable: false,
                elements: [
                  { ref: "LIN01", name: "Assigned Identification", mandatory: false },
                  { ref: "LIN02", name: "Product/Service ID Qualifier", mandatory: true, codes: { VN: "Vendor's Item Number", UP: "UPC" } },
                  { ref: "LIN03", name: "Product/Service ID", mandatory: true },
                ],
              },
              {
                tag: "SN1",
                name: "Item Detail (Shipment)",
                mandatory: true,
                repeatable: false,
                elements: [
                  { ref: "SN101", name: "Assigned Identification", mandatory: false },
                  { ref: "SN102", name: "Number of Units Shipped", mandatory: true },
                  { ref: "SN103", name: "Unit or Basis for Measurement Code", mandatory: true, codes: { EA: "Each", CA: "Case" } },
                  { ref: "SN104", name: "Quantity Ordered", mandatory: false },
                ],
              },
              { tag: "PID", name: "Product/Item Description", mandatory: false, repeatable: true, elements: [{ ref: "PID05", name: "Description", mandatory: false }] },
            ],
          },
        ],
      },
      { tag: "CTT", name: "Transaction Totals", mandatory: false, repeatable: false, elements: [{ ref: "CTT01", name: "Number of Line Items", mandatory: true }] },
    ],
  },

  "810": {
    docType: "810",
    name: "Invoice",
    version: "005010",
    segments: [
      {
        tag: "BIG",
        name: "Beginning Segment for Invoice",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BIG01", name: "Invoice Date", mandatory: true },
          { ref: "BIG02", name: "Invoice Number", mandatory: true },
          { ref: "BIG03", name: "Purchase Order Date", mandatory: false },
          { ref: "BIG04", name: "Purchase Order Number", mandatory: false },
          { ref: "BIG07", name: "Transaction Type Code", mandatory: false, codes: { DR: "Debit Memo/Invoice", CR: "Credit Memo" } },
        ],
      },
      {
        tag: "CUR",
        name: "Currency",
        mandatory: false,
        repeatable: false,
        elements: [{ ref: "CUR01", name: "Entity Identifier Code", mandatory: true, codes: { BY: "Buying Party", SE: "Selling Party" } }, { ref: "CUR02", name: "Currency Code", mandatory: true, codes: { USD: "US Dollar" } }],
      },
      {
        tag: "REF",
        name: "Reference Identification",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { VN: "Vendor Order Number", CO: "Customer Order Number" } },
          { ref: "REF02", name: "Reference Identification", mandatory: true },
        ],
      },
      { tag: "ITD", name: "Terms of Sale", mandatory: false, repeatable: true, elements: [{ ref: "ITD01", name: "Terms Type Code", mandatory: false, codes: { "01": "Basic", "08": "Basic Discount Offered" } }, { ref: "ITD07", name: "Terms Net Days Due", mandatory: false }] },
      {
        tag: "DTM",
        name: "Date/Time Reference",
        mandatory: false,
        repeatable: true,
        elements: [{ ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "011": "Shipped", "073": "Invoice" } }, { ref: "DTM02", name: "Date", mandatory: true }],
      },
      {
        tag: "N1",
        name: "Name (Party Identification)",
        mandatory: false,
        repeatable: true,
        elements: [{ ref: "N101", name: "Entity Identifier Code", mandatory: true, codes: { BT: "Bill-to Party", ST: "Ship-to Party", RE: "Remit To" } }, { ref: "N102", name: "Name", mandatory: false }],
        children: [
          { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
          { tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }, { ref: "N402", name: "State", mandatory: false }] },
        ],
      },
      {
        tag: "IT1",
        name: "Baseline Item Data (Invoice)",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "IT101", name: "Assigned Identification", mandatory: false },
          { ref: "IT102", name: "Quantity Invoiced", mandatory: true },
          { ref: "IT103", name: "Unit of Measure", mandatory: true, codes: { EA: "Each", CA: "Case", LB: "Pound" } },
          { ref: "IT104", name: "Unit Price", mandatory: true },
          { ref: "IT106", name: "Product/Service ID Qualifier", mandatory: false, codes: { VN: "Vendor's Item Number", UP: "UPC" } },
          { ref: "IT107", name: "Product/Service ID", mandatory: false },
        ],
        children: [
          { tag: "PID", name: "Product/Item Description", mandatory: false, repeatable: true, elements: [{ ref: "PID05", name: "Description", mandatory: false }] },
          {
            tag: "TXI",
            name: "Tax Information",
            mandatory: false,
            repeatable: true,
            elements: [{ ref: "TXI01", name: "Tax Type Code", mandatory: true, codes: { ST: "State Sales Tax", GT: "Goods and Services Tax", CT: "County Tax" } }, { ref: "TXI02", name: "Monetary Amount", mandatory: false }],
          },
        ],
      },
      { tag: "TDS", name: "Total Monetary Value Summary", mandatory: true, repeatable: false, elements: [{ ref: "TDS01", name: "Amount (Total Invoice Amount)", mandatory: true }] },
      { tag: "CTT", name: "Transaction Totals", mandatory: false, repeatable: false, elements: [{ ref: "CTT01", name: "Number of Line Items", mandatory: true }] },
    ],
  },

  "820": {
    docType: "820",
    name: "Payment Order/Remittance Advice",
    version: "005010",
    segments: [
      {
        tag: "BPR",
        name: "Beginning Segment for Payment Order/Remittance Advice",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BPR01", name: "Transaction Handling Code", mandatory: true, codes: { C: "Payment Accompanies Remittance Advice", D: "Make Payment Only", I: "Remittance Information Only", U: "Split Payment and Remittance" } },
          { ref: "BPR02", name: "Monetary Amount", mandatory: true },
          { ref: "BPR03", name: "Credit/Debit Flag Code", mandatory: true, codes: { C: "Credit", D: "Debit" } },
          { ref: "BPR04", name: "Payment Method Code", mandatory: true, codes: { ACH: "Automated Clearing House", CHK: "Check", FWT: "Federal Reserve Wire Transfer", BOP: "Financial Institution Option" } },
          { ref: "BPR05", name: "Payment Format Code", mandatory: false },
        ],
      },
      {
        tag: "TRN",
        name: "Trace Number",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "TRN01", name: "Trace Type Code", mandatory: true, codes: { "1": "Current Transaction Trace Numbers" } },
          { ref: "TRN02", name: "Reference Identification (Trace Number)", mandatory: true },
          { ref: "TRN03", name: "Originating Company Identifier", mandatory: false },
        ],
      },
      { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { CK: "Check Number" } }, { ref: "REF02", name: "Reference Identification", mandatory: true }] },
      { tag: "DTM", name: "Date/Time Reference", mandatory: false, repeatable: true, elements: [{ ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "097": "Check/Remittance" } }, { ref: "DTM02", name: "Date", mandatory: true }] },
      {
        tag: "N1",
        name: "Name (Payer/Payee)",
        mandatory: false,
        repeatable: true,
        elements: [{ ref: "N101", name: "Entity Identifier Code", mandatory: true, codes: { PR: "Payer", PE: "Payee" } }, { ref: "N102", name: "Name", mandatory: false }],
        children: [
          { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
          { tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }, { ref: "N402", name: "State", mandatory: false }] },
        ],
      },
      {
        tag: "ENT",
        name: "Entity",
        mandatory: false,
        repeatable: true,
        elements: [{ ref: "ENT01", name: "Assigned Number", mandatory: true }],
        children: [
          {
            tag: "RMR",
            name: "Remittance Advice Accounts Receivable Open Item Reference",
            mandatory: true,
            repeatable: true,
            elements: [
              { ref: "RMR01", name: "Reference Identification Qualifier", mandatory: true, codes: { IV: "Invoice Number", PO: "Purchase Order Number" } },
              { ref: "RMR02", name: "Reference Identification", mandatory: true },
              { ref: "RMR04", name: "Monetary Amount (Payment)", mandatory: false },
              { ref: "RMR05", name: "Monetary Amount (Discount Taken)", mandatory: false },
            ],
            children: [
              { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF02", name: "Reference Identification", mandatory: true }] },
              { tag: "DTM", name: "Date/Time Reference", mandatory: false, repeatable: false, elements: [{ ref: "DTM02", name: "Date", mandatory: true }] },
            ],
          },
        ],
      },
    ],
  },

  "846": {
    docType: "846",
    name: "Inventory Advice",
    version: "005010",
    segments: [
      {
        tag: "BIA",
        name: "Beginning Segment for Inventory Inquiry/Advice",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BIA01", name: "Transaction Set Purpose Code", mandatory: true, codes: { "00": "Original", "04": "Change" } },
          { ref: "BIA02", name: "Report Type Code", mandatory: true, codes: { AD: "Advice", CH: "Change" } },
          { ref: "BIA03", name: "Action Code", mandatory: false, codes: { CO: "Confirmation", DA: "Data Advisory" } },
          { ref: "BIA04", name: "Date", mandatory: true },
        ],
      },
      { tag: "DTM", name: "Date/Time Reference", mandatory: false, repeatable: true, elements: [{ ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "196": "Inventory Report" } }, { ref: "DTM02", name: "Date", mandatory: true }] },
      {
        tag: "N1",
        name: "Name (Party Identification)",
        mandatory: false,
        repeatable: true,
        elements: [{ ref: "N101", name: "Entity Identifier Code", mandatory: true, codes: { SU: "Supplier/Manufacturer", WH: "Warehouse" } }],
        children: [{ tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }] }],
      },
      {
        tag: "LIN",
        name: "Item Identification",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "LIN01", name: "Assigned Identification", mandatory: false },
          { ref: "LIN02", name: "Product/Service ID Qualifier", mandatory: true, codes: { VN: "Vendor's Item Number", UP: "UPC", SK: "SKU" } },
          { ref: "LIN03", name: "Product/Service ID", mandatory: true },
        ],
        children: [
          { tag: "UIT", name: "Unit Detail", mandatory: false, repeatable: false, elements: [{ ref: "UIT02", name: "Unit Price", mandatory: false }] },
          {
            tag: "QTY",
            name: "Quantity",
            mandatory: true,
            repeatable: true,
            elements: [
              { ref: "QTY01", name: "Quantity Qualifier", mandatory: true, codes: { "33": "On Hand Quantity Available", "42": "Available Inventory", QS: "Quantity Scheduled" } },
              { ref: "QTY02", name: "Quantity", mandatory: true },
            ],
          },
          { tag: "PID", name: "Product/Item Description", mandatory: false, repeatable: true, elements: [{ ref: "PID05", name: "Description", mandatory: false }] },
        ],
      },
      { tag: "CTT", name: "Transaction Totals", mandatory: false, repeatable: false, elements: [{ ref: "CTT01", name: "Number of Line Items", mandatory: true }] },
    ],
  },

  "997": {
    docType: "997",
    name: "Functional Acknowledgment",
    version: "005010",
    segments: [
      {
        tag: "AK1",
        name: "Functional Group Response Header",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "AK101", name: "Functional Identifier Code", mandatory: true },
          { ref: "AK102", name: "Group Control Number", mandatory: true },
        ],
      },
      {
        tag: "AK2",
        name: "Transaction Set Response Header",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "AK201", name: "Transaction Set Identifier Code", mandatory: true },
          { ref: "AK202", name: "Transaction Set Control Number", mandatory: true },
        ],
        children: [
          {
            tag: "AK3",
            name: "Error Identification",
            mandatory: false,
            repeatable: true,
            elements: [
              { ref: "AK301", name: "Segment ID Code", mandatory: true },
              { ref: "AK302", name: "Segment Position in Transaction Set", mandatory: true },
              { ref: "AK304", name: "Segment Syntax Error Code", mandatory: false, codes: { "1": "Unrecognized Segment ID", "2": "Unexpected Segment", "8": "Segment Has Data Element Errors" } },
            ],
            children: [
              {
                tag: "AK4",
                name: "Data Element Note",
                mandatory: false,
                repeatable: true,
                elements: [
                  { ref: "AK403", name: "Data Element Syntax Error Code", mandatory: true, codes: { "1": "Mandatory Data Element Missing", "3": "Too Many Data Elements", "6": "Invalid Character in Data Element" } },
                  { ref: "AK404", name: "Copy of Bad Data Element", mandatory: false },
                ],
              },
            ],
          },
          {
            tag: "AK5",
            name: "Transaction Set Response Trailer",
            mandatory: true,
            repeatable: false,
            elements: [{ ref: "AK501", name: "Transaction Set Acknowledgment Code", mandatory: true, codes: { A: "Accepted", E: "Accepted But Errors Noted", R: "Rejected" } }],
          },
        ],
      },
      {
        tag: "AK9",
        name: "Functional Group Response Trailer",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "AK901", name: "Functional Group Acknowledge Code", mandatory: true, codes: { A: "Accepted", E: "Accepted, But Errors Were Noted", P: "Partially Accepted, At Least One Transaction Set Was Rejected", R: "Rejected" } },
          { ref: "AK902", name: "Number of Transaction Sets Included", mandatory: true },
          { ref: "AK903", name: "Number of Received Transaction Sets", mandatory: true },
          { ref: "AK904", name: "Number of Accepted Transaction Sets", mandatory: true },
        ],
      },
    ],
  },

  "999": {
    docType: "999",
    name: "Implementation Acknowledgment",
    version: "005010",
    segments: [
      {
        tag: "AK1",
        name: "Functional Group Response Header",
        mandatory: true,
        repeatable: false,
        elements: [{ ref: "AK101", name: "Functional Identifier Code", mandatory: true }, { ref: "AK102", name: "Group Control Number", mandatory: true }],
      },
      {
        tag: "AK2",
        name: "Transaction Set Response Header",
        mandatory: false,
        repeatable: true,
        elements: [{ ref: "AK201", name: "Transaction Set Identifier Code", mandatory: true }, { ref: "AK202", name: "Transaction Set Control Number", mandatory: true }],
        children: [
          {
            tag: "IK3",
            name: "Implementation Error Identification",
            mandatory: false,
            repeatable: true,
            elements: [
              { ref: "IK301", name: "Segment ID Code", mandatory: true },
              { ref: "IK302", name: "Segment Position in Transaction Set", mandatory: true },
              { ref: "IK304", name: "Implementation Segment Syntax Error Code", mandatory: false, codes: { "1": "Unrecognized Segment ID", I6: "Implementation 'Not Used' Segment Present", I7: "Implementation Loop Occurs Over Maximum Times" } },
            ],
            children: [
              { tag: "CTX", name: "Context", mandatory: false, repeatable: true, elements: [{ ref: "CTX02", name: "Context Segment Position in Transaction Set", mandatory: false }] },
              {
                tag: "IK4",
                name: "Implementation Data Element Note",
                mandatory: false,
                repeatable: true,
                elements: [
                  { ref: "IK403", name: "Implementation Data Element Syntax Error Code", mandatory: true, codes: { "1": "Mandatory Data Element Missing", I10: "Implementation Too Many Repetitions", I12: "Implementation Dependent Element Missing" } },
                  { ref: "IK404", name: "Copy of Bad Data Element", mandatory: false },
                ],
              },
            ],
          },
          {
            tag: "IK5",
            name: "Implementation Transaction Set Response Trailer",
            mandatory: true,
            repeatable: false,
            elements: [{ ref: "IK501", name: "Transaction Set Acknowledgment Code", mandatory: true, codes: { A: "Accepted", E: "Accepted But Errors Noted", M: "Rejected, Message Authentication Code Failed", R: "Rejected", W: "Rejected, Assurance Failed Validity Tests", X: "Rejected, Content After Decryption Could Not Be Analyzed" } }],
          },
        ],
      },
      {
        tag: "AK9",
        name: "Functional Group Response Trailer",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "AK901", name: "Functional Group Acknowledge Code", mandatory: true, codes: { A: "Accepted", E: "Accepted, But Errors Were Noted", P: "Partially Accepted, At Least One Transaction Set Was Rejected", R: "Rejected" } },
          { ref: "AK902", name: "Number of Transaction Sets Included", mandatory: true },
          { ref: "AK903", name: "Number of Received Transaction Sets", mandatory: true },
          { ref: "AK904", name: "Number of Accepted Transaction Sets", mandatory: true },
        ],
      },
    ],
  },

  "270": {
    docType: "270",
    name: "Eligibility Inquiry",
    version: "005010X279A1",
    segments: [
      {
        tag: "BHT",
        name: "Beginning of Hierarchical Transaction",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BHT01", name: "Hierarchical Structure Code", mandatory: true, codes: { "0022": "Information Source/Receiver/Subscriber/Dependent" } },
          { ref: "BHT02", name: "Transaction Set Purpose Code", mandatory: true, codes: { "13": "Request" } },
          { ref: "BHT03", name: "Reference Identification", mandatory: false },
          { ref: "BHT04", name: "Date", mandatory: true },
          { ref: "BHT06", name: "Transaction Type Code", mandatory: false, codes: { RT: "Real Time" } },
        ],
      },
      {
        tag: "HL",
        name: "Hierarchical Level",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
          { ref: "HL02", name: "Hierarchical Parent ID Number", mandatory: false },
          { ref: "HL03", name: "Hierarchical Level Code", mandatory: true, codes: { "20": "Information Source", "21": "Information Receiver", "22": "Subscriber", "23": "Dependent" } },
        ],
        children: [
          {
            tag: "NM1",
            name: "Individual or Organizational Name",
            mandatory: true,
            repeatable: false,
            elements: [
              { ref: "NM101", name: "Entity Identifier Code", mandatory: true, codes: { PR: "Payer", "1P": "Provider", IL: "Insured or Subscriber", "03": "Dependent" } },
              { ref: "NM102", name: "Entity Type Qualifier", mandatory: true, codes: { "1": "Person", "2": "Non-Person Entity" } },
              { ref: "NM103", name: "Name Last or Organization Name", mandatory: false },
              { ref: "NM104", name: "Name First", mandatory: false },
              { ref: "NM108", name: "Identification Code Qualifier", mandatory: false, codes: { MI: "Member ID", XX: "NPI" } },
              { ref: "NM109", name: "Identification Code", mandatory: false },
            ],
          },
          { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { "1L": "Group Number" } }, { ref: "REF02", name: "Reference Identification", mandatory: true }] },
          { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
          { tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }, { ref: "N402", name: "State", mandatory: false }] },
          { tag: "DMG", name: "Demographic Information", mandatory: false, repeatable: false, elements: [{ ref: "DMG01", name: "Date Time Period Format Qualifier", mandatory: false, codes: { D8: "CCYYMMDD" } }, { ref: "DMG02", name: "Date Time Period (DOB)", mandatory: false }, { ref: "DMG03", name: "Gender Code", mandatory: false, codes: { F: "Female", M: "Male", U: "Unknown" } }] },
          { tag: "DTP", name: "Date or Time or Period", mandatory: false, repeatable: true, elements: [{ ref: "DTP01", name: "Date/Time Qualifier", mandatory: true, codes: { "291": "Plan", "307": "Eligibility" } }, { ref: "DTP02", name: "Date Time Period Format Qualifier", mandatory: true, codes: { D8: "CCYYMMDD", RD8: "Range of Dates" } }, { ref: "DTP03", name: "Date Time Period", mandatory: true }] },
          {
            tag: "EQ",
            name: "Eligibility or Benefit Inquiry",
            mandatory: true,
            repeatable: true,
            elements: [
              { ref: "EQ01", name: "Service Type Code", mandatory: true, codes: { "30": "Health Benefit Plan Coverage", "1": "Medical Care", "88": "Pharmacy", "98": "Professional (Physician) Visit - Office", "35": "Dental Care", MH: "Mental Health" } },
              { ref: "EQ02", name: "Composite Medical Procedure Identifier", mandatory: false },
            ],
          },
        ],
      },
    ],
  },

  "271": {
    docType: "271",
    name: "Eligibility Response",
    version: "005010X279A1",
    segments: [
      {
        tag: "BHT",
        name: "Beginning of Hierarchical Transaction",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BHT01", name: "Hierarchical Structure Code", mandatory: true, codes: { "0022": "Information Source/Receiver/Subscriber/Dependent" } },
          { ref: "BHT02", name: "Transaction Set Purpose Code", mandatory: true, codes: { "11": "Response" } },
          { ref: "BHT04", name: "Date", mandatory: true },
        ],
      },
      {
        tag: "HL",
        name: "Hierarchical Level",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
          { ref: "HL02", name: "Hierarchical Parent ID Number", mandatory: false },
          { ref: "HL03", name: "Hierarchical Level Code", mandatory: true, codes: { "20": "Information Source", "21": "Information Receiver", "22": "Subscriber", "23": "Dependent" } },
        ],
        children: [
          {
            tag: "NM1",
            name: "Individual or Organizational Name",
            mandatory: true,
            repeatable: false,
            elements: [
              { ref: "NM101", name: "Entity Identifier Code", mandatory: true, codes: { PR: "Payer", "1P": "Provider", IL: "Insured or Subscriber" } },
              { ref: "NM108", name: "Identification Code Qualifier", mandatory: false, codes: { MI: "Member ID" } },
              { ref: "NM109", name: "Identification Code", mandatory: false },
            ],
          },
          { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF02", name: "Reference Identification", mandatory: true }] },
          { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
          { tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }] },
          { tag: "DMG", name: "Demographic Information", mandatory: false, repeatable: false, elements: [{ ref: "DMG02", name: "Date Time Period (DOB)", mandatory: false }, { ref: "DMG03", name: "Gender Code", mandatory: false, codes: { F: "Female", M: "Male" } }] },
          { tag: "DTP", name: "Date or Time or Period", mandatory: false, repeatable: true, elements: [{ ref: "DTP01", name: "Date/Time Qualifier", mandatory: true, codes: { "291": "Plan" } }, { ref: "DTP03", name: "Date Time Period", mandatory: true }] },
          {
            tag: "EB",
            name: "Eligibility or Benefit Information",
            mandatory: true,
            repeatable: true,
            elements: [
              { ref: "EB01", name: "Eligibility or Benefit Information Code", mandatory: true, codes: { "1": "Active Coverage", "6": "Inactive", A: "Co-Insurance", B: "Co-Payment", C: "Deductible", F: "Limitations", I: "Non-Covered" } },
              { ref: "EB02", name: "Coverage Level Code", mandatory: false, codes: { IND: "Individual", FAM: "Family", ESP: "Employee and Spouse" } },
              { ref: "EB03", name: "Service Type Code", mandatory: false, codes: { "30": "Health Benefit Plan Coverage", "88": "Pharmacy", "98": "Professional (Physician) Visit - Office" } },
              { ref: "EB04", name: "Insurance Type Code", mandatory: false, codes: { HM: "HMO", PR: "PPO", MC: "Medicaid" } },
              { ref: "EB05", name: "Plan Coverage Description", mandatory: false },
              { ref: "EB06", name: "Time Period Qualifier", mandatory: false, codes: { "6": "Hour", "7": "Day", "22": "Visit", "23": "Remaining", "24": "Service Year", "25": "Calendar Year" } },
              { ref: "EB07", name: "Monetary Amount", mandatory: false },
              { ref: "EB08", name: "Percent", mandatory: false },
            ],
            children: [{ tag: "MSG", name: "Message Text", mandatory: false, repeatable: true, elements: [{ ref: "MSG01", name: "Free-Form Message Text", mandatory: true }] }],
          },
        ],
      },
    ],
  },

  "276": {
    docType: "276",
    name: "Claim Status Inquiry",
    version: "005010X212",
    segments: [
      {
        tag: "BHT",
        name: "Beginning of Hierarchical Transaction",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BHT01", name: "Hierarchical Structure Code", mandatory: true, codes: { "0010": "Information Source/Receiver/Provider/Subscriber/Dependent" } },
          { ref: "BHT02", name: "Transaction Set Purpose Code", mandatory: true, codes: { "13": "Request" } },
          { ref: "BHT04", name: "Date", mandatory: true },
        ],
      },
      {
        tag: "HL",
        name: "Hierarchical Level",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
          { ref: "HL02", name: "Hierarchical Parent ID Number", mandatory: false },
          { ref: "HL03", name: "Hierarchical Level Code", mandatory: true, codes: { "20": "Information Source", "21": "Information Receiver", "19": "Provider of Service", "22": "Subscriber", "23": "Dependent" } },
        ],
        children: [
          {
            tag: "NM1",
            name: "Individual or Organizational Name",
            mandatory: true,
            repeatable: false,
            elements: [
              { ref: "NM101", name: "Entity Identifier Code", mandatory: true, codes: { PR: "Payer", "1P": "Provider", "41": "Submitter", IL: "Insured", QC: "Patient" } },
              { ref: "NM108", name: "Identification Code Qualifier", mandatory: false, codes: { MI: "Member ID", XX: "NPI" } },
              { ref: "NM109", name: "Identification Code", mandatory: false },
            ],
          },
          { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF02", name: "Reference Identification", mandatory: true }] },
          {
            tag: "TRN",
            name: "Trace Number",
            mandatory: true,
            repeatable: false,
            elements: [
              { ref: "TRN01", name: "Trace Type Code", mandatory: true, codes: { "1": "Current Transaction Trace Numbers", "2": "Referenced Transaction Trace Numbers" } },
              { ref: "TRN02", name: "Reference Identification", mandatory: true },
            ],
            children: [
              { tag: "REF", name: "Reference Identification (Claim Identifiers)", mandatory: false, repeatable: true, elements: [{ ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { "1K": "Payer's Claim Number", BLT: "Billing Type", EA: "Medical Record Identification Number" } }, { ref: "REF02", name: "Reference Identification", mandatory: true }] },
              { tag: "AMT", name: "Monetary Amount", mandatory: false, repeatable: false, elements: [{ ref: "AMT01", name: "Amount Qualifier Code", mandatory: true, codes: { T3: "Total Claim Charge Amount" } }, { ref: "AMT02", name: "Monetary Amount", mandatory: true }] },
              { tag: "DTM", name: "Date/Time Reference", mandatory: false, repeatable: true, elements: [{ ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "232": "Claim Statement Period Start", "233": "Claim Statement Period End" } }, { ref: "DTM02", name: "Date", mandatory: true }] },
            ],
          },
        ],
      },
    ],
  },

  "277": {
    docType: "277",
    name: "Claim Status Response",
    version: "005010X212",
    segments: [
      {
        tag: "BHT",
        name: "Beginning of Hierarchical Transaction",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BHT01", name: "Hierarchical Structure Code", mandatory: true, codes: { "0010": "Information Source/Receiver/Provider/Subscriber/Dependent" } },
          { ref: "BHT02", name: "Transaction Set Purpose Code", mandatory: true, codes: { "08": "Status" } },
          { ref: "BHT04", name: "Date", mandatory: true },
        ],
      },
      {
        tag: "HL",
        name: "Hierarchical Level",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
          { ref: "HL03", name: "Hierarchical Level Code", mandatory: true, codes: { "20": "Information Source", "21": "Information Receiver", "19": "Provider of Service", "22": "Subscriber" } },
        ],
        children: [
          { tag: "NM1", name: "Individual or Organizational Name", mandatory: true, repeatable: false, elements: [{ ref: "NM101", name: "Entity Identifier Code", mandatory: true, codes: { PR: "Payer", QC: "Patient" } }, { ref: "NM109", name: "Identification Code", mandatory: false }] },
          { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF02", name: "Reference Identification", mandatory: true }] },
          {
            tag: "STC",
            name: "Status Information",
            mandatory: true,
            repeatable: true,
            elements: [
              { ref: "STC01", name: "Health Care Claim Status (composite)", mandatory: true },
              { ref: "STC02", name: "Date", mandatory: true },
              { ref: "STC03", name: "Action Code", mandatory: false, codes: { U: "Do Not Resubmit", WQ: "Resubmit as Adjustment/Corrected Claim", RU: "Resubmission Allowed" } },
              { ref: "STC04", name: "Monetary Amount (Total Claim Charge)", mandatory: false },
              { ref: "STC05", name: "Monetary Amount (Payment)", mandatory: false },
              { ref: "STC10", name: "Reference Identification (Payer Claim Control Number)", mandatory: false },
            ],
            children: [
              {
                tag: "SVC",
                name: "Service Line Information",
                mandatory: false,
                repeatable: true,
                elements: [
                  { ref: "SVC01", name: "Composite Medical Procedure Identifier", mandatory: true },
                  { ref: "SVC02", name: "Monetary Amount (Line Item Charge)", mandatory: true },
                  { ref: "SVC03", name: "Monetary Amount (Line Item Payment)", mandatory: false },
                  { ref: "SVC04", name: "Product/Service ID", mandatory: false },
                ],
              },
            ],
          },
        ],
      },
    ],
  },

  "278": {
    docType: "278",
    name: "Health Care Services Review (Referral/Auth)",
    version: "005010X217",
    segments: [
      {
        tag: "BHT",
        name: "Beginning of Hierarchical Transaction",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BHT01", name: "Hierarchical Structure Code", mandatory: true, codes: { "0078": "UMO/Requester/Subscriber/Patient" } },
          { ref: "BHT02", name: "Transaction Set Purpose Code", mandatory: true, codes: { "13": "Request", "11": "Response" } },
          { ref: "BHT04", name: "Date", mandatory: true },
          { ref: "BHT06", name: "Transaction Type Code", mandatory: false, codes: { CH: "Certify Health Services", RU: "Reissue Response" } },
        ],
      },
      {
        tag: "HL",
        name: "Hierarchical Level",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
          { ref: "HL02", name: "Hierarchical Parent ID Number", mandatory: false },
          { ref: "HL03", name: "Hierarchical Level Code", mandatory: true, codes: { "20": "Utilization Management Organization", "21": "Requester", "22": "Subscriber", "23": "Dependent" } },
        ],
        children: [
          { tag: "NM1", name: "Individual or Organizational Name", mandatory: true, repeatable: false, elements: [{ ref: "NM101", name: "Entity Identifier Code", mandatory: true, codes: { X3: "Utilization Management Organization", "1P": "Provider", IL: "Insured" } }, { ref: "NM109", name: "Identification Code", mandatory: false }] },
          { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF02", name: "Reference Identification", mandatory: true }] },
          { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
          { tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }] },
          {
            tag: "UM",
            name: "Health Care Services Review Information",
            mandatory: true,
            repeatable: false,
            elements: [
              { ref: "UM01", name: "Request Category Code", mandatory: true, codes: { AR: "Admission Review", HS: "Health Services Review", SC: "Specialty Care Review", IN: "Initial" } },
              { ref: "UM02", name: "Certification Type Code", mandatory: true, codes: { I: "Initial", R: "Renewal", S: "Revised" } },
              { ref: "UM03", name: "Service Type Code", mandatory: false, codes: { "1": "Medical Care", "98": "Professional (Physician) Visit - Office" } },
              { ref: "UM04", name: "Health Care Service Location Information", mandatory: false },
            ],
          },
          { tag: "HI", name: "Health Care Information Codes (Diagnosis)", mandatory: false, repeatable: false, elements: [{ ref: "HI01", name: "Health Care Code Information (composite)", mandatory: true }] },
          { tag: "DTP", name: "Date or Time or Period", mandatory: false, repeatable: true, elements: [{ ref: "DTP01", name: "Date/Time Qualifier", mandatory: true, codes: { "472": "Service", "435": "Admission" } }, { ref: "DTP03", name: "Date Time Period", mandatory: true }] },
        ],
      },
    ],
  },

  "835": {
    docType: "835",
    name: "Remittance Advice",
    version: "005010X221",
    segments: [
      {
        tag: "BPR",
        name: "Beginning Segment for Payment Order/Remittance Advice",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BPR01", name: "Transaction Handling Code", mandatory: true, codes: { C: "Payment Accompanies Remittance Advice", D: "Make Payment Only", I: "Remittance Information Only" } },
          { ref: "BPR02", name: "Monetary Amount", mandatory: true },
          { ref: "BPR03", name: "Credit/Debit Flag Code", mandatory: true, codes: { C: "Credit", D: "Debit" } },
          { ref: "BPR04", name: "Payment Method Code", mandatory: true, codes: { ACH: "Automated Clearing House", CHK: "Check", NON: "Non-Payment Data" } },
        ],
      },
      {
        tag: "TRN",
        name: "Trace Number",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "TRN01", name: "Trace Type Code", mandatory: true, codes: { "1": "Current Transaction Trace Numbers" } },
          { ref: "TRN02", name: "Reference Identification (Reassociation Trace Number)", mandatory: true },
        ],
      },
      { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { EV: "Receiver Identification Number", F2: "Version Code - Local" } }, { ref: "REF02", name: "Reference Identification", mandatory: true }] },
      { tag: "DTM", name: "Date/Time Reference", mandatory: false, repeatable: true, elements: [{ ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "405": "Production" } }, { ref: "DTM02", name: "Date", mandatory: true }] },
      {
        tag: "N1",
        name: "Name (Payer/Payee)",
        mandatory: false,
        repeatable: true,
        elements: [{ ref: "N101", name: "Entity Identifier Code", mandatory: true, codes: { PR: "Payer", PE: "Payee" } }, { ref: "N102", name: "Name", mandatory: false }],
        children: [
          { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
          { tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }] },
          { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF02", name: "Reference Identification", mandatory: true }] },
          { tag: "PER", name: "Administrative Communications Contact", mandatory: false, repeatable: false, elements: [{ ref: "PER02", name: "Name", mandatory: false }, { ref: "PER04", name: "Communication Number", mandatory: false }] },
        ],
      },
      {
        tag: "CLP",
        name: "Claim Payment Information",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "CLP01", name: "Patient Control Number", mandatory: true },
          { ref: "CLP02", name: "Claim Status Code", mandatory: true, codes: { "1": "Processed as Primary", "2": "Processed as Secondary", "4": "Denied", "22": "Reversal of Previous Payment" } },
          { ref: "CLP03", name: "Monetary Amount (Total Claim Charge)", mandatory: true },
          { ref: "CLP04", name: "Monetary Amount (Claim Payment)", mandatory: true },
          { ref: "CLP05", name: "Monetary Amount (Patient Responsibility)", mandatory: false },
          { ref: "CLP06", name: "Claim Filing Indicator Code", mandatory: false, codes: { "12": "PPO", MB: "Medicare Part B", MC: "Medicaid" } },
          { ref: "CLP07", name: "Reference Identification (Payer Claim Control Number)", mandatory: false },
        ],
        children: [
          { tag: "NM1", name: "Individual or Organizational Name", mandatory: false, repeatable: true, elements: [{ ref: "NM101", name: "Entity Identifier Code", mandatory: true, codes: { QC: "Patient", IL: "Insured", "82": "Rendering Provider" } }, { ref: "NM109", name: "Identification Code", mandatory: false }] },
          { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { "1K": "Payer's Claim Number" } }, { ref: "REF02", name: "Reference Identification", mandatory: true }] },
          { tag: "DTM", name: "Date/Time Reference", mandatory: false, repeatable: true, elements: [{ ref: "DTM01", name: "Date/Time Qualifier", mandatory: true, codes: { "232": "Statement From", "233": "Statement To" } }, { ref: "DTM02", name: "Date", mandatory: true }] },
          {
            tag: "SVC",
            name: "Service Payment Information",
            mandatory: false,
            repeatable: true,
            elements: [
              { ref: "SVC01", name: "Composite Medical Procedure Identifier", mandatory: true },
              { ref: "SVC02", name: "Monetary Amount (Line Item Charge)", mandatory: true },
              { ref: "SVC03", name: "Monetary Amount (Line Item Payment)", mandatory: true },
              { ref: "SVC05", name: "Quantity", mandatory: false },
            ],
            children: [
              {
                tag: "CAS",
                name: "Claims Adjustment",
                mandatory: false,
                repeatable: true,
                elements: [
                  { ref: "CAS01", name: "Claim Adjustment Group Code", mandatory: true, codes: { CO: "Contractual Obligation", PR: "Patient Responsibility", OA: "Other Adjustment", PI: "Payer Initiated Reductions" } },
                  { ref: "CAS02", name: "Claim Adjustment Reason Code", mandatory: true },
                  { ref: "CAS03", name: "Monetary Amount", mandatory: true },
                ],
              },
            ],
          },
        ],
      },
      {
        tag: "PLB",
        name: "Provider Level Adjustment",
        mandatory: false,
        repeatable: true,
        elements: [
          { ref: "PLB01", name: "Reference Identification (Provider ID)", mandatory: true },
          { ref: "PLB02", name: "Fiscal Period Date", mandatory: true },
          { ref: "PLB03", name: "Adjustment Identifier (composite)", mandatory: true },
          { ref: "PLB04", name: "Monetary Amount", mandatory: true },
        ],
      },
    ],
  },

  "837": {
    docType: "837",
    name: "Health Care Claim",
    version: "005010X222/X223/X224",
    segments: [
      {
        tag: "BHT",
        name: "Beginning of Hierarchical Transaction",
        mandatory: true,
        repeatable: false,
        elements: [
          { ref: "BHT01", name: "Hierarchical Structure Code", mandatory: true, codes: { "0019": "Billing/Pay-to Provider" } },
          { ref: "BHT02", name: "Transaction Set Purpose Code", mandatory: true, codes: { "00": "Original", "18": "Reissue" } },
          { ref: "BHT03", name: "Reference Identification (Submitter Transaction ID)", mandatory: true },
          { ref: "BHT04", name: "Date", mandatory: true },
          { ref: "BHT06", name: "Transaction Type Code", mandatory: true, codes: { CH: "Chargeable", RP: "Reporting" } },
        ],
      },
      {
        tag: "HL",
        name: "Hierarchical Level",
        mandatory: true,
        repeatable: true,
        elements: [
          { ref: "HL01", name: "Hierarchical ID Number", mandatory: true },
          { ref: "HL02", name: "Hierarchical Parent ID Number", mandatory: false },
          { ref: "HL03", name: "Hierarchical Level Code", mandatory: true, codes: { "20": "Billing Provider", "22": "Subscriber", "23": "Patient" } },
        ],
        children: [
          {
            tag: "NM1",
            name: "Individual or Organizational Name",
            mandatory: true,
            repeatable: true,
            elements: [
              { ref: "NM101", name: "Entity Identifier Code", mandatory: true, codes: { "85": "Billing Provider", IL: "Subscriber", QC: "Patient", "82": "Rendering Provider" } },
              { ref: "NM108", name: "Identification Code Qualifier", mandatory: false, codes: { XX: "NPI" } },
              { ref: "NM109", name: "Identification Code", mandatory: false },
            ],
          },
          { tag: "N3", name: "Address Information", mandatory: false, repeatable: false, elements: [{ ref: "N301", name: "Address Line 1", mandatory: false }] },
          { tag: "N4", name: "Geographic Location", mandatory: false, repeatable: false, elements: [{ ref: "N401", name: "City", mandatory: false }] },
          { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { EI: "Employer's ID Number", SY: "SSN" } }, { ref: "REF02", name: "Reference Identification", mandatory: true }] },
          { tag: "PER", name: "Administrative Communications Contact", mandatory: false, repeatable: false, elements: [{ ref: "PER04", name: "Communication Number", mandatory: false }] },
          {
            tag: "CLM",
            name: "Claim",
            mandatory: true,
            repeatable: false,
            elements: [
              { ref: "CLM01", name: "Claim Submitter's Identifier", mandatory: true },
              { ref: "CLM02", name: "Monetary Amount (Total Claim Charge Amount)", mandatory: true },
              { ref: "CLM05", name: "Health Care Service Location Information (composite)", mandatory: true },
              { ref: "CLM06", name: "Provider or Supplier Signature Indicator", mandatory: false, codes: { Y: "Yes", N: "No" } },
              { ref: "CLM07", name: "Medicare Assignment Code", mandatory: false, codes: { A: "Assigned", B: "Not Assigned" } },
              { ref: "CLM08", name: "Benefits Assignment Certification Indicator", mandatory: false, codes: { Y: "Yes", N: "No", W: "Not Applicable" } },
              { ref: "CLM09", name: "Release of Information Code", mandatory: false, codes: { Y: "Yes", I: "Informed Consent" } },
            ],
            children: [
              { tag: "DTP", name: "Date or Time or Period", mandatory: false, repeatable: true, elements: [{ ref: "DTP01", name: "Date/Time Qualifier", mandatory: true, codes: { "431": "Onset of Current Illness", "484": "Last Menstrual Period", "435": "Admission" } }, { ref: "DTP03", name: "Date", mandatory: true }] },
              { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF01", name: "Reference Qualifier", mandatory: true, codes: { D9: "Claim Number", EA: "Medical Record Number" } }, { ref: "REF02", name: "Reference Identification", mandatory: true }] },
              { tag: "HI", name: "Health Care Diagnosis Code", mandatory: true, repeatable: false, elements: [{ ref: "HI01", name: "Health Care Code Information (composite)", mandatory: true, codes: { ABK: "ICD-10 Principal Diagnosis", ABF: "ICD-10 Diagnosis" } }] },
              { tag: "NM1", name: "Rendering/Referring Provider Name", mandatory: false, repeatable: true, elements: [{ ref: "NM101", name: "Entity Identifier Code", mandatory: true, codes: { "82": "Rendering Provider", DN: "Referring Provider" } }, { ref: "NM109", name: "Identification Code", mandatory: false }] },
              {
                tag: "LX",
                name: "Service Line Loop",
                mandatory: false,
                repeatable: true,
                elements: [{ ref: "LX01", name: "Assigned Number", mandatory: true }],
                children: [
                  {
                    tag: "SV1",
                    name: "Professional Service",
                    mandatory: true,
                    repeatable: false,
                    elements: [
                      { ref: "SV101", name: "Composite Medical Procedure Identifier", mandatory: true },
                      { ref: "SV102", name: "Monetary Amount (Line Item Charge Amount)", mandatory: true },
                      { ref: "SV103", name: "Unit or Basis for Measurement Code", mandatory: true, codes: { UN: "Unit", MJ: "Minutes" } },
                      { ref: "SV104", name: "Quantity", mandatory: true },
                      { ref: "SV105", name: "Place of Service Code", mandatory: false },
                    ],
                  },
                  { tag: "DTP", name: "Date or Time or Period (Service Date)", mandatory: false, repeatable: false, elements: [{ ref: "DTP03", name: "Date", mandatory: true }] },
                  { tag: "REF", name: "Reference Identification", mandatory: false, repeatable: true, elements: [{ ref: "REF02", name: "Reference Identification", mandatory: true }] },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
};
