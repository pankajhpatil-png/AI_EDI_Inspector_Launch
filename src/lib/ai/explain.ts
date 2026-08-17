export class AiNotConfiguredError extends Error {}

export interface ExplainInput {
  code: string;
  message: string;
  note?: string | null;
  severity: string;
  transactionSet?: { id: string; name?: string } | null;
}

export interface ExplainResult {
  explanation: string;
  suggestedFix: string;
  provider: "anthropic" | "openrouter";
}

function buildPrompt(input: ExplainInput): string {
  const txnLine = input.transactionSet
    ? `Transaction set: ${input.transactionSet.id}${input.transactionSet.name ? " (" + input.transactionSet.name + ")" : ""}`
    : "Transaction set: unknown";
  return [
    "You are helping an EDI integration analyst understand a structural validation finding on an ANSI X12 file.",
    "Explain the finding in plain business language a non-technical stakeholder could follow, and suggest a concrete fix.",
    "",
    txnLine,
    `Severity: ${input.severity}`,
    `Finding code: ${input.code}`,
    `Finding message: ${input.message}`,
    input.note ? `Additional note: ${input.note}` : "",
    "",
    'Respond with ONLY a JSON object of the shape {"explanation": string, "suggestedFix": string}. No markdown, no code fences.',
  ]
    .filter(Boolean)
    .join("\n");
}

function parseModelJson(text: string): { explanation: string; suggestedFix: string } {
  const cleaned = text.trim().replace(/^```json\s*|\s*```$/g, "");
  try {
    const parsed = JSON.parse(cleaned);
    return {
      explanation: String(parsed.explanation ?? cleaned),
      suggestedFix: String(parsed.suggestedFix ?? ""),
    };
  } catch {
    return { explanation: cleaned, suggestedFix: "" };
  }
}

async function callAnthropic(prompt: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_EXPLAIN_MODEL || "claude-haiku-4-5-20251001",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic API error: ${res.status}`);
  const data = await res.json();
  const text = data?.content?.[0]?.text;
  if (!text) throw new Error("Anthropic API returned no content");
  return text;
}

async function callOpenRouter(prompt: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_EXPLAIN_MODEL || "anthropic/claude-3.5-haiku",
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter API error: ${res.status}`);
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error("OpenRouter API returned no content");
  return text;
}

// Dual-provider fallback mirrors deployment-handbook.md's established
// pattern: try Anthropic directly first, else OpenRouter, else surface a
// typed "not configured" error the route handler turns into a 503.
export async function explainFinding(input: ExplainInput): Promise<ExplainResult> {
  const prompt = buildPrompt(input);

  if (process.env.ANTHROPIC_API_KEY) {
    const text = await callAnthropic(prompt);
    return { ...parseModelJson(text), provider: "anthropic" };
  }
  if (process.env.OPENROUTER_API_KEY) {
    const text = await callOpenRouter(prompt);
    return { ...parseModelJson(text), provider: "openrouter" };
  }
  throw new AiNotConfiguredError("Neither ANTHROPIC_API_KEY nor OPENROUTER_API_KEY is set.");
}
