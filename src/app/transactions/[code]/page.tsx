import { redirect } from "next/navigation";

// The per-code route was merged into a single /transactions page with a
// dropdown selector (?code=) so switching transaction sets doesn't need a
// full navigation. Old deep links redirect straight through.
export default async function TransactionDetailRedirect({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/transactions?code=${code}`);
}
