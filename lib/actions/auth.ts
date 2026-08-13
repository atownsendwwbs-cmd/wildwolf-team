"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = String(formData.get("userId") ?? "");
  const pin = String(formData.get("pin") ?? "");

  if (!userId) {
    return { error: "Select your name." };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.active) {
    return { error: "Account not found." };
  }

  // No PIN on file for this profile — a deliberate lightweight tier for
  // people who just need to receive notifications, not manage anything.
  if (!user.pinHash) {
    await createSession({ userId: user.id, name: user.name, role: user.role });
    redirect("/");
  }

  if (!pin) {
    return { error: "Enter your PIN." };
  }

  const valid = await bcrypt.compare(pin, user.pinHash);
  if (!valid) {
    return { error: "Incorrect PIN." };
  }

  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
