import { NextResponse } from "next/server";
import { getAnalyticsSummary } from "@/lib/db/analyticsRepo";
import { DbNotConfiguredError, isDbConfigured } from "@/lib/db/client";

export async function GET() {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Analytics storage is not configured yet." }, { status: 503 });
  }
  try {
    const summary = await getAnalyticsSummary();
    return NextResponse.json(summary);
  } catch (e) {
    if (e instanceof DbNotConfiguredError) {
      return NextResponse.json({ error: "Analytics storage is not configured yet." }, { status: 503 });
    }
    return NextResponse.json({ error: "Failed to load analytics." }, { status: 502 });
  }
}
