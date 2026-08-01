import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type Sheet = { name: string; rows: string[][] };

/** Renders .xlsx/.xls/.csv as sheet tabs + table grid using SheetJS (client-only). */
export function SheetViewer({
  src,
  className,
  onError,
}: {
  src: string;
  className?: string;
  onError?: (message: string) => void;
}) {
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const XLSX = await import("xlsx");
        const buffer = await (await fetch(src)).arrayBuffer();
        const wb = XLSX.read(buffer, { type: "array" });
        const parsed: Sheet[] = wb.SheetNames.map((name) => ({
          name,
          rows: XLSX.utils.sheet_to_json<string[]>(wb.Sheets[name], {
            header: 1,
            raw: false,
            defval: "",
            blankrows: false,
          }) as unknown as string[][],
        }));
        if (cancelled) return;
        setSheets(parsed);
        setActive(0);
      } catch (e) {
        if (!cancelled) onError?.((e as Error).message || "Failed to read spreadsheet");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [src, onError]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Reading spreadsheet…
      </div>
    );
  }
  if (sheets.length === 0) return null;

  const sheet = sheets[Math.min(active, sheets.length - 1)];
  const [head, ...body] = sheet.rows.length ? sheet.rows : [[]];
  const cols = Math.max(head?.length ?? 0, ...body.map((r) => r.length), 1);

  return (
    <div className={className}>
      {sheets.length > 1 && (
        <div className="flex flex-wrap gap-1 border-b bg-card p-2">
          {sheets.map((s, i) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setActive(i)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-medium ${
                i === active
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
      <div className="overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead className="sticky top-0 z-10">
            <tr>
              {Array.from({ length: cols }).map((_, c) => (
                <th
                  key={c}
                  className="border border-border bg-secondary p-2 text-left font-semibold"
                >
                  {head?.[c] ?? ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, r) => (
              <tr key={r} className="odd:bg-secondary/20">
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="border border-border p-2 tabular-nums">
                    {row[c] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {body.length === 0 && (
          <div className="p-4 text-center text-xs text-muted-foreground">
            This sheet has no data rows.
          </div>
        )}
      </div>
    </div>
  );
}
