import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, PageHeader, Button, Pill } from "@/components/ui/primitives";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, signOut } from "@/hooks/use-auth";
import { RoleDescription } from "@/components/admin/RoleDefinitionsPanel";
import { LogOut, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_app/profile")({
  head: () => ({
    meta: [
      { title: "Profile · Agrofeed Sukuk Data Room" },
      { name: "description", content: "View and update your Agrofeed Sukuk Data Room profile." },
    ],
  }),
  component: ProfilePage,
});

type Role = "admin" | "advisor" | "auditor" | "investor" | "member";

function ProfilePage() {
  const navigate = useNavigate();
  const { user, profile, loading } = useAuth();
  const [fullName, setFullName] = useState("");
  const [roles, setRoles] = useState<Role[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/login" });
  }, [loading, user, navigate]);

  useEffect(() => {
    setFullName(profile?.full_name ?? "");
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .then(({ data }) => setRoles((data ?? []).map((r) => r.role as Role)));
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setMessage(null);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
    setSaving(false);
    setMessage(error ? error.message : "Profile updated.");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/login" });
  };

  if (loading || !user) {
    return <div className="text-sm text-muted-foreground">Loading…</div>;
  }

  return (
    <>
      <PageHeader
        title="Your profile"
        subtitle="Personal information and access on the Agrofeed Sukuk Data Room."
        actions={
          <Button variant="secondary" size="sm" onClick={handleSignOut}>
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <UserIcon className="h-4 w-4 text-primary" /> Identity
          </h3>
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="text-foreground/80 font-medium">Full name</span>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1.5 w-full h-11 rounded-lg border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block text-sm">
              <span className="text-foreground/80 font-medium">Email</span>
              <input
                value={user.email ?? ""}
                disabled
                className="mt-1.5 w-full h-11 rounded-lg border border-input bg-secondary/50 px-3 text-sm text-muted-foreground"
              />
            </label>
            <div className="flex items-center gap-3 pt-2">
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </Button>
              {message && <span className="text-xs text-muted-foreground">{message}</span>}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold mb-4">Organisation</h3>
          <div className="text-sm font-medium">{profile?.org || "—"}</div>
          <p className="mt-2 text-xs text-muted-foreground">
            Your organisation determines your baseline access. Agrofeed Global has full write access; other organisations have read access and can upload documents.
          </p>

          <h3 className="font-semibold mt-6 mb-3">Roles</h3>
          <div className="flex flex-wrap gap-1.5">
            {roles.length === 0 ? (
              <Pill tone="neutral">member</Pill>
            ) : (
              roles.map((r) => (
                <Pill key={r} tone={r === "admin" ? "gold" : "info"}>{r}</Pill>
              ))
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
