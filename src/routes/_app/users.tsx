import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, PageHeader, Pill, Button } from "@/components/ui/primitives";
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
import { useFolders } from "@/hooks/use-modules";
import {
  ShieldCheck,
  Check,
  FolderOpen,
  UserPlus,
  Mail,
  Key,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User as UserIcon,
  Copy,
  Building2,
  Plus,
} from "lucide-react";

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
  const { isAdmin, loading, user } = useAuth();
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
  const { data: FOLDERS = [] } = useFolders();
  const { data: access } = useFolderAccess();
  const toggleFolder = useToggleFolderAccess();

  const accessOrgs = ORGS.filter((o) => o.toLowerCase() !== "agrofeed global");
  const selectedAccessOrg = accessOrg || accessOrgs[0] || "";


  // New member onboarding state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteOrg, setInviteOrg] = useState<string>(ORGS[0]);
  const [inviteRole, setInviteRole] = useState<Role>("member");
  const [inviteMode, setInviteMode] = useState<"invite" | "create">("create");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteFeedback, setInviteFeedback] = useState<{
    type: "success" | "error";
    text: string;
    note?: string;
    password?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

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

  const onInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteBusy(true);
    setInviteFeedback(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("No active admin session found.");
      }

      const res = await fetch("/api/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          fullName: inviteName,
          org: inviteOrg,
          role: inviteRole,
          mode: inviteMode,
        }),
      });

      const json = await res.json().catch(() => ({ error: "Server error" }));
      if (!res.ok) {
        throw new Error(json.error || "Failed to process request");
      }

      setInviteFeedback({
        type: "success",
        text:
          inviteMode === "invite"
            ? `Invitation sent to ${inviteEmail} (${inviteRole} in ${inviteOrg}).`
            : `Account created for ${inviteEmail}.`,
        note: json.note,
        password: json.generatedPassword,
      });

      setInviteEmail("");
      setInviteName("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setInviteFeedback({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setInviteBusy(false);
    }
  };

  const removeUser = async (userId: string, userName: string) => {
    if (!window.confirm(`Are you sure you want to remove ${userName || "this user"} from the Data Room?`)) {
      return;
    }
    setBusy(`${userId}:delete`);
    setMsg(null);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      const res = await fetch("/api/admin-users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json().catch(() => ({ error: "Server error" }));
      if (!res.ok) {
        throw new Error(json.error || "Failed to remove user");
      }
      setMsg(`Removed user ${userName || userId} from the Data Room.`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to remove user");
    } finally {
      setBusy(null);
    }
  };

  if (loading || !isAdmin) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <>
      <PageHeader
        title="User roles & onboarding"
        subtitle="Invite new members, assign organisations, and grant or revoke platform roles. Admins and advisors have full write access."
      />

      {msg && <div className="mb-4 text-xs text-muted-foreground">{msg}</div>}

      {/* Invite / Create New User Card */}
      <Card className="mb-8 border-l-4 border-l-primary shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-semibold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Invite / Create Member
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Onboard new stakeholders to the Sukuk Data Room. You can send an email invitation or create an account directly.
            </p>
          </div>
          <div className="inline-flex rounded-lg bg-secondary p-1 text-xs">
            <button
              type="button"
              onClick={() => setInviteMode("create")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${inviteMode === "create"
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Key className="h-3.5 w-3.5" /> Create Direct Account
            </button>
            <button
              type="button"
              onClick={() => setInviteMode("invite")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition ${inviteMode === "invite"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Mail className="h-3.5 w-3.5" /> Send Invite Email
            </button>

          </div>
        </div>

        <form onSubmit={onInviteSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="block text-sm">
              <span className="text-xs font-medium text-foreground/80">Full Name</span>
              <div className="relative mt-1">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  required
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Fatuma Mwakasege"
                  className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-xs font-medium text-foreground/80">Work Email</span>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="fatuma@tesserant.com"
                  className="w-full h-10 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-xs font-medium text-foreground/80">Organisation</span>
              <select
                value={inviteOrg}
                onChange={(e) => setInviteOrg(e.target.value)}
                className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ORGS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </label>

            <label className="block text-sm">
              <span className="text-xs font-medium text-foreground/80">Platform Role</span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as Role)}
                className="mt-1 w-full h-10 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
          </div>

          {inviteMode === "create" && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 text-xs text-foreground/80 flex items-start gap-2.5">
              <Key className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
              <div>
                <span className="font-semibold block text-foreground">
                  System-Generated Temporary Password
                </span>
                <span>
                  The system will automatically generate a secure temporary password. Once created,
                  the password will be displayed below so you can share it with the user. They will
                  be required to reset it upon their first login.
                </span>
              </div>
            </div>
          )}

          {inviteFeedback && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm space-y-2.5 ${inviteFeedback.type === "success"
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-destructive/30 bg-destructive/10 text-destructive"
                }`}
            >
              <div className="flex items-start gap-2.5">
                {inviteFeedback.type === "success" ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 shrink-0 text-destructive mt-0.5" />
                )}
                <div className="space-y-0.5">
                  <div className="font-medium">{inviteFeedback.text}</div>
                  {inviteFeedback.note && (
                    <div className="text-xs opacity-90">{inviteFeedback.note}</div>
                  )}
                </div>
              </div>

              {inviteFeedback.password && (
                <div className="mt-2 flex items-center justify-between rounded-md border border-emerald-500/20 bg-background/80 px-3 py-2 font-mono text-xs text-foreground">
                  <div>
                    <span className="text-muted-foreground mr-2">Generated Password:</span>
                    <strong className="select-all font-semibold tracking-wide">
                      {inviteFeedback.password}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(inviteFeedback.password || "");
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 rounded bg-secondary px-2 py-1 text-[11px] font-sans font-medium text-foreground hover:bg-secondary/80 transition"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" /> Copy
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-end pt-2 border-t border-border">
            <Button type="submit" disabled={inviteBusy} className="h-10 px-5">
              {inviteBusy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {inviteMode === "invite" ? "Sending invite…" : "Creating account…"}
                </>
              ) : inviteMode === "invite" ? (
                <>
                  <Mail className="h-4 w-4" /> Send Invitation
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Create Account
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

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
                <th className="py-2 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(data ?? []).map((u) => (
                <tr key={u.id} className="border-b last:border-0">
                  <td className="py-2.5 pr-4 font-medium">
                    <div className="flex items-center gap-1.5">
                      <span>{u.full_name || "—"}</span>
                      {u.id === user?.id && (
                        <Pill tone="gold">You</Pill>
                      )}
                    </div>
                  </td>
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
                          className={`h-6 w-6 inline-flex items-center justify-center rounded border transition ${has
                              ? "bg-primary text-primary-foreground border-primary"
                              : "border-input hover:bg-secondary"
                            } ${busy === key ? "opacity-50" : ""}`}
                        >
                          {has && <Check className="h-3.5 w-3.5" />}
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-2.5 px-2 text-right">
                    <button
                      onClick={() => removeUser(u.id, u.full_name || u.id)}
                      disabled={u.id === user?.id || busy === `${u.id}:delete`}
                      aria-label={`Remove user ${u.full_name || u.id}`}
                      title={
                        u.id === user?.id
                          ? "You cannot remove your own admin account"
                          : "Remove user from Data Room"
                      }
                      className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition disabled:opacity-30 disabled:pointer-events-none"
                    >
                      {busy === `${u.id}:delete` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <div className="mt-6">
        <RoleDefinitionsPanel />
      </div>

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

