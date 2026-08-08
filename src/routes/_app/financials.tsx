import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Card, PageHeader, Button } from "@/components/ui/primitives";
import { useFinancials } from "@/hooks/use-modules";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, Loader2, AlertCircle, UploadCloud } from "lucide-react";

export const Route = createFileRoute("/_app/financials")({
  head: () => ({ meta: [{ title: "Financials · Agrofeed Sukuk" }, { name: "description", content: "Financial intelligence and scenario analysis." }] }),
  component: Financials,
});

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card>
      <div className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-1 tabular-nums">{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </Card>
  );
}

function Financials() {
  const { data: FINANCIALS } = useFinancials();
  const { user } = useAuth();
  const r = FINANCIALS?.ratios;

  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [uploadMsg, setUploadMsg] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploadState("uploading");
    setUploadMsg(file.name);

    const path = `${user.id}/financials/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (upErr) {
      setUploadState("error");
      setUploadMsg(upErr.message);
      // reset file input
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    const { error: insErr } = await supabase.from("documents").insert({
      name: file.name,
      folder: "Financial Models",
      size_bytes: file.size,
      mime_type: file.type || null,
      storage_path: path,
      confidentiality: "confidential",
      status: "draft",
      uploaded_by: user.id,
    });

    if (insErr) {
      // rollback storage file
      await supabase.storage.from("documents").remove([path]).catch(() => {});
      setUploadState("error");
      setUploadMsg(insErr.message);
    } else {
      setUploadState("done");
      setUploadMsg(`${file.name} uploaded successfully`);
    }

    if (fileRef.current) fileRef.current.value = "";
  };

  if (!r || !FINANCIALS) return null;
  
  return (
    <>
      <input
        ref={fileRef}
        type="file"
        className="hidden"
        accept=".xlsx,.xls,.csv,.pdf"
        onChange={handleUpload}
      />
      <PageHeader
        title="Financial Intelligence"
        subtitle="Revenue, EBITDA, ratios, scenarios, and stress testing"
        actions={
          <div className="flex items-center gap-3">
            {uploadState === "uploading" && (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />{uploadMsg}
              </span>
            )}
            {uploadState === "done" && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-600">
                <CheckCircle className="h-3.5 w-3.5" />{uploadMsg}
              </span>
            )}
            {uploadState === "error" && (
              <span className="flex items-center gap-1.5 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5" />{uploadMsg}
              </span>
            )}
            <Button
              size="sm"
              onClick={() => fileRef.current?.click()}
              disabled={uploadState === "uploading"}
            >
              <UploadCloud className="h-3.5 w-3.5" />Upload financial model
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-5">
        <Metric label="DSCR" value={r.dscr != null ? r.dscr.toFixed(2) : "—"} sub="Base case" />
        <Metric label="ICR" value={r.icr != null ? r.icr.toFixed(2) : "—"} sub="Interest cover" />
        <Metric label="LTV" value={r.ltv != null ? `${Math.round(r.ltv * 100)}%` : "—"} sub="Loan / assets" />
        <Metric label="IRR" value={r.irr != null ? `${(r.irr * 100).toFixed(1)}%` : "—"} sub="Project IRR" />
        <Metric label="NPV" value={r.npvUsdM != null ? `$${r.npvUsdM}M` : "—"} sub="USD, base case" />
        <Metric label="Debt / Equity" value={r.debtEquity != null ? r.debtEquity.toFixed(2) : "—"} />
        <Metric label="Asset coverage" value={r.assetCoverage != null ? r.assetCoverage.toFixed(2) : "—"} />
        <Metric label="Current ratio" value={r.currentRatio != null ? r.currentRatio.toFixed(2) : "—"} />
        <Metric label="Quick ratio" value={r.quickRatio != null ? r.quickRatio.toFixed(2) : "—"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card>
          <h3 className="font-semibold mb-3">Revenue trajectory (USD M)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={FINANCIALS.revenue}>
              <defs><linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--brand-emerald)" stopOpacity={0.4}/><stop offset="100%" stopColor="var(--brand-emerald)" stopOpacity={0}/></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="var(--brand-emerald)" strokeWidth={2} fill="url(#rev2)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-semibold mb-3">EBITDA (USD M)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={FINANCIALS.ebitda}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="var(--brand-gold)" strokeWidth={3} dot={{ r: 4, fill: "var(--brand-gold)" }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-3">Scenario & stress testing</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={FINANCIALS.scenarios}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="revenue" fill="var(--brand-emerald)" name="Revenue" radius={[6, 6, 0, 0]} />
            <Bar dataKey="ebitda" fill="var(--brand-gold)" name="EBITDA" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </>
  );
}
