import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { Sparkles, FileText } from "lucide-react";
import { useDocuments, useMilestones, useTasks, useCompliance, useRisks } from "@/hooks/use-modules";
import { AdvisorChat, ADVISOR_SUGGESTIONS, type AdvisorPrompt } from "@/components/advisor/AdvisorChat";

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

function Advisor() {
  const [prompt, setPrompt] = useState<AdvisorPrompt | undefined>(undefined);

  const documents = useDocuments();
  const milestones = useMilestones();
  const tasks = useTasks();
  const compliance = useCompliance();
  const risks = useRisks();

  const docNames = (documents.data ?? []).slice(0, 6).map((d) => d.name);

  return (
    <>
      <PageHeader
        title="AI Advisor"
        subtitle="Grounded in your data room · cites source records · never fabricates"
        actions={<Pill tone="gold"><Sparkles className="h-3 w-3 mr-1 inline" />Powered by Lovable AI</Pill>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5">
        <AdvisorChat variant="page" prompt={prompt} />

        <div className="space-y-3">
          <Card>
            <h3 className="text-sm font-semibold mb-3">Try asking</h3>
            <div className="space-y-2">
              {ADVISOR_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt({ text: s, key: Date.now() })}
                  className="w-full text-left text-xs rounded-lg border border-input p-2.5 hover:bg-secondary transition"
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
