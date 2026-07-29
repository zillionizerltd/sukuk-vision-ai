import { Link } from "@tanstack/react-router";
import { Bell, Search, Sparkles, HelpCircle, ChevronDown } from "lucide-react";

export function TopBar() {
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
            placeholder="Search documents, milestones, ask a question…"
            className="w-full h-10 rounded-lg border border-input bg-secondary/40 pl-9 pr-3 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-ring focus:bg-background"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Link
            to="/ai-advisor"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg gradient-emerald px-3 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:opacity-95 transition"
          >
            <Sparkles className="h-4 w-4" />
            AI Advisor
          </Link>
          <button className="relative h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-secondary transition" aria-label="Notifications">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-gold ring-2 ring-background" />
          </button>
          <button className="hidden md:inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary transition" aria-label="Help">
            <HelpCircle className="h-5 w-5 text-muted-foreground" />
          </button>
          <div className="ml-2 flex items-center gap-2 pl-3 border-l">
            <div className="h-9 w-9 rounded-full gradient-gold flex items-center justify-center text-navy font-semibold text-sm">FM</div>
            <div className="hidden md:block leading-tight">
              <div className="text-sm font-medium">F. Mwakasege</div>
              <div className="text-[11px] text-muted-foreground">Agrofeed Administrator</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
