"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = String(formData.get("userId") ?? "");

  if (!userId) {
    return { error: "Select your name." };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || !user.active) {
    return { error: "Account not found." };
  }

  await createSession({ userId: user.id, name: user.name, role: user.role });
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
