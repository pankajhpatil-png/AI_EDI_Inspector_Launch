import type { Finding } from "@/lib/x12/types";

export interface EdifactDelimiters {
  component: string;
  element: string;
  decimal: string;
  release: string;
  terminator: string;
}

export type RawSegment = string[];

export interface EdifactMessage {
  messageRef: string | null;
  messageType: string | null;
  version: string | null;
  release: string | null;
  segmentCount: number;
  segments: string[];
  raw: Record<string, RawSegment>;
  rawSegments: RawSegment[];
}

export interface EdifactGroup {
  groupControlRef: string | null;
  identifier: string | null;
  ungRaw: RawSegment | null;
  messages: EdifactMessage[];
}

export interface EdifactInterchange {
  controlRef: string | null;
  syntaxId: string | null;
  syntaxVersion: string | null;
  sender: string | null;
  recipient: string | null;
  unbRaw: RawSegment | null;
  groups: EdifactGroup[];
  messages: EdifactMessage[]; // top-level messages, not inside any UNG group
}

export interface EdifactStructure {
  interchange: EdifactInterchange;
}

export interface EdifactValidationResult {
  format: "EDIFACT";
  filename: string;
  fatalError: string | null;
  delims: EdifactDelimiters | null;
  structure: EdifactStructure | null;
  errors: Finding[];
  warnings: Finding[];
  missingFindings: Finding[];
  isValid: boolean;
  issueCount: number;
}

export interface EdifactRequiredSegmentRule {
  seg: string;
  label: "1" | "1+";
  note: string;
}

export interface MsgReferenceEntry {
  name: string;
  required: EdifactRequiredSegmentRule[];
}
