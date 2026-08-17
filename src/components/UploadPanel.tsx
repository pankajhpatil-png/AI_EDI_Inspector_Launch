"use client";

import { useRef, useState } from "react";

export interface LoadedFile {
  name: string;
  text: string;
}

export type EdiFormat = "X12" | "EDIFACT";

const X12_SAMPLES: Record<string, LoadedFile> = {
  valid850: {
    name: "sample_valid_850.edi",
    text:
      "ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *260707*1200*U*00501*000000001*0*P*>~\n" +
      "GS*PO*SENDERID*RECEIVERID*20260707*1200*1*X*005010~\n" +
      "ST*850*0001~\n" +
      "BEG*00*NE*PO123456**20260707~\n" +
      "REF*DP*001~\n" +
      "N1*BT*Buyer Name*92*BUYERID~\n" +
      "N1*ST*Ship To Name*92*SHIPID~\n" +
      "PO1*1*10*EA*5.00**VN*ITEM123~\n" +
      "PO1*2*5*EA*12.50**VN*ITEM456~\n" +
      "CTT*2~\n" +
      "SE*9*0001~\n" +
      "GE*1*1~\n" +
      "IEA*1*000000001~\n",
  },
  badControl810: {
    name: "sample_bad_control_810.edi",
    text:
      "ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *260707*1200*U*00501*000000042*0*P*>~\n" +
      "GS*IN*SENDERID*RECEIVERID*20260707*1200*5*X*005010~\n" +
      "ST*810*0001~\n" +
      "BIG*20260707*INV999*20260701*PO123~\n" +
      "N1*ST*Ship To*92*SHIPID~\n" +
      "IT1*1*10*EA*5.00**VN*ITEM123~\n" +
      "TDS*5000~\n" +
      "SE*6*0009~\n" +
      "GE*1*5~\n" +
      "IEA*1*000000099~\n",
  },
  clean837: {
    name: "sample_clean_837_professional.edi",
    text:
      "ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *260707*0900*U*00501*000000801*0*P*>~\n" +
      "GS*HC*SENDERID*RECEIVERID*20260707*0900*8*X*005010X222A1~\n" +
      "ST*837*0001~\n" +
      "BHT*0019*00*0001*20260707*0900*CH~\n" +
      "HL*1**20*1~\n" +
      "CLM*CLAIM001*500***11:B:1*Y*A*Y*Y~\n" +
      "SE*5*0001~\n" +
      "GE*1*8~\n" +
      "IEA*1*000000801~\n",
  },
  missingEb271: {
    name: "sample_missing_eb_271.edi",
    text:
      "ISA*00*          *00*          *ZZ*SENDERID       *ZZ*RECEIVERID     *260707*1000*U*00501*000000802*0*P*>~\n" +
      "GS*HB*SENDERID*RECEIVERID*20260707*1000*9*X*005010X279A1~\n" +
      "ST*271*0001~\n" +
      "BHT*0022*11*0001*20260707*1000~\n" +
      "HL*1**20*1~\n" +
      "SE*4*0001~\n" +
      "GE*1*9~\n" +
      "IEA*1*000000802~\n",
  },
};

const EDIFACT_SAMPLES: Record<string, LoadedFile> = {
  validOrders: {
    name: "sample_valid_orders.edifact",
    text:
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
      "UNZ+1+000000001'\n",
  },
  badControlInvoic: {
    name: "sample_bad_control_invoic.edifact",
    text:
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
      "UNZ+1+000000099'\n",
  },
  missingLinDesadv: {
    name: "sample_missing_lin_desadv.edifact",
    text:
      "UNA:+.? '\n" +
      "UNB+UNOC:3+SENDERID:14+RECEIVERID:14+260707:0800+000000777'\n" +
      "UNH+1+DESADV:D:01B:UN'\n" +
      "BGM+351+SHIP998877+9'\n" +
      "DTM+11:20260707:102'\n" +
      "UNT+4+1'\n" +
      "UNZ+1+000000777'\n",
  },
};

const SAMPLE_BUTTONS: Record<EdiFormat, { key: string; label: string }[]> = {
  X12: [
    { key: "valid850", label: "Clean 850" },
    { key: "badControl810", label: "810 with bad control numbers" },
    { key: "clean837", label: "Clean 837 (Professional)" },
    { key: "missingEb271", label: "271 missing eligibility data" },
  ],
  EDIFACT: [
    { key: "validOrders", label: "Clean ORDERS" },
    { key: "badControlInvoic", label: "INVOIC with bad control numbers" },
    { key: "missingLinDesadv", label: "DESADV missing line items" },
  ],
};

export default function UploadPanel({
  format = "X12",
  onFilesReady,
}: {
  format?: EdiFormat;
  onFilesReady: (files: LoadedFile[]) => void;
}) {
  const SAMPLES = format === "EDIFACT" ? EDIFACT_SAMPLES : X12_SAMPLES;
  const sampleButtons = SAMPLE_BUTTONS[format];
  const [dragOver, setDragOver] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [fileLabel, setFileLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  function readFiles(fileList: FileList) {
    const files = Array.from(fileList);
    setFileLabel(files.length === 1 ? files[0].name : `${files.length} files selected`);
    Promise.all(
      files.map(
        (file) =>
          new Promise<LoadedFile>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ name: file.name, text: String(reader.result || "") });
            reader.onerror = () => resolve({ name: file.name, text: "" });
            reader.readAsText(file);
          })
      )
    ).then(onFilesReady);
  }

  return (
    <div
      className="flex flex-col items-center gap-3 rounded-[10px] border-[1.5px] border-dashed p-8 text-center"
      style={{
        borderColor: dragOver ? "var(--accent)" : "var(--border)",
        background: dragOver ? "var(--accent-soft)" : "var(--surface)",
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setDragOver(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) readFiles(e.dataTransfer.files);
      }}
    >
      <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
        Drag one or more raw {format === "EDIFACT" ? "UN/EDIFACT" : "X12"} files here, or
      </p>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="rounded-md px-4 py-2 text-sm font-semibold"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        Browse for files
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={format === "EDIFACT" ? ".edifact,.txt,.dat" : ".edi,.x12,.txt,.dat"}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) readFiles(e.target.files);
        }}
        aria-label={`Choose one or more ${format === "EDIFACT" ? "UN/EDIFACT" : "X12"} EDI files`}
      />
      {fileLabel && (
        <div className="font-mono text-xs" style={{ color: "var(--ink-muted)" }}>
          {fileLabel}
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-2 text-xs" style={{ color: "var(--ink-muted)" }}>
        <span>Try a sample:</span>
        {sampleButtons.map((s) => (
          <button
            key={s.key}
            type="button"
            onClick={() => {
              setFileLabel(SAMPLES[s.key].name);
              onFilesReady([SAMPLES[s.key]]);
            }}
            className="rounded-md border px-2.5 py-1 font-mono"
            style={{ borderColor: "var(--border)", color: "var(--ink)" }}
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => {
            const all = Object.values(SAMPLES);
            setFileLabel(`${all.length} files selected`);
            onFilesReady(all);
          }}
          className="rounded-md border px-2.5 py-1 font-mono"
          style={{ borderColor: "var(--border)", color: "var(--ink)" }}
        >
          Load all as a batch
        </button>
      </div>

      <button
        type="button"
        onClick={() => setPasteOpen((v) => !v)}
        className="rounded-md border px-2.5 py-1 text-xs font-mono"
        style={{ borderColor: "var(--border)", color: "var(--ink)" }}
        aria-expanded={pasteOpen}
      >
        Or paste raw text…
      </button>
      {pasteOpen && (
        <div className="flex w-full flex-col gap-2">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder={
              format === "EDIFACT"
                ? "Paste a raw UN/EDIFACT interchange here (starting with UNA or UNB...)"
                : "Paste a raw X12 interchange here (starting with ISA...)"
            }
            aria-label={`Paste raw ${format === "EDIFACT" ? "UN/EDIFACT" : "X12"} text to validate`}
            className="min-h-[130px] w-full rounded-lg border p-3 font-mono text-xs"
            style={{ borderColor: "var(--border)", background: "var(--surface-raised)", color: "var(--ink)" }}
          />
          <button
            type="button"
            onClick={() => {
              const text = pasteText.trim();
              if (!text) return;
              const name = format === "EDIFACT" ? "pasted-input.edifact" : "pasted-input.edi";
              setFileLabel(name);
              onFilesReady([{ name, text }]);
            }}
            className="self-center rounded-md px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
          >
            Validate pasted text
          </button>
        </div>
      )}
    </div>
  );
}
