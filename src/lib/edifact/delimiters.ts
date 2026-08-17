import type { EdifactDelimiters } from "./types";

export interface DetectedDelimiters {
  delims: EdifactDelimiters;
  body: string;
}

export function detectDelimiters(raw: string): DetectedDelimiters {
  if (raw.slice(0, 3) === "UNA") {
    if (raw.length < 9) {
      throw new Error(
        "File starts with 'UNA' but is only " + raw.length + " characters — a UNA service-string advice needs at least 9."
      );
    }
    const delims: EdifactDelimiters = {
      component: raw[3],
      element: raw[4],
      decimal: raw[5],
      release: raw[6],
      terminator: raw[8],
    };
    let rest = raw.slice(9).replace(/^[\r\n \t]+/, "");
    if (rest[0] === delims.terminator) rest = rest.slice(1).replace(/^[\r\n \t]+/, "");
    return { delims, body: rest };
  }
  if (raw.slice(0, 3) === "UNB") {
    return {
      delims: { component: ":", element: "+", decimal: ".", release: "?", terminator: "'" },
      body: raw,
    };
  }
  throw new Error(
    "File does not start with 'UNA' or 'UNB'. This does not look like a raw UN/EDIFACT interchange (or there is leading whitespace/BOM to strip)."
  );
}
