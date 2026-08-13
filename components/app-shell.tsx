import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import InstallPrompt from "@/components/install-prompt";
import NotificationOptIn from "@/components/notification-opt-in";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/brief", label: "Daily Brief" },
  { href: "/inventory", label: "Inventory Alerts" },
  { href: "/eod", label: "End of Day" },
  { href: "/tasks", label: "Tasks" },
  { href: "/announcements", label: "Announcements" },
];

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-800 bg-neutral-900/60 sticky top-0 z-10 backdrop-blur">
        <div className="h-0.5 bg-gradient-to-r from-orange-600 via-orange-400 to-orange-600" />
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2 font-bold text-white shrink-0 tracking-tight">
              <span className="text-lg">🐺</span>
              <span>
                Wild <span className="text-orange-400">Wolf</span>
              </span>
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-md text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              {user?.role === "ADMIN" && (
                <Link
                  href="/admin/users"
                  className="px-3 py-1.5 rounded-md text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
                >
                  Team
                </Link>
              )}
            </nav>
          </div>
          {user ? (
            <div className="flex items-center gap-3">
              <NotificationOptIn />
              <span className="text-sm text-neutral-400 hidden sm:inline">
                {user.name} <span className="text-neutral-600">·</span> {user.role.toLowerCase()}
              </span>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-md border border-neutral-700 text-neutral-300 hover:bg-neutral-800 transition-colors"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm px-3 py-1.5 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors shrink-0"
            >
              Sign in
            </Link>
          )}
        </div>
        <nav className="sm:hidden flex overflow-x-auto gap-1 px-4 pb-3">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-md text-sm whitespace-nowrap text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin/users"
              className="px-3 py-1.5 rounded-md text-sm whitespace-nowrap text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
            >
              Team
            </Link>
          )}
        </nav>
      </header>
      <InstallPrompt />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
