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

  if (!userId || !pin) {
    return { error: "Select your name and enter your PIN." };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.active) {
    return { error: "Account not found." };
  }

  if (!user.pinHash) {
    return { error: "This profile doesn't have a PIN set yet — ask your admin to set one from Team." };
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
