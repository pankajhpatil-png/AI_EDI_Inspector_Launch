import type { Finding } from "@/lib/x12/types";
import { detectDelimiters } from "./delimiters";
import { allMessages, buildAndValidate } from "./envelope";
import { requiredSegmentFindings } from "./rules";
import { splitSegments } from "./segments";
import type { EdifactValidationResult } from "./types";

// Reuses the generic `Finding` type from lib/x12/types — its `transactionSetId`
// field doubles as "the message type this finding belongs to" here (UNH02's
// message code, e.g. ORDERS/INVOIC), since the shape is otherwise identical
// and shared by FindingRow/ResultsPanel/api/explain regardless of format.
export function validateInterchange(filename: string, rawText: string): EdifactValidationResult {
  try {
    const raw = rawText.trim();
    const { delims, body } = detectDelimiters(raw);
    const segments = splitSegments(body, delims);
    const parsed = buildAndValidate(segments, delims);

    const errors: Finding[] = [...parsed.errors];
    const warnings: Finding[] = [...parsed.warnings];
    const missingFindings: Finding[] = [];

    if (parsed.structure) {
      for (const msg of allMessages(parsed.structure)) {
        for (const finding of requiredSegmentFindings(msg)) {
          if (finding.severity === "missing") missingFindings.push(finding);
          else if (finding.severity === "error") errors.push(finding);
          else warnings.push(finding);
        }
      }
    }

    const issueCount = errors.length + missingFindings.length;

    return {
      format: "EDIFACT",
      filename,
      fatalError: null,
      delims,
      structure: parsed.structure,
      errors,
      warnings,
      missingFindings,
      isValid: issueCount === 0,
      issueCount,
    };
  } catch (e) {
    return {
      format: "EDIFACT",
      filename,
      fatalError: e instanceof Error ? e.message : String(e),
      delims: null,
      structure: null,
      errors: [],
      warnings: [],
      missingFindings: [],
      isValid: false,
      issueCount: 0,
    };
  }
}
