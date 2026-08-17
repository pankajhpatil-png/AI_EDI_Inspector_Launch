export interface Delimiters {
  element: string;
  subelement: string;
  terminator: string;
}

export type RawSegment = string[];

export interface TransactionSet {
  transactionSetId: string;
  stControlNumber: string | null;
  segmentCount: number;
  segments: string[];
  raw: Record<string, RawSegment>;
  rawSegments: RawSegment[];
  gs08: string | null;
}

export interface FunctionalGroup {
  gsControlNumber: string | null;
  functionalIdCode: string | null;
  gs08: string | null;
  gsRaw: RawSegment | null;
  transactionSets: TransactionSet[];
}

export interface Interchange {
  isaControlNumber: string | null;
  sender: string | null;
  receiver: string | null;
  usage: "Test" | "Production";
  isaRaw: RawSegment | null;
  functionalGroups: FunctionalGroup[];
}

export interface EdiStructure {
  version: string;
  interchange: Interchange;
}

export type FindingSeverity = "error" | "warning" | "missing" | "info";

export interface Finding {
  severity: FindingSeverity;
  code: string;
  message: string;
  note?: string | null;
  transactionSetId?: string;
}

export interface ValidationResult {
  format: "X12";
  filename: string;
  fatalError: string | null;
  delims: Delimiters | null;
  structure: EdiStructure | null;
  errors: Finding[];
  warnings: Finding[];
  missingFindings: Finding[];
  isValid: boolean;
  issueCount: number;
}

export interface RequiredSegmentRule {
  seg: string;
  label: "1" | "1+";
  note: string;
}

export interface TxReferenceEntry {
  name: string;
  category: "commercial" | "healthcare";
  igFragment?: string;
  required: RequiredSegmentRule[];
}
