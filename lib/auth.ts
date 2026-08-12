import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { db } from "./db";
import type { Role } from "./generated/prisma/enums";

const COOKIE_NAME = "wwb_session";
const SESSION_DURATION = 60 * 60 * 24 * 14; // 14 days

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is not set");
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: string;
  name: string;
  role: Role;
};

export async function createSession(payload: SessionPayload) {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: payload.userId as string,
      name: payload.name as string,
      role: payload.role as Role,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || !user.active) return null;
  return user;
}

export const AUTO_LOGIN_USER_NAME = "Admin";

export async function getOrCreateAutoUser() {
  const existing = await db.user.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return db.user.create({
    data: { name: AUTO_LOGIN_USER_NAME, role: "ADMIN" },
  });
}

// Bootstrap mode: as long as nobody in the system has a PIN set yet,
// there's no way for anyone to sign in "for real" — so the very first
// visit auto-logs in as an admin (via /api/auto-login) so someone can
// reach Team and set up their name + PIN. The moment any PIN exists,
// this closes and everyone needs a real name + PIN to sign in.
async function isBootstrapEligible() {
  const pinnedUserCount = await db.user.count({ where: { pinHash: { not: null } } });
  return pinnedUserCount === 0;
}

// Viewing the app (dashboard, briefs, alerts, reports) never requires
// signing in — use getCurrentUser() directly for read-only pages. This
// is only for pages/actions that write data or manage the team.
export async function requireUser() {
  const user = await getCurrentUser();
  if (user) return user;

  if (await isBootstrapEligible()) {
    redirect("/api/auto-login");
  }
  redirect("/login");
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser();
  if (!roles.includes(user.role)) {
    redirect("/");
  }
  return user;
}

export const MANAGER_ROLES: Role[] = ["ADMIN", "MANAGER"];
