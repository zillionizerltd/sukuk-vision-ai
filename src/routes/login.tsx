import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, Mail, ShieldCheck, User as UserIcon } from "lucide-react";
import { AgrofeedLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/primitives";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in · Agrofeed Global Sukuk Data Room" },
      { name: "description", content: "Secure sign-in to the Agrofeed Global Sukuk Data Room." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // If already signed in, go to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error instanceof Error ? result.error.message : "Google sign-in failed");
      return;
    }
    if (!result.redirected) navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <div className="relative hidden lg:flex flex-col justify-between p-12 bg-navy text-navy-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-30 pointer-events-none"
             style={{ backgroundImage: "radial-gradient(circle at 20% 20%, var(--brand-emerald), transparent 60%), radial-gradient(circle at 80% 80%, var(--brand-gold), transparent 55%)" }} />
        <div className="relative"><AgrofeedLogo /></div>
        <div className="relative space-y-6 max-w-md">
          <h1 className="text-4xl font-semibold leading-tight">
            Sukuk Data Room, <span className="text-gold">reimagined</span> for Islamic capital markets.
          </h1>
          <p className="text-sm text-navy-foreground/80 leading-relaxed">
            Secure collaboration between Agrofeed Global, Tesserant, and Al Huda CIBE.
          </p>
          <div className="flex items-center gap-2 text-xs text-navy-foreground/70">
            <ShieldCheck className="h-4 w-4 text-gold" />
            AES-256 · TLS 1.3 · Immutable audit trail
          </div>
        </div>
        <div className="relative text-[11px] text-navy-foreground/50">© Agrofeed Global · Confidential</div>
      </div>

      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><AgrofeedLogo /></div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {mode === "signin" ? "Sign in" : "Create your account"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "signin"
              ? "Access the Agrofeed Global Sukuk Data Room."
              : "Register to collaborate on the Sukuk programme."}
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {mode === "signup" && (
              <label className="block text-sm">
                <span className="text-foreground/80 font-medium">Full name</span>
                <div className="relative mt-1.5">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input required value={fullName} onChange={(e) => setFullName(e.target.value)}
                         placeholder="Fatuma Mwakasege"
                         className="w-full h-11 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </label>
            )}
            <label className="block text-sm">
              <span className="text-foreground/80 font-medium">Work email</span>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                       placeholder="name@agrofeedglobal.com"
                       className="w-full h-11 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </label>
            <label className="block text-sm">
              <span className="text-foreground/80 font-medium">Password</span>
              <div className="relative mt-1.5">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
                       placeholder="••••••••••••"
                       className="w-full h-11 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </label>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </div>
            )}

            <Button className="w-full h-11" type="submit" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
              <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
                <span className="bg-background px-2 text-muted-foreground">or continue with</span>
              </div>
            </div>
            <button type="button" onClick={google}
                    className="w-full h-11 rounded-lg border border-input text-sm font-medium hover:bg-secondary">
              Continue with Google
            </button>
          </form>

          <p className="mt-8 text-sm text-center text-muted-foreground">
            {mode === "signin" ? (
              <>New to the platform?{" "}
                <button onClick={() => setMode("signup")} className="text-primary font-medium hover:underline">Create an account</button>
              </>
            ) : (
              <>Already have an account?{" "}
                <button onClick={() => setMode("signin")} className="text-primary font-medium hover:underline">Sign in</button>
              </>
            )}
          </p>

          <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
            Analytical tools only — not legal, financial, regulatory, or Sharia advice.{" "}
            <Link to="/dashboard" className="text-primary hover:underline">Skip to demo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
