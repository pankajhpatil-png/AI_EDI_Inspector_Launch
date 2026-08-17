import { validateInterchange } from "../src/lib/edifact/validate";

const validOrders =
  "UNA:+.? '\n" +
  "UNB+UNOC:3+SENDERID:14+RECEIVERID:14+260707:1200+000000001'\n" +
  "UNH+1+ORDERS:D:01B:UN'\n" +
  "BGM+220+PO123456+9'\n" +
  "DTM+137:20260707:102'\n" +
  "NAD+BY+BUYERID::9'\n" +
  "NAD+SU+SUPPLIERID::9'\n" +
  "LIN+1++ITEM123:VN'\n" +
  "QTY+21:10:EA'\n" +
  "LIN+2++ITEM456:VN'\n" +
  "QTY+21:5:EA'\n" +
  "UNT+10+1'\n" +
  "UNZ+1+000000001'\n";

const badControlInvoic =
  "UNA:+.? '\n" +
  "UNB+UNOC:3+SENDERID:14+RECEIVERID:14+260707:1200+000000042'\n" +
  "UNH+1+INVOIC:D:01B:UN'\n" +
  "BGM+380+INV999+9'\n" +
  "DTM+137:20260707:102'\n" +
  "NAD+SU+SUPPLIERID::9'\n" +
  "LIN+1++ITEM123:VN'\n" +
  "QTY+47:10:EA'\n" +
  "MOA+77:5000'\n" +
  "UNT+6+0009'\n" +
  "UNZ+1+000000099'\n";

const missingLinDesadv =
  "UNA:+.? '\n" +
  "UNB+UNOC:3+SENDERID:14+RECEIVERID:14+260707:0800+000000777'\n" +
  "UNH+1+DESADV:D:01B:UN'\n" +
  "BGM+351+SHIP998877+9'\n" +
  "DTM+11:20260707:102'\n" +
  "UNT+4+1'\n" +
  "UNZ+1+000000777'\n";

function check(label: string, cond: boolean, detail: string) {
  console.log((cond ? "PASS" : "FAIL") + " - " + label + (cond ? "" : "  (" + detail + ")"));
}

const r1 = validateInterchange("valid_orders.edifact", validOrders);
check("clean ORDERS validates with zero issues", r1.isValid && r1.issueCount === 0, `issueCount=${r1.issueCount} fatal=${r1.fatalError} errors=${JSON.stringify(r1.errors)}`);

const r2 = validateInterchange("bad_control_invoic.edifact", badControlInvoic);
const r2codes = r2.errors.map((e) => e.code);
check(
  "INVOIC with bad control numbers is flagged invalid",
  !r2.isValid && r2codes.includes("UNT_COUNT_MISMATCH") && r2codes.includes("UNH_UNT_CONTROL_MISMATCH") && r2codes.includes("UNB_UNZ_CONTROL_MISMATCH"),
  `isValid=${r2.isValid} codes=${r2codes.join(",")}`
);

const r3 = validateInterchange("missing_lin_desadv.edifact", missingLinDesadv);
const r3codes = r3.missingFindings.map((f) => f.code);
check("DESADV missing LIN is flagged missing", !r3.isValid && r3codes.includes("MISSING_LIN"), `isValid=${r3.isValid} codes=${r3codes.join(",")}`);

check(
  "clean ORDERS structure has correct sender/recipient/messageType",
  r1.structure?.interchange.sender === "SENDERID" &&
    r1.structure?.interchange.recipient === "RECEIVERID" &&
    r1.structure?.interchange.messages[0]?.messageType === "ORDERS",
  JSON.stringify(r1.structure?.interchange)
);
