import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card, Button } from "@/components/ui/primitives";
import { Sparkles, Send, Loader2, AlertTriangle, RotateCcw, Copy, Check } from "lucide-react";
import {
  useDocuments,
  useMilestones,
  useTasks,
  useStructures,
  useCompliance,
  useRisks,
  useStakeholders,
  useFinancialMetrics,
} from "@/hooks/use-modules";
import { AdvisorActionCard } from "@/components/collab/AdvisorActionCard";
import { ChatMarkdown } from "@/components/collab/ChatMarkdown";
import type { AdvisorAction } from "@/hooks/use-advisor-actions";

export const ADVISOR_SUGGESTIONS = [
  "Summarise our current Sukuk readiness and the top blockers",
  "Which Sukuk structure best matches our asset base?",
  "List the open compliance gaps and who owns them",
  "What are the top 5 risks blocking issuance?",
  "Which milestones are at risk of slipping?",
  "Draft an investor progress update for this month",
  "Create tasks to close our top three compliance gaps",
  "Request the documents we are still missing for issuance",
];

function line(o: Record<string, unknown>) {
  return Object.entries(o)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join(" | ");
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable */
        }
      }}
      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition"
    >
      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export type AdvisorPrompt = { text: string; key: number };

export function AdvisorChat({
  variant = "page",
  prompt,
  resetKey,
}: {
  variant?: "page" | "modal";
  /** Send a message from outside the component; bump `key` for each new send. */
  prompt?: AdvisorPrompt;
  resetKey?: number;
}) {

  const [input, setInput] = useState("");
  const boxRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const documents = useDocuments();
  const milestones = useMilestones();
  const tasks = useTasks();
  const structures = useStructures();
  const compliance = useCompliance();
  const risks = useRisks();
  const stakeholders = useStakeholders();
  const financials = useFinancialMetrics();

  const context = useMemo(() => {
    const s: string[] = [];
    const section = (title: string, rows: unknown[] | undefined, map: (r: never) => string) => {
      if (!rows || rows.length === 0) {
        s.push(`## ${title}\n(no records)`);
        return;
      }
      s.push(`## ${title} (${rows.length})\n${rows.slice(0, 120).map((r) => "- " + map(r as never)).join("\n")}`);
    };

    section("Documents", documents.data, (d: any) => line({ name: d.name, folder: d.folder, status: d.status, confidentiality: d.confidentiality, updated: d.updated }));
    section("Milestones", milestones.data, (m: any) => line({ code: m.id, name: m.name, owner: m.owner, due: m.due, status: m.status, progress: `${m.progress}%` }));
    section("Tasks", tasks.data, (t: any) => line({ title: t.title ?? t.name, org: t.org, assignee: t.assignee, due: t.due, priority: t.priority, status: t.status }));
    section("Sukuk structures", structures.data, (x: any) => line(x));
    section("Compliance register", compliance.data, (c: any) => line(c));
    section("Risk register", risks.data, (r: any) => line(r));
    section("Stakeholders", stakeholders.data, (p: any) => line(p));
    section("Financial metrics", financials.data, (f: any) => line(f));

    return s.join("\n\n");
  }, [documents.data, milestones.data, tasks.data, structures.data, compliance.data, risks.data, stakeholders.data, financials.data]);

  const contextRef = useRef(context);
  contextRef.current = context;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        // Respect the deployment base path (e.g. /dataroom/) so the request is not sent to the wrong origin path.
        api: `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api/chat`,
        prepareSendMessagesRequest: ({ messages, body }) => ({
          body: { ...body, messages, context: contextRef.current },
        }),
      }),
    [],
  );

  const { messages, sendMessage, status, error, regenerate, setMessages } = useChat({
    id: `advisor-${variant}-${resetKey ?? 0}`,
    transport,
  });
  const busy = status === "submitted" || status === "streaming";
  const unreachable = !!error && /failed to fetch|networkerror|load failed|not found|404|<!doctype/i.test(error.message);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  useEffect(() => {
    if (!busy) boxRef.current?.focus();
  }, [busy]);

  const sentInitial = useRef<string | undefined>(undefined);
  useEffect(() => {
    const prompt = initialPrompt?.trim();
    if (!prompt || sentInitial.current === prompt) return;
    sentInitial.current = prompt;
    setMessages([]);
    void sendMessage({ text: prompt });
  }, [initialPrompt, sendMessage, setMessages]);

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  };

  useEffect(() => {
    onSuggestionsChange?.((text: string) => {
      if (busy) return;
      setInput("");
      void sendMessage({ text });
    });
  }, [onSuggestionsChange, sendMessage, busy]);

  return (
    <div className={variant === "modal" ? "flex h-full min-h-0 flex-col" : "space-y-4"}>
      <div
        className={
          variant === "modal"
            ? "flex-1 min-h-0 overflow-y-auto space-y-4 px-4 py-4"
            : "space-y-4"
        }
      >
        {messages.length === 0 && (
          <Card>
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="text-sm leading-relaxed text-muted-foreground">
                Ask me anything about the Sukuk programme. I read the live data room — documents, milestones, tasks,
                structures, compliance register, risks, stakeholders and financial metrics — and cite what I used.
              </div>
            </div>
          </Card>
        )}

        {messages.length === 0 && variant === "modal" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ADVISOR_SUGGESTIONS.slice(0, 6).map((s) => (
              <button
                key={s}
                onClick={() => { setInput(""); void sendMessage({ text: s }); }}
                disabled={busy}
                className="text-left text-xs rounded-lg border border-input p-2.5 hover:bg-secondary transition disabled:opacity-50"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((m) => {
          const text = m.parts.map((p) => (p.type === "text" ? p.text : "")).join("");
          const actions = m.parts
            .filter(
              (p: any) =>
                typeof p.type === "string" &&
                p.type.startsWith("tool-") &&
                p.state === "output-available" &&
                p.output?.kind,
            )
            .map((p: any) => p.output as AdvisorAction);
          const pendingActions = m.parts.some(
            (p: any) =>
              typeof p.type === "string" &&
              p.type.startsWith("tool-") &&
              (p.state === "input-streaming" || p.state === "input-available"),
          );
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm whitespace-pre-wrap">
                  {text}
                </div>
              </div>
            );
          }
          return (
            <div key={m.id} className="flex gap-3">
              <div className="h-8 w-8 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
                <Sparkles className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                {(text || (!actions.length && !pendingActions)) && (
                  <Card>
                    {text ? (
                      <>
                        <ChatMarkdown>{text}</ChatMarkdown>
                        {!busy && (
                          <div className="mt-2 flex justify-end">
                            <CopyButton text={text} />
                          </div>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-muted-foreground">Thinking…</span>
                    )}
                  </Card>
                )}

                {pendingActions && !actions.length && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Preparing an action…
                  </div>
                )}
                {actions.map((a, i) => (
                  <AdvisorActionCard key={`${m.id}-action-${i}`} action={a} />
                ))}
              </div>
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-11">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Reading the data room…
          </div>
        )}

        {error && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-lg bg-destructive/15 flex items-center justify-center shrink-0">
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <div className="flex-1 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <div className="font-medium">The AI Advisor could not answer your last message.</div>
                  <div className="mt-1 break-words opacity-90">{error.message}</div>
                  {unreachable && (
                    <div className="mt-2 rounded-md bg-destructive/10 p-2 leading-relaxed opacity-90">
                      The Advisor service could not be reached. If this app is served under
                      <code className="mx-1 font-mono">/dataroom</code>, make sure the reverse proxy forwards
                      <code className="mx-1 font-mono">POST /dataroom/api/chat</code> to the app, preserving the prefix.
                    </div>
                  )}
                </div>
                <button
                  onClick={() => regenerate()}
                  className="inline-flex shrink-0 items-center gap-1 rounded-md border border-destructive/40 px-2 py-1 hover:bg-destructive/15"
                >
                  <RotateCcw className="h-3 w-3" /> Retry
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={endRef} />
      </div>

      <Card className={variant === "modal" ? "!p-3 !rounded-none border-0 border-t" : "!p-3 sticky bottom-0"}>
        <div className="flex items-end gap-2">
          <textarea
            ref={boxRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={2}
            placeholder="Ask about any document, milestone, risk, compliance issue, or Sukuk structure…"
            className="flex-1 resize-none rounded-lg bg-background border border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <Button onClick={send} disabled={busy || !input.trim()} className="h-11">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
          AI Advisor cites records and clearly states when information is missing. Responses are analytical support only — not legal, financial, or Sharia advice.
        </p>
      </Card>
    </div>
  );
}
