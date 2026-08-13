import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";
import InstallPrompt from "@/components/install-prompt";
import NotificationOptIn from "@/components/notification-opt-in";
import LanguagePreference from "@/components/language-preference";

type IconProps = { className?: string };

function DashboardIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" stroke="currentColor" className={className}>
      <rect x="3.5" y="3.5" width="7.5" height="7.5" rx="1.2" />
      <rect x="13" y="3.5" width="7.5" height="4.5" rx="1.2" />
      <rect x="13" y="10.5" width="7.5" height="10" rx="1.2" />
      <rect x="3.5" y="13.5" width="7.5" height="7" rx="1.2" />
    </svg>
  );
}

function BriefIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" stroke="currentColor" className={className}>
      <path d="M6 3.5h9l4.5 4.5V20a.5.5 0 0 1-.5.5H6a.5.5 0 0 1-.5-.5V4a.5.5 0 0 1 .5-.5Z" strokeLinejoin="round" />
      <path d="M15 3.5V8h4.5" strokeLinejoin="round" />
      <path d="M8.5 12h7M8.5 15.5h7M8.5 8.5h3" strokeLinecap="round" />
    </svg>
  );
}

function InventoryIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" stroke="currentColor" className={className}>
      <path d="M3.5 7.5 12 3l8.5 4.5V16.5L12 21l-8.5-4.5Z" strokeLinejoin="round" />
      <path d="M3.5 7.5 12 12l8.5-4.5M12 12v9" strokeLinejoin="round" />
    </svg>
  );
}

function EodIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" stroke="currentColor" className={className}>
      <path d="M20 13.8A8 8 0 1 1 10.2 4a6.4 6.4 0 0 0 9.8 9.8Z" strokeLinejoin="round" />
    </svg>
  );
}

function TasksIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" stroke="currentColor" className={className}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="2.5" />
      <path d="m7.5 12 2.7 2.7L16.5 9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnnouncementIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" stroke="currentColor" className={className}>
      <path d="M3.5 10.5v3a1 1 0 0 0 1 1H6l1.2 5H10l-1-5h1.3L18 22V3l-7.7 3.5H6a1 1 0 0 0-1 1v.01" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function TeamIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.75" stroke="currentColor" className={className}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c.7-3.4 2.9-5.2 5.5-5.2S13.8 16.6 14.5 20" strokeLinecap="round" />
      <circle cx="17" cy="8.5" r="2.4" />
      <path d="M15.8 14.9c2.2.2 3.7 1.9 4.2 5.1" strokeLinecap="round" />
    </svg>
  );
}

const NAV_LINKS = [
  { href: "/", Icon: DashboardIcon },
  { href: "/brief", Icon: BriefIcon },
  { href: "/inventory", Icon: InventoryIcon },
  { href: "/eod", Icon: EodIcon },
  { href: "/tasks", Icon: TasksIcon },
  { href: "/announcements", Icon: AnnouncementIcon },
] as const;

const TAB_LINKS = [
  { href: "/", Icon: DashboardIcon },
  { href: "/brief", Icon: BriefIcon },
  { href: "/inventory", Icon: InventoryIcon },
  { href: "/tasks", Icon: TasksIcon },
  { href: "/announcements", Icon: AnnouncementIcon },
] as const;

const NAV_COPY = {
  "/": { EN: "Dashboard", ES: "Panel" },
  "/brief": { EN: "Daily Brief", ES: "Aviso Diario" },
  "/inventory": { EN: "Inventory Alerts", ES: "Alertas de Inventario" },
  "/eod": { EN: "End of Day", ES: "Fin del Día" },
  "/tasks": { EN: "Tasks", ES: "Tareas" },
  "/announcements": { EN: "Announcements", ES: "Anuncios" },
} as const;

const TAB_COPY = {
  "/": { EN: "Home", ES: "Inicio" },
  "/brief": { EN: "Brief", ES: "Aviso" },
  "/inventory": { EN: "Alerts", ES: "Alertas" },
  "/tasks": { EN: "Tasks", ES: "Tareas" },
  "/announcements": { EN: "News", ES: "Noticias" },
} as const;

const MISC_COPY = {
  team: { EN: "Team", ES: "Equipo" },
  signIn: { EN: "Sign in", ES: "Iniciar sesión" },
  signOut: { EN: "Sign out", ES: "Cerrar sesión" },
} as const;

export default async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const lang = user?.preferredLang ?? "EN";

  return (
    <div className="min-h-screen flex flex-col sm:flex-row">
      {/* Desktop sidebar */}
      <aside className="hidden sm:flex sm:flex-col sm:w-60 sm:shrink-0 sm:sticky sm:top-0 sm:h-screen bg-sky-900">
        <Link href="/" className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10 shrink-0">
          <Image src="/brand/wolf-icon-white.png" alt="" width={30} height={30} className="shrink-0" />
          <span className="font-display text-white text-lg leading-[0.95] uppercase tracking-wide">
            Wild
            <br />
            Wolf
          </span>
        </Link>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <link.Icon className="w-5 h-5 shrink-0" />
              {NAV_COPY[link.href][lang]}
            </Link>
          ))}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin/users"
              className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            >
              <TeamIcon className="w-5 h-5 shrink-0" />
              {MISC_COPY.team[lang]}
            </Link>
          )}
        </nav>

        <div className="p-3 border-t border-white/10 shrink-0 space-y-3">
          {user ? (
            <>
              <div className="flex items-center justify-between px-1">
                <LanguagePreference initial={user.preferredLang} />
                <NotificationOptIn />
              </div>
              <p className="text-xs text-white/60 px-1 truncate">
                {user.name} <span className="text-white/30">·</span> {user.role.toLowerCase()}
              </p>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="w-full text-sm px-3 py-2 rounded-md border border-white/20 text-white/80 hover:bg-white/10 transition-colors"
                >
                  {MISC_COPY.signOut[lang]}
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="block text-center text-sm px-3 py-2 rounded-md bg-orange-600 hover:bg-orange-500 text-white font-semibold transition-colors"
            >
              {MISC_COPY.signIn[lang]}
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sm:hidden sticky top-0 z-20 bg-sky-900">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <Image src="/brand/wolf-icon-white.png" alt="" width={26} height={26} />
            <span className="font-display text-white uppercase tracking-wide">Wild Wolf</span>
          </Link>
          <div className="flex items-center gap-2 shrink-0">
            {user?.role === "ADMIN" && (
              <Link href="/admin/users" className="text-xs font-medium text-white/70 hover:text-white px-2">
                {MISC_COPY.team[lang]}
              </Link>
            )}
            {user && <LanguagePreference initial={user.preferredLang} />}
            {user ? (
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-xs px-2.5 py-1.5 rounded-md border border-white/20 text-white/80"
                >
                  {MISC_COPY.signOut[lang]}
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                className="text-xs px-2.5 py-1.5 rounded-md bg-orange-600 text-white font-semibold"
              >
                {MISC_COPY.signIn[lang]}
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 flex flex-col min-w-0">
        <InstallPrompt />
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-6 pb-24 sm:pb-6">{children}</main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        className="sm:hidden fixed bottom-0 inset-x-0 z-20 bg-sky-900 border-t border-white/10 flex items-stretch"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {TAB_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2 text-white/70"
          >
            <link.Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{TAB_COPY[link.href][lang]}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
