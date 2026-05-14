import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: ["/dashboard/:path*"],
};

export default function proxy(req: NextRequest): NextResponse {
  const expected = process.env.DASHBOARD_BASIC_AUTH;
  if (!expected) return NextResponse.next();

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    if (decoded === expected) return NextResponse.next();
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="dashboard"' },
  });
}
