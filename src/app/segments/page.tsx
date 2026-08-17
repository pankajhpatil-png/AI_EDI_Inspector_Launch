import { redirect } from "next/navigation";

// Segment Explorer was merged into Transaction Explorer — segment detail
// now lives inline in the transaction tree, since a segment only makes
// sense in the context of the transaction set that requires it.
export default function SegmentsIndexRedirect() {
  redirect("/transactions");
}
