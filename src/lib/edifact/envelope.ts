import type { Finding } from "@/lib/x12/types";
import { splitRespectingRelease } from "./segments";
import type { EdifactDelimiters, EdifactGroup, EdifactInterchange, EdifactMessage, EdifactStructure, RawSegment } from "./types";

export interface BuildResult {
  structure: EdifactStructure | null;
  errors: Finding[];
  warnings: Finding[];
}

export function buildAndValidate(segments: RawSegment[], delims: EdifactDelimiters): BuildResult {
  const errors: Finding[] = [];
  const warnings: Finding[] = [];

  if (!segments.length || segments[0][0] !== "UNB") {
    errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "First segment must be UNB (interchange header)." });
    return { structure: null, errors, warnings };
  }
  const unb = segments[0];
  if (segments[segments.length - 1][0] !== "UNZ") {
    errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "Last segment must be UNZ (interchange trailer)." });
  }

  const unbControlRef = unb.length > 5 ? unb[5] : null;
  const syntaxParts = unb.length > 1 ? splitRespectingRelease(unb[1], delims.component, delims.release) : [];

  const interchange: EdifactInterchange = {
    controlRef: unbControlRef,
    syntaxId: syntaxParts[0] || null,
    syntaxVersion: syntaxParts[1] || null,
    sender: unb.length > 2 ? unb[2].split(delims.component)[0] : null,
    recipient: unb.length > 3 ? unb[3].split(delims.component)[0] : null,
    unbRaw: unb,
    groups: [],
    messages: [],
  };

  let currentGroup: EdifactGroup | null = null;
  let currentMsg: EdifactMessage | null = null;
  let groupCountSeen = 0;
  let topLevelMsgCount = 0;
  const n = segments.length;

  for (let i = 1; i < n - 1; i++) {
    const seg = segments[i];
    const tag = seg[0];

    if (tag === "UNG") {
      groupCountSeen++;
      const ungControlRef = seg.length > 5 ? seg[5] : null;
      currentGroup = {
        groupControlRef: ungControlRef,
        identifier: seg.length > 1 ? seg[1] : null,
        ungRaw: seg,
        messages: [],
      };
      interchange.groups.push(currentGroup);
    } else if (tag === "UNE") {
      if (!currentGroup) {
        errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "UNE encountered with no matching open UNG." });
      } else {
        const uneCount = seg.length > 1 ? seg[1] : null;
        const uneControlRef = seg.length > 2 ? seg[2] : null;
        const actualMsgCount = currentGroup.messages.length;
        if (uneCount != null && String(actualMsgCount) !== String(uneCount)) {
          errors.push({
            severity: "error",
            code: "UNE_COUNT_MISMATCH",
            message:
              "UNE says " + uneCount + " messages, but " + actualMsgCount + " UNH...UNT messages were actually found in group " + currentGroup.groupControlRef + ".",
          });
        }
        if (uneControlRef !== currentGroup.groupControlRef) {
          errors.push({
            severity: "error",
            code: "UNG_UNE_CONTROL_MISMATCH",
            message: "UNE control reference (" + uneControlRef + ") does not match UNG (" + currentGroup.groupControlRef + ") — functional group control references must match.",
          });
        }
        currentGroup = null;
      }
    } else if (tag === "UNH") {
      const messageRef = seg.length > 1 ? seg[1] : null;
      const msgParts = seg.length > 2 ? splitRespectingRelease(seg[2], delims.component, delims.release) : [];
      currentMsg = {
        messageRef,
        messageType: msgParts[0] || null,
        version: msgParts[1] || null,
        release: msgParts[2] || null,
        segmentCount: 1,
        segments: [tag],
        raw: { UNH: seg },
        rawSegments: [seg],
      };
      if (currentGroup) {
        currentGroup.messages.push(currentMsg);
      } else {
        interchange.messages.push(currentMsg);
        topLevelMsgCount++;
      }
    } else if (tag === "UNT") {
      if (!currentMsg) {
        errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "UNT encountered with no matching open UNH." });
      } else {
        currentMsg.segmentCount++;
        currentMsg.segments.push(tag);
        currentMsg.rawSegments.push(seg);
        const untCount = seg.length > 1 ? seg[1] : null;
        const untMessageRef = seg.length > 2 ? seg[2] : null;
        const actualSeg = currentMsg.segmentCount;
        if (untCount != null && String(actualSeg) !== String(untCount)) {
          errors.push({
            severity: "error",
            code: "UNT_COUNT_MISMATCH",
            message: "UNT says " + untCount + " segments, but " + actualSeg + " were actually counted in UNH " + currentMsg.messageRef + " (message type " + currentMsg.messageType + ").",
          });
        }
        if (untMessageRef !== currentMsg.messageRef) {
          errors.push({
            severity: "error",
            code: "UNH_UNT_CONTROL_MISMATCH",
            message: "UNT message reference (" + untMessageRef + ") does not match UNH (" + currentMsg.messageRef + ") — message reference numbers must match.",
          });
        }
        currentMsg = null;
      }
    } else {
      if (currentMsg) {
        currentMsg.segmentCount++;
        currentMsg.segments.push(tag);
        currentMsg.raw[tag] = seg;
        currentMsg.rawSegments.push(seg);
      } else if (currentGroup) {
        warnings.push({ severity: "warning", code: "SEGMENT_OUTSIDE_MESSAGE", message: "Segment " + tag + " appears inside UNG group but outside any UNH...UNT message." });
      } else {
        warnings.push({ severity: "warning", code: "SEGMENT_OUTSIDE_INTERCHANGE", message: "Segment " + tag + " appears outside any UNG group or UNH message." });
      }
    }
  }

  if (currentGroup) {
    errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "UNG " + currentGroup.groupControlRef + " was never closed with a UNE." });
  }
  if (currentMsg) {
    errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "UNH " + currentMsg.messageRef + " was never closed with a UNT." });
  }

  const unz = segments[segments.length - 1];
  if (unz[0] === "UNZ") {
    const unzCount = unz.length > 1 ? unz[1] : null;
    const unzControlRef = unz.length > 2 ? unz[2] : null;
    const expectedCount = groupCountSeen > 0 ? groupCountSeen : topLevelMsgCount;
    if (unzCount != null && String(expectedCount) !== String(unzCount)) {
      errors.push({
        severity: "error",
        code: "UNZ_COUNT_MISMATCH",
        message: "UNZ says " + unzCount + " " + (groupCountSeen > 0 ? "functional groups" : "messages") + ", but " + expectedCount + " were actually found.",
      });
    }
    if (unzControlRef !== unbControlRef) {
      errors.push({
        severity: "error",
        code: "UNB_UNZ_CONTROL_MISMATCH",
        message: "UNZ control reference (" + unzControlRef + ") does not match UNB (" + unbControlRef + ") — interchange control references must match.",
      });
    }
  }

  return { structure: { interchange }, errors, warnings };
}

export function allMessages(structure: EdifactStructure): EdifactMessage[] {
  return structure.interchange.messages.concat(structure.interchange.groups.flatMap((g) => g.messages));
}
