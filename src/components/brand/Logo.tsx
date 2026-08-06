import agrofeedLogo from "@/assets/agrofeed-logo.jpg.asset.json";

export function AgrofeedLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <img
        src={agrofeedLogo.url}
        alt="Agrofeed Global"
        className="h-9 w-9 shrink-0 rounded-lg bg-white object-contain p-0.5 shadow-md"
      />
      {!compact && (
        <div className="min-w-0 leading-tight">
          <div className="truncate text-sm font-semibold tracking-tight text-sidebar-foreground">
            Agrofeed Global
          </div>
          <div className="truncate text-[10px] uppercase tracking-widest text-gold">
            Sukuk Data Room
          </div>
        </div>
      )}
    </div>
  );
}

export function SukukDataRoomLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <img
        src={agrofeedLogo.url}
        alt="Agrofeed Global"
        className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-1 ring-1 ring-gold/30"
      />
      <div className="min-w-0 leading-none">
        <div
          className={`truncate text-lg font-semibold tracking-tight sm:text-[22px] ${inverted ? "text-white" : "text-navy"}`}
        >
          SUKUK
        </div>
        <div className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-gold sm:text-[11px] sm:tracking-[0.2em]">
          Data Room
        </div>
      </div>
    </div>
  );
}
