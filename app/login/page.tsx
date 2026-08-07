import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/");

  const users = await db.user.findMany({
    where: { active: true },
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
          <p className="text-neutral-400 mt-1">Pick your name to continue</p>
        </div>
        <LoginForm users={users} />
      </div>
    </div>
  );
}
