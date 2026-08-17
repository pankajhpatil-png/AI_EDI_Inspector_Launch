import type { Delimiters } from "./types";

export function detectDelimiters(raw: string): Delimiters {
  if (raw.slice(0, 3) !== "ISA") {
    throw new Error(
      "File does not start with 'ISA'. This does not look like a raw X12 interchange (or there is leading whitespace/BOM to strip)."
    );
  }
  if (raw.length < 106) {
    throw new Error(
      "File is only " + raw.length + " characters — too short to contain a complete ISA segment (needs at least 106)."
    );
  }
  return { element: raw[3], subelement: raw[104], terminator: raw[105] };
}
