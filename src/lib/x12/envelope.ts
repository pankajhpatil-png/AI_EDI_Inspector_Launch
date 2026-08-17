import type { EdiStructure, Finding, FunctionalGroup, Interchange, RawSegment, TransactionSet } from "./types";

export function normalizeVersion(v: string | null | undefined): string {
  const digits = (v || "").replace(/\D/g, "");
  if (digits.indexOf("00501") === 0 || digits.indexOf("5010") === 0) return "005010";
  if (digits.indexOf("00401") === 0 || digits.indexOf("4010") === 0) return "004010";
  return "unknown";
}

export interface BuildResult {
  structure: EdiStructure | null;
  errors: Finding[];
  warnings: Finding[];
}

export function buildAndValidate(segments: RawSegment[]): BuildResult {
  const errors: Finding[] = [];
  const warnings: Finding[] = [];

  if (!segments.length || segments[0][0] !== "ISA") {
    errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "First segment must be ISA (interchange header)." });
    return { structure: null, errors, warnings };
  }

  const isa = segments[0];
  if (isa.length < 16) {
    errors.push({ severity: "error", code: "MALFORMED_ISA", message: "ISA segment has " + isa.length + " elements, expected 16." });
  }
  if (segments[segments.length - 1][0] !== "IEA") {
    errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "Last segment must be IEA (interchange trailer)." });
  }

  const isa13 = isa.length > 13 ? isa[13] : null;
  const isa12 = isa.length > 12 ? isa[12] : null;

  const interchange: Interchange = {
    isaControlNumber: isa13,
    sender: isa.length > 6 ? isa[6].trim() : null,
    receiver: isa.length > 8 ? isa[8].trim() : null,
    usage: isa.length > 15 && isa[15] === "T" ? "Test" : "Production",
    isaRaw: isa,
    functionalGroups: [],
  };

  let currentGroup: FunctionalGroup | null = null;
  let currentTxn: TransactionSet | null = null;
  let groupCountSeen = 0;
  let gs08Latest: string | null = null;
  const n = segments.length;

  for (let i = 1; i < n - 1; i++) {
    const seg = segments[i];
    const tag = seg[0];

    if (tag === "GS") {
      groupCountSeen++;
      const gs06 = seg.length > 6 ? seg[6] : null;
      const gs08 = seg.length > 8 ? seg[8] : null;
      gs08Latest = gs08 ?? gs08Latest;
      currentGroup = {
        gsControlNumber: gs06,
        functionalIdCode: seg.length > 1 ? seg[1] : null,
        gs08,
        gsRaw: seg,
        transactionSets: [],
      };
      interchange.functionalGroups.push(currentGroup);
    } else if (tag === "GE") {
      if (!currentGroup) {
        errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "GE encountered with no matching open GS." });
      } else {
        const ge01 = seg.length > 1 ? seg[1] : null;
        const ge02 = seg.length > 2 ? seg[2] : null;
        const actualTxn = currentGroup.transactionSets.length;
        if (ge01 != null && String(actualTxn) !== String(ge01)) {
          errors.push({
            severity: "error",
            code: "GE01_COUNT_MISMATCH",
            message: "GE01 says " + ge01 + " transaction sets, but " + actualTxn + " ST...SE sets were actually found in group " + currentGroup.gsControlNumber + ".",
          });
        }
        if (ge02 !== currentGroup.gsControlNumber) {
          errors.push({
            severity: "error",
            code: "GS_GE_CONTROL_MISMATCH",
            message: "GE02 (" + ge02 + ") does not match GS06 (" + currentGroup.gsControlNumber + ") — functional group control numbers must match.",
          });
        }
        currentGroup = null;
      }
    } else if (tag === "ST") {
      const st01 = seg.length > 1 ? seg[1] : null;
      const st02 = seg.length > 2 ? seg[2] : null;
      currentTxn = {
        transactionSetId: st01 ?? "",
        stControlNumber: st02,
        segmentCount: 1,
        segments: [tag],
        raw: { ST: seg },
        rawSegments: [seg],
        gs08: currentGroup ? currentGroup.gs08 : null,
      };
      if (currentGroup) {
        currentGroup.transactionSets.push(currentTxn);
      } else {
        errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "ST" + st02 + " encountered with no open GS group." });
      }
    } else if (tag === "SE") {
      if (!currentTxn) {
        errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "SE encountered with no matching open ST." });
      } else {
        currentTxn.segmentCount++;
        currentTxn.segments.push(tag);
        currentTxn.rawSegments.push(seg);
        const se01 = seg.length > 1 ? seg[1] : null;
        const se02 = seg.length > 2 ? seg[2] : null;
        const actualSeg = currentTxn.segmentCount;
        if (se01 != null && String(actualSeg) !== String(se01)) {
          errors.push({
            severity: "error",
            code: "SE01_COUNT_MISMATCH",
            message: "SE01 says " + se01 + " segments, but " + actualSeg + " were actually counted in ST" + currentTxn.stControlNumber + " (transaction set " + currentTxn.transactionSetId + ").",
          });
        }
        if (se02 !== currentTxn.stControlNumber) {
          errors.push({
            severity: "error",
            code: "ST_SE_CONTROL_MISMATCH",
            message: "SE02 (" + se02 + ") does not match ST02 (" + currentTxn.stControlNumber + ") — transaction set control numbers must match.",
          });
        }
        currentTxn = null;
      }
    } else {
      if (currentTxn) {
        currentTxn.segmentCount++;
        currentTxn.segments.push(tag);
        currentTxn.raw[tag] = seg;
        currentTxn.rawSegments.push(seg);
      } else if (currentGroup) {
        warnings.push({ severity: "warning", code: "SEGMENT_OUTSIDE_TRANSACTION", message: "Segment " + tag + " appears inside GS group but outside any ST...SE transaction set." });
      } else {
        warnings.push({ severity: "warning", code: "SEGMENT_OUTSIDE_ENVELOPE", message: "Segment " + tag + " appears outside any GS group." });
      }
    }
  }

  if (currentGroup) {
    errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "GS" + currentGroup.gsControlNumber + " was never closed with a GE." });
  }
  if (currentTxn) {
    errors.push({ severity: "error", code: "ENVELOPE_ORDER", message: "ST" + currentTxn.stControlNumber + " was never closed with an SE." });
  }

  const iea = segments[segments.length - 1];
  if (iea[0] === "IEA") {
    const iea01 = iea.length > 1 ? iea[1] : null;
    const iea02 = iea.length > 2 ? iea[2] : null;
    if (iea01 != null && String(groupCountSeen) !== String(iea01)) {
      errors.push({ severity: "error", code: "IEA01_COUNT_MISMATCH", message: "IEA01 says " + iea01 + " functional groups, but " + groupCountSeen + " GS...GE groups were actually found." });
    }
    if (iea02 !== isa13) {
      errors.push({ severity: "error", code: "ISA_IEA_CONTROL_MISMATCH", message: "IEA02 (" + iea02 + ") does not match ISA13 (" + isa13 + ") — interchange control numbers must match." });
    }
  }

  const fromIsa = normalizeVersion(isa12);
  const fromGs = normalizeVersion(gs08Latest);
  const version = fromGs !== "unknown" ? fromGs : fromIsa;
  if (fromIsa !== "unknown" && fromGs !== "unknown" && fromIsa !== fromGs) {
    warnings.push({
      severity: "warning",
      code: "VERSION_MISMATCH",
      message: "ISA12 implies " + fromIsa + " but GS08 implies " + fromGs + " — version mismatch between interchange and functional group headers.",
    });
  }

  return { structure: { version, interchange }, errors, warnings };
}
