import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X, Maximize2, RefreshCw } from "lucide-react";
import { AdvisorChat, type AdvisorPrompt } from "@/components/advisor/AdvisorChat";

type AdvisorContextValue = { open: (initialPrompt?: string) => void; close: () => void };

const AdvisorContext = createContext<AdvisorContextValue | null>(null);

export function useAdvisor() {
  const ctx = useContext(AdvisorContext);
  if (!ctx) throw new Error("useAdvisor must be used inside AdvisorProvider");
  return ctx;
}

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState<AdvisorPrompt | undefined>(undefined);
  const [resetKey, setResetKey] = useState(0);

  const open = useCallback((initialPrompt?: string) => {
    setIsOpen(true);
    const text = initialPrompt?.trim();
    if (text) setPrompt({ text, key: Date.now() });
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  const value = useMemo(() => ({ open, close }), [open, close]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen]);

  return (
    <AdvisorContext.Provider value={value}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            onClick={close}
            aria-hidden
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="AI Advisor"
            className="relative flex h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b px-4 py-3">
              <div className="h-8 w-8 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold leading-tight">AI Advisor</div>
                <div className="text-[11px] text-muted-foreground truncate">
                  Grounded in your data room · cites source records
                </div>
              </div>
              <button
                onClick={() => {
                  setPrompt(undefined);
                  setResetKey((k) => k + 1);
                }}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-2.5 text-xs hover:bg-secondary transition"
              >
                <RefreshCw className="h-3.5 w-3.5" /> New
              </button>
              <Link
                to="/ai-advisor"
                onClick={close}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input px-2.5 text-xs hover:bg-secondary transition"
              >
                <Maximize2 className="h-3.5 w-3.5" /> Full page
              </Link>
              <button
                onClick={close}
                aria-label="Close AI Advisor"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-secondary transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1">
              <AdvisorChat variant="modal" prompt={prompt} resetKey={resetKey} />
            </div>
          </div>
        </div>
      )}
    </AdvisorContext.Provider>
  );
}
