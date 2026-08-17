import { NextResponse, type NextRequest } from "next/server";

// Off-by-default Basic Auth gate — the BRD's own screen list has no login
// screen, so this activates only if both env vars are set. Note this is a
// Level 1/2 gate at best (see the security ladder in the main repo's
// deployment-handbook.md); don't rely on it alone for real PHI/trading-
// partner data — see README.md and app/about/page.tsx.
export function proxy(request: NextRequest) {
  const user = process.env.APP_BASIC_AUTH_USER;
  const pass = process.env.APP_BASIC_AUTH_PASS;
  if (!user || !pass) return NextResponse.next();

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const decoded = Buffer.from(authHeader.slice("Basic ".length), "base64").toString("utf-8");
    const separatorIndex = decoded.indexOf(":");
    const suppliedUser = decoded.slice(0, separatorIndex);
    const suppliedPass = decoded.slice(separatorIndex + 1);
    if (suppliedUser === user && suppliedPass === pass) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="AI EDI Inspector"' },
  });
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico).*)",
};
