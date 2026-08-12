import { NextRequest, NextResponse } from "next/server";
import { createSession, getCurrentUser, getOrCreateAutoUser } from "@/lib/auth";

// Bootstrap-only entry point — requireUser() only redirects here while no
// one in the system has a PIN set yet (see isBootstrapEligible in lib/auth.ts).
export async function GET(request: NextRequest) {
  const existing = await getCurrentUser();
  if (!existing) {
    const user = await getOrCreateAutoUser();
    await createSession({ userId: user.id, name: user.name, role: user.role });
  }

  return NextResponse.redirect(new URL("/", request.url));
}
