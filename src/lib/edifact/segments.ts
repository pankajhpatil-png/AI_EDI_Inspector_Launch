import type { EdifactDelimiters, RawSegment } from "./types";

// Splits `str` on `sep`, treating `release` as an escape character for the
// character that follows it (per ISO 9735 §7), so an escaped delimiter is
// kept literal instead of splitting the string.
export function splitRespectingRelease(str: string, sep: string, release: string): string[] {
  const parts: string[] = [];
  let buf = "";
  for (let i = 0; i < str.length; i++) {
    const c = str[i];
    if (release && c === release && i + 1 < str.length) {
      buf += str[i + 1];
      i++;
      continue;
    }
    if (c === sep) {
      parts.push(buf);
      buf = "";
    } else {
      buf += c;
    }
  }
  parts.push(buf);
  return parts;
}

export function splitSegments(body: string, delims: EdifactDelimiters): RawSegment[] {
  const rawSegments = splitRespectingRelease(body, delims.terminator, delims.release);
  const segments: RawSegment[] = [];
  for (const piece of rawSegments) {
    const cleaned = piece.replace(/^[\r\n \t]+|[\r\n \t]+$/g, "");
    if (!cleaned) continue;
    segments.push(splitRespectingRelease(cleaned, delims.element, delims.release));
  }
  return segments;
}
