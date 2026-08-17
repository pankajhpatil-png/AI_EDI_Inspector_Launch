import { detectDelimiters } from "./delimiters";
import { buildAndValidate } from "./envelope";
import { requiredSegmentFindings } from "./rules";
import { splitSegments } from "./segments";
import type { Finding, ValidationResult } from "./types";

export function validateInterchange(filename: string, rawText: string): ValidationResult {
  try {
    const raw = rawText.trim();
    const delims = detectDelimiters(raw);
    const segments = splitSegments(raw, delims);
    const parsed = buildAndValidate(segments);

    const errors: Finding[] = [...parsed.errors];
    const warnings: Finding[] = [...parsed.warnings];
    const missingFindings: Finding[] = [];

    if (parsed.structure) {
      for (const group of parsed.structure.interchange.functionalGroups) {
        for (const txn of group.transactionSets) {
          for (const finding of requiredSegmentFindings(txn)) {
            if (finding.severity === "missing") missingFindings.push(finding);
            else if (finding.severity === "error") errors.push(finding);
            else warnings.push(finding);
          }
        }
      }
    }

    const issueCount = errors.length + missingFindings.length;

    return {
      format: "X12",
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
      format: "X12",
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
