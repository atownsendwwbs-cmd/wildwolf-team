import Link from "next/link";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  const users = await db.user.findMany({
    where: { active: true, pinHash: { not: null } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, role: true },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🐺</div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Wild <span className="text-orange-400">Wolf</span> Warehouse
          </h1>
          <p className="text-neutral-400 mt-1">Sign in to post or manage — no PIN? Just browse instead.</p>
        </div>
        {users.length === 0 ? (
          <p className="text-sm text-neutral-500 text-center">
            No sign-in profiles yet. Ask your admin to set one up from Team.
          </p>
        ) : (
          <LoginForm users={users} />
        )}
        <p className="text-center mt-6">
          <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">
            ← Back to browsing without signing in
          </Link>
        </p>
      </div>
    </div>
  );
}
