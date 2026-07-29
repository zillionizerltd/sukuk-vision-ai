import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
import { Sparkles, Send, FileText } from "lucide-react";

export const Route = createFileRoute("/_app/ai-advisor")({
  head: () => ({ meta: [{ title: "AI Advisor · Agrofeed Sukuk" }, { name: "description", content: "AI assistant grounded in your data room." }] }),
  component: Advisor,
});

const SUGGESTIONS = [
  "Summarise the Financial Model v4 assumptions",
  "Which Sukuk structure best matches our asset base?",
  "List all missing documents needed for AAOIFI compliance",
  "Compare 2024 revenue in the Business Plan vs Audited FS",
  "Draft an investor progress update for this month",
  "What are the top 5 risks blocking issuance?",
];

const SEED = [
  {
    q: "What is our current Sukuk readiness score and why?",
    a: `Overall readiness is **68%**. The strongest areas are Financial (74%) and ESG (71%). The weakest are SPV readiness (55%) and Legal readiness (58%).

Key drivers pulling the score down:
1. SPV constitutional documents pending finalisation (owner: Al Huda CIBE)
2. IFSB-19 Sukuk disclosure package identified as a compliance gap
3. Legal due diligence 40% complete
4. 27 missing documents flagged by AI gap analysis

**Sources:** Executive Dashboard · AI Gap Analysis · Compliance Register (updated 2025-11-14).

_This response is generated from documents currently in the data room. It is not legal, financial, or Sharia advice._`,
  },
];

function Advisor() {
  const [messages, setMessages] = useState(SEED);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, {
      q: input,
      a: "I couldn't find enough information in the data room to answer this precisely. Please upload the related documents (e.g. draft prospectus, revised financial model, or SPV governance charter) and re-ask.\n\n_This response is generated from documents currently in the data room. It is not legal, financial, or Sharia advice._",
    }]);
    setInput("");
  };

  return (
    <>
      <PageHeader
        title="AI Advisor"
        subtitle="Grounded in your data room · cites source documents · never fabricates"
        actions={<Pill tone="gold"><Sparkles className="h-3 w-3 mr-1 inline" />Powered by Lovable AI</Pill>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <div className="space-y-4">
          {messages.map((m, i) => (
            <div key={i} className="space-y-3">
              <div className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-primary text-primary-foreground px-4 py-2.5 text-sm">{m.q}</div>
              </div>
              <div className="flex gap-3">
                <div className="h-8 w-8 rounded-lg gradient-emerald flex items-center justify-center shrink-0"><Sparkles className="h-4 w-4 text-primary-foreground" /></div>
                <Card className="flex-1">
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed">{m.a}</div>
                </Card>
              </div>
            </div>
          ))}

          <Card className="!p-3 sticky bottom-0">
            <div className="flex items-end gap-2">
              <textarea
                value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                rows={2}
                placeholder="Ask about any document, milestone, risk, compliance issue, or Sukuk structure…"
                className="flex-1 resize-none rounded-lg bg-background border border-input p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button onClick={send} className="h-11"><Send className="h-4 w-4" /></Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 leading-relaxed">
              AI Advisor cites documents and clearly states when information is missing. Responses are analytical support only — not legal, financial, or Sharia advice.
            </p>
          </Card>
        </div>

        <div className="space-y-3">
          <Card>
            <h3 className="text-sm font-semibold mb-3">Try asking</h3>
            <div className="space-y-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => setInput(s)} className="w-full text-left text-xs rounded-lg border border-input p-2.5 hover:bg-secondary transition">
                  {s}
                </button>
              ))}
            </div>
          </Card>
          <Card>
            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><FileText className="h-3.5 w-3.5" />Cited sources</h3>
            <div className="space-y-1.5 text-xs text-muted-foreground">
              <div>Financial Model v4.xlsx</div>
              <div>Business Plan 2025-2030.pdf</div>
              <div>Feasibility Study - Feed Mill.pdf</div>
              <div>Draft Sukuk Term Sheet.pdf</div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
