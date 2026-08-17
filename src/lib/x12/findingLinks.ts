// Best-effort segment-code extraction for deep-linking a finding into the
// Segment Explorer. Missing-segment findings are always coded
// "MISSING_<SEG>" by rules.ts, so this is exact for those; other finding
// codes (envelope/control-number errors) have no single segment to link
// to and return null.
export function segmentCodeFromFinding(code: string): string | null {
  if (code.startsWith("MISSING_")) return code.slice("MISSING_".length);
  return null;
}
