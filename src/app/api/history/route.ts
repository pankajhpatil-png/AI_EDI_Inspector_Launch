import { NextResponse, type NextRequest } from "next/server";
import { DbNotConfiguredError, isDbConfigured } from "@/lib/db/client";
import { insertHistoryRun, listHistoryRuns } from "@/lib/db/historyRepo";

const NOT_CONFIGURED_MESSAGE = "History storage is not configured yet.";

export async function GET(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }

  const { searchParams } = new URL(request.url);
  try {
    const result = await listHistoryRuns({
      limit: searchParams.get("limit") ? Number(searchParams.get("limit")) : undefined,
      offset: searchParams.get("offset") ? Number(searchParams.get("offset")) : undefined,
      transactionSet: searchParams.get("transactionSet") ?? undefined,
      validOnly: searchParams.get("validOnly") === "true",
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof DbNotConfiguredError) {
      return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to load history." }, { status: 502 });
  }
}

export async function POST(request: NextRequest) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!Array.isArray(body.transactionSets) || typeof body.fileCount !== "number" || typeof body.isValid !== "boolean") {
    return NextResponse.json({ error: "transactionSets, fileCount, and isValid are required" }, { status: 400 });
  }

  try {
    const record = await insertHistoryRun({
      transactionSets: body.transactionSets as string[],
      fileCount: body.fileCount,
      isValid: body.isValid,
      errorCount: typeof body.errorCount === "number" ? body.errorCount : 0,
      warningCount: typeof body.warningCount === "number" ? body.warningCount : 0,
      missingCount: typeof body.missingCount === "number" ? body.missingCount : 0,
      source: body.source === "paste" ? "paste" : "upload",
    });
    return NextResponse.json({ record }, { status: 201 });
  } catch (e) {
    if (e instanceof DbNotConfiguredError) {
      return NextResponse.json({ error: NOT_CONFIGURED_MESSAGE }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to record this validation run." }, { status: 502 });
  }
}
