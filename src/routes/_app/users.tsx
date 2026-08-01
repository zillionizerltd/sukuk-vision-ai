import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { useFolderAccess, useToggleFolderAccess } from "@/hooks/use-folder-access";
import {
  useOrganisations,
  useCreateOrganisation,
  useUpdateOrganisation,
  useDeleteOrganisation,
} from "@/hooks/use-organisations";
import { RoleDefinitionsPanel } from "@/components/admin/RoleDefinitionsPanel";
import { FOLDERS } from "@/lib/demo-data";
import { ShieldCheck, Check, FolderOpen, Building2, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_app/users")({
  head: () => ({
    meta: [
      { title: "User roles · Agrofeed Sukuk Data Room" },
      { name: "description", content: "Assign platform roles to Agrofeed Sukuk Data Room users." },
      { property: "og:title", content: "User roles · Agrofeed Sukuk Data Room" },
      { property: "og:description", content: "Assign platform roles to Agrofeed Sukuk Data Room users." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UsersPage,
});

const ROLES = ["admin", "advisor", "auditor", "investor", "member"] as const;
type Role = (typeof ROLES)[number];

function UsersPage() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const { data: orgs } = useOrganisations();
  const ORGS = (orgs ?? []).map((o) => o.name);
  const [accessOrg, setAccessOrg] = useState<string>("");
  const [newOrg, setNewOrg] = useState("");
  const [newOrgPartner, setNewOrgPartner] = useState(false);
  const createOrg = useCreateOrganisation();
  const updateOrg = useUpdateOrganisation();
  const deleteOrg = useDeleteOrganisation();
  const { data: access } = useFolderAccess();
  const toggleFolder = useToggleFolderAccess();

  const accessOrgs = ORGS.filter((o) => o.toLowerCase() !== "agrofeed global");
  const selectedAccessOrg = accessOrg || accessOrgs[0] || "";



  useEffect(() => {
    if (!loading && !isAdmin) navigate({ to: "/documents", replace: true });
  }, [loading, isAdmin, navigate]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    enabled: isAdmin,
    queryFn: async () => {
      const [{ data: profiles, error: e1 }, { data: roles, error: e2 }] = await Promise.all([
        supabase.from("profiles").select("id, full_name, org").order("created_at"),
        supabase.from("user_roles").select("user_id, role"),
      ]);
      if (e1) throw e1;
      if (e2) throw e2;
      return (profiles ?? []).map((p) => ({
        ...p,
        roles: (roles ?? []).filter((r) => r.user_id === p.id).map((r) => r.role as Role),
      }));
    },
  });

  const toggle = async (userId: string, role: Role, has: boolean) => {
    setBusy(`${userId}:${role}`);
    setMsg(null);
    const { error } = has
      ? await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role)
      : await supabase.from("user_roles").insert({ user_id: userId, role });
    setBusy(null);
    if (error) setMsg(`${error.message}`);
    else {
      setMsg(`${has ? "Removed" : "Granted"} ${role}.`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    }
  };

  const changeOrg = async (userId: string, org: string) => {
    setBusy(`${userId}:org`);
    setMsg(null);
    const { error } = await supabase.from("profiles").update({ org }).eq("id", userId);
    setBusy(null);
    if (error) setMsg(error.message);
    else {
      setMsg(`Organisation set to ${org}.`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    }
  };


  if (loading || !isAdmin) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <>
      <PageHeader
        title="User roles"
        subtitle="Assign organisations and grant or revoke platform roles. Admins and advisors have full write access."
      />

      {msg && <div className="mb-4 text-xs text-muted-foreground">{msg}</div>}

      <Card className="overflow-x-auto">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <ShieldCheck className="h-4 w-4 text-primary" /> Members
        </h3>
        {isLoading ? (
          <div className="text-sm text-muted-foreground">Loading users…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground border-b">
                <th className="py-2 pr-4">User</th>
                <th className="py-2 pr-4">Organisation</th>
                <th className="py-2 pr-4">Roles</th>
                {ROLES.map((r) => (
                  <th key={r} className="py-2 px-2 text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 font-medium">{u.full_name || "—"}</td>
                  <td className="py-2.5 pr-4">
                    <select
                      value={ORGS.includes(u.org ?? "") ? (u.org as string) : ""}
                      onChange={(e) => changeOrg(u.id, e.target.value)}
                      disabled={busy === `${u.id}:org`}
                      aria-label={`Organisation for ${u.full_name || u.id}`}
                      className="h-8 rounded-md border border-input bg-background px-2 text-sm disabled:opacity-50"
                    >
                      <option value="" disabled>
                        {u.org || "— select —"}
                      </option>
                      {ORGS.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.length === 0 ? (
                        <Pill tone="neutral">none</Pill>
                      ) : (
                        u.roles.map((r) => (
                          <Pill key={r} tone={r === "admin" ? "gold" : "info"}>{r}</Pill>
                        ))
                      )}
                    </div>
                  </td>
                  {ROLES.map((r) => {
                    const has = u.roles.includes(r);
                    const key = `${u.id}:${r}`;
                    return (
                      <td key={r} className="py-2.5 px-2 text-center">
                        <button
                          onClick={() => toggle(u.id, r, has)}
                          disabled={busy === key}
                          aria-label={`${has ? "Remove" : "Grant"} ${r} for ${u.full_name || u.id}`}
                          className={`h-6 w-6 inline-flex items-center justify-center rounded border transition ${
                            has
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-input hover:bg-secondary"
                          } ${busy === key ? "opacity-50" : ""}`}
                        >
                          {has && <Check className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Card className="mt-6">
        <h3 className="font-semibold flex items-center gap-2 mb-2">
          <Building2 className="h-4 w-4 text-primary" /> Organisations
        </h3>
        <p className="text-xs text-muted-foreground mb-4">
          Organisations here feed every dropdown in the platform — sign-up, member assignment, folder
          access and task creation. Tick “Milestones &amp; Tasks” to let an organisation collaborate on
          those modules.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setMsg(null);
            createOrg.mutate(
              { name: newOrg, partner_access: newOrgPartner },
              {
                onSuccess: () => {
                  setMsg(`Added ${newOrg.trim()}.`);
                  setNewOrg("");
                  setNewOrgPartner(false);
                },
                onError: (e2) => setMsg((e2 as Error).message),
              },
            );
          }}
          className="flex flex-wrap items-center gap-2 mb-4"
        >
          <input
            value={newOrg}
            onChange={(e) => setNewOrg(e.target.value)}
            placeholder="New organisation name"
            required
            aria-label="New organisation name"
            className="h-9 flex-1 min-w-[220px] rounded-md border border-input bg-background px-3 text-sm"
          />
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            <input
              type="checkbox"
              checked={newOrgPartner}
              onChange={(e) => setNewOrgPartner(e.target.checked)}
              className="h-4 w-4 accent-[hsl(var(--primary))]"
            />
            Milestones &amp; Tasks
          </label>
          <button
            type="submit"
            disabled={createOrg.isPending}
            className="h-9 inline-flex items-center gap-1.5 rounded-md gradient-emerald px-3 text-sm font-medium text-primary-foreground disabled:opacity-50"
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </form>

        <div className="divide-y">
          {(orgs ?? []).map((o) => (
            <div key={o.id} className="flex flex-wrap items-center gap-3 py-2.5">
              <input
                defaultValue={o.name}
                onBlur={(e) => {
                  const next = e.target.value.trim();
                  if (!next || next === o.name) return;
                  setMsg(null);
                  updateOrg.mutate(
                    { id: o.id, name: next },
                    {
                      onSuccess: () => setMsg(`Renamed to ${next}.`),
                      onError: (e2) => setMsg((e2 as Error).message),
                    },
                  );
                }}
                aria-label={`Name for ${o.name}`}
                className="h-8 flex-1 min-w-[200px] rounded-md border border-input bg-background px-2 text-sm font-medium"
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={o.partner_access}
                  disabled={o.is_protected}
                  onChange={(e) => {
                    setMsg(null);
                    updateOrg.mutate(
                      { id: o.id, partner_access: e.target.checked },
                      { onError: (e2) => setMsg((e2 as Error).message) },
                    );
                  }}
                  className="h-4 w-4 accent-[hsl(var(--primary))] disabled:opacity-60"
                />
                Milestones &amp; Tasks
              </label>
              {o.is_protected ? (
                <Pill tone="gold">protected</Pill>
              ) : (
                <button
                  onClick={() => {
                    setMsg(null);
                    deleteOrg.mutate(
                      { id: o.id, name: o.name },
                      {
                        onSuccess: () => setMsg(`Removed ${o.name}.`),
                        onError: (e2) => setMsg((e2 as Error).message),
                      },
                    );
                  }}
                  aria-label={`Delete ${o.name}`}
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md border border-input text-destructive hover:bg-secondary"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>



      <Card className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
          <h3 className="font-semibold flex items-center gap-2">
            <FolderOpen className="h-4 w-4 text-primary" /> Data Room folder access
          </h3>
          <select
            value={selectedAccessOrg}
            onChange={(e) => setAccessOrg(e.target.value)}
            aria-label="Organisation for folder access"
            className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          >
            {accessOrgs.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Agrofeed Global always sees every folder. For other organisations, tick the folders they may
          access — if none are ticked, that organisation sees all folders.
        </p>
        <div className="grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {FOLDERS.map((f) => {
            const granted = (access ?? []).some(
              (r) => r.org.toLowerCase() === selectedAccessOrg.toLowerCase() && r.folder === f,
            );
            return (
              <label
                key={f}
                className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm cursor-pointer hover:bg-secondary"
              >
                <input
                  type="checkbox"
                  checked={granted}
                  onChange={() =>
                    toggleFolder.mutate(
                      { org: selectedAccessOrg, folder: f, granted },
                      { onError: (e) => setMsg((e as Error).message) },
                    )
                  }
                  className="h-4 w-4 accent-[hsl(var(--primary))]"
                />
                <span className="truncate">{f}</span>
              </label>
            );
          })}
        </div>
      </Card>
    </>
  );
}

