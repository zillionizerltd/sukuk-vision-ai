import { Link, useNavigate } from "@tanstack/react-router";
import { Search, Sparkles, HelpCircle, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth, signOut } from "@/hooks/use-auth";
import { NotificationBell } from "@/components/layout/NotificationBell";

function initials(name: string | null | undefined, email: string | null | undefined) {
  const source = (name && name.trim()) || email || "";
  const parts = source.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] ?? "?").toUpperCase() + (parts[1]?.[0] ?? "").toUpperCase();
}

export function TopBar() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const name = profile?.full_name || user?.email?.split("@")[0] || "Guest";
  const subtitle = user ? "Agrofeed Data Room" : "Not signed in";

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate({ to: "/login" });
  };

  return (
    <header className="h-16 shrink-0 border-b bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="h-full flex items-center gap-4 px-4 lg:px-8">
        <div className="hidden md:flex items-center gap-2 rounded-lg border border-input bg-secondary/50 px-3 py-1.5 text-sm">
          <span className="font-semibold text-primary">Agrofeed Sukuk 2026</span>
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>

        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const text = query.trim();
                if (!text) return;
                setQuery("");
                advisor.open(text);
              }
            }}
            placeholder="Search documents, milestones, ask a question…"
            className="w-full h-10 rounded-lg border border-input bg-secondary/40 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden lg:block text-[10px] text-muted-foreground">
            Enter to ask AI
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => advisor.open()}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg gradient-emerald px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95 transition"
          >
            <Sparkles className="h-4 w-4" />
            AI Advisor
          </button>

          <NotificationBell />
          <button className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary transition" aria-label="Help">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </button>

          <div ref={ref} className="ml-2 pl-3 border-l relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 rounded-lg hover:bg-secondary px-1.5 py-1 transition"
            >
              <div className="h-9 w-9 rounded-full gradient-gold flex items-center justify-center text-navy font-semibold text-sm">
                {initials(profile?.full_name, user?.email)}
              </div>
              <div className="hidden md:block leading-tight text-left">
                <div className="text-sm font-medium">{name}</div>
                <div className="text-[11px] text-muted-foreground">{subtitle}</div>
              </div>
            </button>
            {open && (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-background shadow-lg py-1 z-40">
                {user ? (
                  <>
                    <div className="px-3 py-2 border-b">
                      <div className="text-sm font-medium truncate">{name}</div>
                      <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
                    >
                      <UserIcon className="h-4 w-4" /> Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-secondary"
                    >
                      <LogOut className="h-4 w-4" /> Sign out
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary"
                  >
                    <UserIcon className="h-4 w-4" /> Sign in
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
