import { redirect } from "next/navigation";
import { SEGMENT_REFERENCE } from "@/lib/reference/segments";

// Segment Explorer was merged into Transaction Explorer — redirect old
// deep links to the segment's first transaction set, with the segment
// pre-highlighted in that tree.
export default async function SegmentDetailRedirect({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const entry = SEGMENT_REFERENCE[code.toUpperCase()];
  const firstTx = entry?.usedIn[0];
  redirect(firstTx ? `/transactions?code=${firstTx}&seg=${code.toUpperCase()}` : "/transactions");
}
