export function AgrofeedLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative flex h-9 w-9 items-center justify-center rounded-lg gradient-emerald shadow-md">
        <span className="text-lg font-bold text-primary-foreground">A</span>
        <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-gold ring-2 ring-sidebar" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-tight text-sidebar-foreground">Agrofeed Global</div>
          <div className="text-[10px] uppercase tracking-widest text-gold">Sukuk Data Room</div>
        </div>
      )}
    </div>
  );
}

export function SukukDataRoomLogo({ inverted = false }: { inverted?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-gold/15 ring-1 ring-gold/30">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          className="h-7 w-7"
          aria-hidden="true"
        >
          <path
            d="M20 2L23.5 16.5L38 20L23.5 23.5L20 38L16.5 23.5L2 20L16.5 16.5L20 2Z"
            stroke="currentColor"
            strokeWidth="1.5"
            className={inverted ? "text-gold" : "text-gold"}
            fill="none"
          />
          <circle
            cx="20"
            cy="20"
            r="5"
            stroke="currentColor"
            strokeWidth="1.5"
            className={inverted ? "text-gold" : "text-gold"}
            fill="none"
          />
        </svg>
      </div>
      <div className="leading-none">
        <div className={`text-[22px] font-semibold tracking-tight ${inverted ? "text-white" : "text-navy"}`}>
          SUKUK
        </div>
        <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold">
          Data Room
        </div>
      </div>
    </div>
  );
}
