import { NextResponse, type NextRequest } from "next/server";
import { AiNotConfiguredError, explainFinding } from "@/lib/ai/explain";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.code || !body.message || !body.severity) {
    return NextResponse.json({ error: "code, message, and severity are required" }, { status: 400 });
  }

  try {
    const result = await explainFinding({
      code: String(body.code),
      message: String(body.message),
      note: body.note != null ? String(body.note) : null,
      severity: String(body.severity),
      transactionSet: (body.transactionSet as { id: string; name?: string } | null) ?? null,
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof AiNotConfiguredError) {
      return NextResponse.json(
        { error: "AI explanations are not configured yet. Add ANTHROPIC_API_KEY or OPENROUTER_API_KEY to turn this on." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to get an explanation." }, { status: 502 });
  }
}
