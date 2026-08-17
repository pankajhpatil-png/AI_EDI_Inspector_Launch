export interface SpecElement {
  ref: string;
  name: string;
  mandatory: boolean;
  codes?: Record<string, string>;
}

export interface SpecSegment {
  tag: string;
  name: string;
  mandatory: boolean;
  repeatable: boolean;
  elements: SpecElement[];
  children?: SpecSegment[];
}

export interface TransactionSpec {
  docType: string;
  name: string;
  version: string;
  segments: SpecSegment[];
}
