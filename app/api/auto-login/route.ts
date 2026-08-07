import { NextRequest, NextResponse } from "next/server";
import { createSession, getCurrentUser, getOrCreateAutoUser } from "@/lib/auth";

// TEMPORARY: see the comment on requireUser() in lib/auth.ts.
export async function GET(request: NextRequest) {
  const existing = await getCurrentUser();
  if (!existing) {
    const user = await getOrCreateAutoUser();
    await createSession({ userId: user.id, name: user.name, role: user.role });
  }

  return NextResponse.redirect(new URL("/", request.url));
}
