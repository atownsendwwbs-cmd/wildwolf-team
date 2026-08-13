import Link from "next/link";
import Image from "next/image";
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
          <Image src="/brand/wolf-icon-navy.png" alt="" width={56} height={56} className="mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-black tracking-tight">
            Wild <span className="text-orange-600">Wolf</span> Warehouse
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
