import { NextResponse } from "next/server";
import { isDbConfigured } from "@/lib/db/client";

export async function GET() {
  return NextResponse.json({
    aiConfigured: Boolean(process.env.ANTHROPIC_API_KEY || process.env.OPENROUTER_API_KEY),
    dbConfigured: isDbConfigured(),
  });
}
