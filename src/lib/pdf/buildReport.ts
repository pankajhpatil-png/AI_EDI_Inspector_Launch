import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from "pdf-lib";
import { txDisplayName } from "@/lib/x12/reference";
import type { ValidationResult } from "@/lib/x12/types";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 48;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

interface Cursor {
  doc: PDFDocument;
  font: PDFFont;
  bold: PDFFont;
  page: PDFPage;
  y: number;
}

function wrapText(text: string, font: PDFFont, size: number, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function newPage(cursor: Cursor) {
  cursor.page = cursor.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  cursor.y = PAGE_HEIGHT - MARGIN;
}

function ensureSpace(cursor: Cursor, needed: number) {
  if (cursor.y - needed < MARGIN) newPage(cursor);
}

function writeLine(cursor: Cursor, text: string, opts: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; gap?: number } = {}) {
  const size = opts.size ?? 10;
  const font = opts.font ?? cursor.font;
  const color = opts.color ?? rgb(0.1, 0.1, 0.1);
  const lines = wrapText(text, font, size, CONTENT_WIDTH);
  for (const line of lines) {
    ensureSpace(cursor, size + 4);
    cursor.page.drawText(line, { x: MARGIN, y: cursor.y, size, font, color });
    cursor.y -= size + 4;
  }
  cursor.y -= opts.gap ?? 0;
}

export async function buildValidationReportPdf(result: ValidationResult, meta?: { generatedBy?: string }): Promise<Blob> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);

  const cursor: Cursor = { doc, font, bold, page: doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]), y: PAGE_HEIGHT - MARGIN };

  writeLine(cursor, "AI EDI Inspector — Validation Report", { size: 18, font: bold, gap: 4 });
  writeLine(cursor, result.filename, { size: 11, font: bold, color: rgb(0.06, 0.43, 0.42), gap: 2 });
  writeLine(cursor, `Generated ${new Date().toLocaleString()}${meta?.generatedBy ? ` by ${meta.generatedBy}` : ""}`, {
    size: 9,
    color: rgb(0.4, 0.4, 0.4),
    gap: 12,
  });

  if (result.fatalError) {
    writeLine(cursor, "Could not parse this file", { size: 12, font: bold, color: rgb(0.76, 0.23, 0.23), gap: 2 });
    writeLine(cursor, result.fatalError, { gap: 12 });
    return finish(doc);
  }

  writeLine(cursor, result.isValid ? "VALID — no structural issues" : `INVALID — ${result.issueCount} issue(s)`, {
    size: 12,
    font: bold,
    color: result.isValid ? rgb(0.12, 0.54, 0.3) : rgb(0.76, 0.23, 0.23),
    gap: 10,
  });

  if (result.structure) {
    const { interchange, version } = result.structure;
    writeLine(cursor, "Envelope", { size: 12, font: bold, gap: 4 });
    writeLine(cursor, `ISA control ${interchange.isaControlNumber} · ${interchange.sender} -> ${interchange.receiver} · ${interchange.usage} · v${version}`, {
      gap: 8,
    });

    for (const group of interchange.functionalGroups) {
      writeLine(cursor, `GS control ${group.gsControlNumber} (${group.functionalIdCode})`, { size: 10, font: bold, gap: 2 });
      for (const txn of group.transactionSets) {
        const name = txDisplayName(txn);
        writeLine(cursor, `  ST ${txn.transactionSetId}${name ? ` — ${name}` : ""} · control ${txn.stControlNumber} · ${txn.segments.length} segments`, {
          gap: 2,
        });
      }
    }
    cursor.y -= 8;
  }

  writeLine(cursor, "Findings", { size: 12, font: bold, gap: 4 });
  const allFindings = [...result.errors, ...result.missingFindings, ...result.warnings];
  if (allFindings.length === 0) {
    writeLine(cursor, "No structural errors, missing segments, or warnings found.", { gap: 4 });
  } else {
    for (const finding of allFindings) {
      const color =
        finding.severity === "error"
          ? rgb(0.76, 0.23, 0.23)
          : finding.severity === "warning" || finding.severity === "missing"
            ? rgb(0.63, 0.42, 0.03)
            : rgb(0.12, 0.54, 0.3);
      writeLine(cursor, `[${finding.severity.toUpperCase()}] ${finding.code}`, { size: 10, font: bold, color, gap: 1 });
      writeLine(cursor, finding.message, { size: 10, gap: finding.note ? 1 : 6 });
      if (finding.note) writeLine(cursor, finding.note, { size: 9, color: rgb(0.4, 0.4, 0.4), gap: 6 });
    }
  }

  return finish(doc);
}

async function finish(doc: PDFDocument): Promise<Blob> {
  const bytes = await doc.save();
  return new Blob([bytes as BlobPart], { type: "application/pdf" });
}
