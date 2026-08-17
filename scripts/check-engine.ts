import { readFileSync } from "fs";
import { join } from "path";
import { txDisplayName } from "../src/lib/x12/reference";
import { validateInterchange } from "../src/lib/x12/validate";

const FIXTURES_DIR = join(__dirname, "fixtures");

interface Check {
  file: string;
  label: string;
  expect: (r: ReturnType<typeof validateInterchange>) => string | null; // null = pass, string = failure reason
}

const checks: Check[] = [
  {
    file: "clean_850.edi",
    label: "850 clean order validates with zero issues",
    expect: (r) => (r.isValid && r.issueCount === 0 ? null : `expected valid, got issueCount=${r.issueCount} fatal=${r.fatalError}`),
  },
  {
    file: "bad_control_810.edi",
    label: "810 with mismatched control numbers is flagged invalid",
    expect: (r) => {
      const codes = r.errors.map((e) => e.code);
      const hasSeMismatch = codes.includes("SE01_COUNT_MISMATCH") || codes.includes("ST_SE_CONTROL_MISMATCH");
      const hasIeaMismatch = codes.includes("ISA_IEA_CONTROL_MISMATCH");
      if (r.isValid) return "expected invalid, got valid";
      if (!hasSeMismatch) return `expected an SE/ST control mismatch, got codes=${codes.join(",")}`;
      if (!hasIeaMismatch) return `expected ISA_IEA_CONTROL_MISMATCH, got codes=${codes.join(",")}`;
      return null;
    },
  },
  {
    file: "missing_hl_856.edi",
    label: "856 missing HL segment is flagged missing",
    expect: (r) => {
      const codes = r.missingFindings.map((f) => f.code);
      if (r.isValid) return "expected invalid, got valid";
      return codes.includes("MISSING_HL") ? null : `expected MISSING_HL, got codes=${codes.join(",")}`;
    },
  },
  {
    file: "clean_837_professional.edi",
    label: "837 clean claim validates and classifies as Professional",
    expect: (r) => {
      if (!r.isValid) return `expected valid, got issueCount=${r.issueCount}`;
      const txn = r.structure?.interchange.functionalGroups[0]?.transactionSets[0];
      if (!txn) return "no transaction set found";
      const name = txDisplayName(txn);
      return name === "Health Care Claim (Professional)" ? null : `expected Professional subtype label, got "${name}"`;
    },
  },
  {
    file: "missing_eb_271.edi",
    label: "271 missing EB segment is flagged missing (IG fragment present, no version warning)",
    expect: (r) => {
      const missingCodes = r.missingFindings.map((f) => f.code);
      const warningCodes = r.warnings.map((w) => w.code);
      if (!missingCodes.includes("MISSING_EB")) return `expected MISSING_EB, got codes=${missingCodes.join(",")}`;
      if (warningCodes.includes("HIPAA_IG_VERSION")) return "unexpected HIPAA_IG_VERSION warning — GS08 already contains X279";
      return null;
    },
  },
  {
    file: "clean_999.edi",
    label: "999 clean (AK9=A) validates with zero issues",
    expect: (r) => (r.isValid && r.issueCount === 0 ? null : `expected valid, got issueCount=${r.issueCount} fatal=${r.fatalError}`),
  },
  {
    file: "rejected_999.edi",
    label: "999 with AK9=R and IK5=R reports both rejection findings",
    expect: (r) => {
      const codes = r.errors.map((e) => e.code);
      if (!codes.includes("GROUP_REJECTED")) return `expected GROUP_REJECTED, got codes=${codes.join(",")}`;
      if (!codes.includes("TRANSACTION_SET_REJECTED")) return `expected TRANSACTION_SET_REJECTED, got codes=${codes.join(",")}`;
      return null;
    },
  },
];

let failures = 0;
for (const check of checks) {
  const text = readFileSync(join(FIXTURES_DIR, check.file), "utf8");
  const result = validateInterchange(check.file, text);
  const failure = check.expect(result);
  if (failure) {
    failures++;
    console.log(`FAIL  ${check.label}\n      ${failure}`);
  } else {
    console.log(`PASS  ${check.label}`);
  }
}

console.log(`\n${checks.length - failures}/${checks.length} checks passed`);
if (failures > 0) process.exit(1);
