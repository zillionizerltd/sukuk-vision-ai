import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Card, Button, Pill } from "@/components/ui/primitives";
import {
  CheckCircle2,
  ClipboardList,
  FileUp,
  ShieldCheck,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { useApplyAdvisorAction, type AdvisorAction } from "@/hooks/use-advisor-actions";

const META: Record<
  AdvisorAction["kind"],
  { label: string; icon: typeof ClipboardList; cta: string }
> = {
  task: { label: "Suggested task", icon: ClipboardList, cta: "Create task" },
  document_request: { label: "Document request", icon: FileUp, cta: "Request document" },
  approval: { label: "Approval item", icon: ShieldCheck, cta: "File approval item" },
};

function rows(a: AdvisorAction): [string, string][] {
  if (a.kind === "task") {
    return [
      ["Title", a.title],
      ["Owner", a.org],
      ["Assignee", a.assignee],
      ["Due", a.due_date],
      ["Priority", a.priority],
      ["Why", a.rationale],
    ];
  }
  if (a.kind === "document_request") {
    return [
      ["Document", a.document_name],
      ["Folder", a.folder],
      ["From", a.org],
      ["Needed by", a.due_date],
      ["Why", a.reason],
    ];
  }
  return [
    ["Requirement", a.requirement],
    ["Framework", a.framework],
    ["Severity", a.severity],
    ["Owner", a.owner_org],
    ["Notes", a.notes],
  ];
}

export function AdvisorActionCard({ action }: { action: AdvisorAction }) {
  const apply = useApplyAdvisorAction();
  const [done, setDone] = useState<{ label: string; link: string } | null>(null);
  const meta = META[action.kind];
  const Icon = meta.icon;

  return (
    <Card className="border-l-4 border-l-[hsl(var(--gold))]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-primary" />
        <span className="text-sm font-semibold">{meta.label}</span>
        <Pill tone="gold">One-click</Pill>
      </div>

      <dl className="space-y-1.5 text-xs">
        {rows(action)
          .filter(([, v]) => v && String(v).trim())
          .map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="w-24 shrink-0 text-muted-foreground">{k}</dt>
              <dd className="flex-1 whitespace-pre-wrap">{v}</dd>
            </div>
          ))}
      </dl>

      {done ? (
        <div className="mt-3 flex items-center gap-2 text-xs text-primary">
          <CheckCircle2 className="h-4 w-4" />
          <span className="font-medium">{done.label}.</span>
          <Link to={done.link} className="underline underline-offset-2">
            Open
          </Link>
        </div>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          <Button
            onClick={() =>
              apply.mutate(action, { onSuccess: (r) => setDone(r) })
            }
            disabled={apply.isPending}
          >
            {apply.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : meta.cta}
          </Button>
          <span className="text-[11px] text-muted-foreground">Nothing is saved until you confirm.</span>
        </div>
      )}

      {apply.isError && (
        <div className="mt-2 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-[11px] text-destructive">
          <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span className="break-words">
            {(apply.error as Error)?.message ?? "Could not save this action."}
          </span>
        </div>
      )}
    </Card>
  );
}
