import type { Delimiters, RawSegment } from "./types";

export function splitSegments(raw: string, delims: Delimiters): RawSegment[] {
  const rawSegments = raw.split(delims.terminator);
  const segments: RawSegment[] = [];
  for (const piece of rawSegments) {
    const cleaned = piece.replace(/^[\r\n \t]+|[\r\n \t]+$/g, "");
    if (!cleaned) continue;
    segments.push(cleaned.split(delims.element));
  }
  return segments;
}
