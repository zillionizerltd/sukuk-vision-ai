import { useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type Profile = { id: string; full_name: string | null; org: string | null };

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_evt, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) setProfile(null);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setSessionLoading(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (sessionLoading) return;
    if (!user) {
      setRoles([]);
      setProfile(null);
      setDataLoading(false);
      return;
    }

    let cancelled = false;
    setDataLoading(true);
    Promise.all([
      supabase.from("profiles").select("id, full_name, org").eq("id", user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", user.id),
    ]).then(([p, r]) => {
      if (cancelled) return;
      setProfile(p.data ?? null);
      setRoles((r.data ?? []).map((x) => x.role as string));
      setDataLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const loading = sessionLoading || dataLoading;

  return { session, user, profile, roles, isAdmin: roles.includes("admin"), loading };

}

export async function signOut() {
  await supabase.auth.signOut();
}
