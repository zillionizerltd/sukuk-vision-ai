import agrofeedLogo from "../../assets/agrofeed-logo.jpg";

export function AgrofeedLogo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5">
      <img
        src={agrofeedLogo}
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
    <div className="flex min-w-0 items-center gap-3 sm:gap-4">
      <img
        src={agrofeedLogo}
        alt="Agrofeed Global"
        className="h-12 w-auto max-w-[168px] shrink-0 rounded-lg bg-white object-contain px-2 py-1 sm:h-14 sm:max-w-[210px]"
      />
      <div className="min-w-0 border-l border-gold/40 pl-3 leading-none sm:pl-4">

        <div
          className={`truncate text-lg font-extrabold tracking-tight sm:text-[36px] ${inverted ? "text-white" : "text-navy"}`}
        >
          SUKUK
        </div>
        <div className="truncate text-[12px] font-bold uppercase tracking-[0.18em] text-gold sm:text-[13px] sm:tracking-[0.2em]">
          Data Room
        </div>
      </div>
    </div>
  );
}
