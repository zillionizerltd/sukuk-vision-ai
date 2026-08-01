import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { Sparkles, Send, FileText, Loader2, AlertTriangle, RotateCcw } from "lucide-react";
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
import type { AdvisorAction } from "@/hooks/use-advisor-actions";

export const Route = createFileRoute("/_app/ai-advisor")({
  head: () => ({
    meta: [
      { title: "AI Advisor · Agrofeed Sukuk Data Room" },
      { name: "description", content: "AI assistant grounded in your Sukuk data room documents, compliance register and risks." },
      { property: "og:title", content: "AI Advisor · Agrofeed Sukuk Data Room" },
      { property: "og:description", content: "Ask questions about structuring, compliance and risk — answers grounded in your data room." },
    ],
  }),
  component: Advisor,
});

const SUGGESTIONS = [
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

function Advisor() {
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


  const { messages, sendMessage, status, error, regenerate } = useChat({ transport });
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  useEffect(() => {
    if (!busy) boxRef.current?.focus();
  }, [busy]);

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    void sendMessage({ text });
  };

  const docNames = (documents.data ?? []).slice(0, 6).map((d) => d.name);

  return (
    <>
      <PageHeader
        title="AI Advisor"
        subtitle="Grounded in your data room · cites source records · never fabricates"
        actions={<Pill tone="gold"><Sparkles className="h-3 w-3 mr-1 inline" />Powered by Lovable AI</Pill>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
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

          {messages.map((m) => {
            const text = m.parts
              .map((p) => (p.type === "text" ? p.text : ""))
              .join("");
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
                <div className="flex-1 space-y-3">
                  {(text || (!actions.length && !pendingActions)) && (
                    <Card>
                      {text ? (
                        <ChatMarkdown>{text}</ChatMarkdown>
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
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium">The AI Advisor could not answer.</div>
                <div className="mt-1 break-words opacity-90">{error.message}</div>
              </div>
              <button onClick={() => regenerate()} className="inline-flex items-center gap-1 rounded-md border border-destructive/40 px-2 py-1">
                <RotateCcw className="h-3 w-3" /> Retry
              </button>
            </div>
          )}

          <div ref={endRef} />

          <Card className="!p-3 sticky bottom-0">
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

        <div className="space-y-3">
          <Card>
            <h3 className="text-sm font-semibold mb-3">Try asking</h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(""); void sendMessage({ text: s }); }}
                  disabled={busy}
                  className="w-full text-left text-xs rounded-lg border border-input p-2.5 hover:bg-secondary transition disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" />Data room in scope
            </h3>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div>{documents.data?.length ?? 0} documents · {milestones.data?.length ?? 0} milestones · {tasks.data?.length ?? 0} tasks</div>
              <div>{compliance.data?.length ?? 0} compliance items · {risks.data?.length ?? 0} risks</div>
              {docNames.map((n) => (
                <div key={n} className="truncate">{n}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
