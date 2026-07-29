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
