import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, MessageSquare } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useNotifications, useMarkNotifications, relativeTime } from "@/hooks/use-notifications";

export function NotificationBell() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: items = [], isLoading } = useNotifications();
  const { markOne, markAll } = useMarkNotifications();

  const unread = items.filter((n) => !n.read).length;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative h-10 w-10 inline-flex items-center justify-center rounded-lg hover:bg-secondary transition"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
      >
        <Bell className="h-5 w-5 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gold text-navy text-[10px] font-bold flex items-center justify-center ring-2 ring-background">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[90vw] rounded-lg border bg-background shadow-lg z-40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b">
            <div className="text-sm font-semibold">Notifications</div>
            {unread > 0 && (
              <button
                onClick={() => markAll.mutate()}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[24rem] overflow-y-auto">
            {isLoading && <div className="px-3 py-6 text-sm text-muted-foreground">Loading…</div>}
            {!isLoading && items.length === 0 && (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            )}
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.read) markOne.mutate(n.id);
                  setOpen(false);
                  navigate({ to: n.link });
                }}
                className={`w-full text-left flex gap-2.5 px-3 py-2.5 border-b last:border-b-0 hover:bg-secondary/60 transition ${
                  n.read ? "" : "bg-primary/5"
                }`}
              >
                <div className="mt-0.5 h-7 w-7 shrink-0 rounded-full bg-secondary flex items-center justify-center">
                  <MessageSquare className="h-3.5 w-3.5 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium truncate">{n.title}</div>
                    {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-gold shrink-0" />}
                  </div>
                  <div className="text-[12px] text-muted-foreground line-clamp-2">{n.body}</div>
                  <div className="text-[11px] text-muted-foreground/80 mt-0.5">
                    {n.actor_name}
                    {n.actor_org ? ` · ${n.actor_org}` : ""} · {relativeTime(n.created_at)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
