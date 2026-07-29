import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, PageHeader, Pill } from "@/components/ui/primitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ShieldCheck, Check } from "lucide-react";

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

  if (loading || !isAdmin) return <div className="text-sm text-muted-foreground">Loading…</div>;

  return (
    <>
      <PageHeader
        title="User roles"
        subtitle="Grant or revoke platform roles. Admins and advisors have full write access."
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
                  <td className="py-2.5 pr-4 text-muted-foreground">{u.org || "—"}</td>
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
    </>
  );
}
