import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, Banknote, Eye, EyeOff, Lock, Mail, ShieldCheck, Users } from "lucide-react";
import { SukukDataRoomLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/primitives";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import dubaiSkyline from "@/assets/dubai-skyline.jpg";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    setSuccess(null);
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      navigate({ to: "/dashboard" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setSuccess(null);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error instanceof Error ? result.error.message : "Google sign-in failed");
      return;
    }
    if (!result.redirected) navigate({ to: "/dashboard" });
  };

  const forgotPassword = async () => {
    setError(null);
    setSuccess(null);
    if (!email) {
      setError("Please enter your work email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess("Password reset instructions sent to your email.");
    }
  };

  const features = [
    {
      icon: ShieldCheck,
      title: "Bank-grade security",
      description: "AES-256 encryption and immutable audit trails",
    },
    {
      icon: Users,
      title: "Trusted collaboration",
      description: "Work securely with investors and stakeholders",
    },
    {
      icon: Banknote,
      title: "Built for Islamic finance",
      description: "Shariah-compliant. Purpose-built for Sukuk transactions",
    },
  ];

  return (
    <div className="min-h-screen relative bg-navy overflow-hidden">
      {/* Full-bleed background */}
      <img
        src={dubaiSkyline}
        alt="Dubai skyline at daytime overlooking the financial district"
        width={1920}
        height={1080}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-navy/80" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, color-mix(in oklab, var(--brand-gold) 12%, transparent), transparent 35%), linear-gradient(135deg, color-mix(in oklab, var(--brand-emerald) 18%, transparent) 0%, transparent 50%)",
        }}
      />

      <div className="relative z-10 min-h-screen grid lg:grid-cols-2">
        {/* Left: value proposition */}
        <div className="hidden lg:flex flex-col justify-between px-16 py-12 text-white">
          <div>
            <SukukDataRoomLogo inverted />
          </div>

          <div className="max-w-xl">
            <h1 className="text-6xl font-semibold leading-[1.05] tracking-tight">
              Trusted access.
              <br />
              <span className="text-gold">Secure opportunities.</span>
            </h1>
            <div className="mt-7 h-1.5 w-20 rounded-full bg-gold" />
            <p className="mt-7 text-xl text-white/85 leading-relaxed">
              The Sukuk Data Room for secure collaboration, document sharing, and investor due
              diligence.
            </p>

            <div className="mt-12 space-y-6">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/10">
                    <feature.icon className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-white">{feature.title}</div>
                    <div className="text-base text-white/70">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-xs text-white/50 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" />© SUKUK DATA ROOM. All rights reserved.
          </div>
        </div>

        {/* Right: sign-in card */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-[460px] rounded-2xl bg-white p-8 lg:p-10 shadow-elevated">
            <div className="lg:hidden mb-8">
              <SukukDataRoomLogo />
            </div>

            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight text-navy">Welcome back</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Sign in to access the Sukuk Data Room
                </p>
              </div>
              <div className="hidden lg:block text-right whitespace-nowrap">
                <div className="text-xs text-muted-foreground">New here?</div>
                <a
                  href="mailto:admin@agrofeedglobal.com?subject=Request%20invitation%20to%20Sukuk%20Data%20Room"
                  className="inline-flex items-center gap-1 text-sm font-medium text-gold hover:text-gold/80 transition-colors"
                >
                  Request invitation <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            <form onSubmit={submit} className="mt-8 space-y-5">
              <label className="block text-sm">
                <span className="font-medium text-foreground">Work email</span>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full h-12 rounded-xl border border-input bg-background pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </label>

              <label className="block text-sm">
                <span className="font-medium text-foreground">Password</span>
                <div className="relative mt-2">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full h-12 rounded-xl border border-input bg-background pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </label>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                  />
                  Remember me
                </label>
                <button
                  type="button"
                  onClick={forgotPassword}
                  className="text-sm font-medium text-gold hover:text-gold/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl px-3 py-2.5">
                  {error}
                </div>
              )}
              {success && (
                <div className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
                  {success}
                </div>
              )}

              <Button
                variant="gold"
                className="w-full h-12 text-base"
                type="submit"
                disabled={busy}
              >
                {busy ? "Please wait…" : "Sign in"}
              </Button>

              <div className="relative py-1">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-white px-3 text-muted-foreground">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={google}
                className="w-full h-12 rounded-xl border border-input text-sm font-medium hover:bg-secondary transition-colors inline-flex items-center justify-center gap-2"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-border bg-secondary/40 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                  <Lock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Invitation-only access</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Access is restricted to authorized stakeholders only. New accounts and roles are
                    managed by Data Room administrators.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center lg:hidden text-xs text-muted-foreground">
              New here?{" "}
              <a
                href="mailto:admin@agrofeedglobal.com?subject=Request%20invitation%20to%20Sukuk%20Data%20Room"
                className="inline-flex items-center gap-1 font-medium text-gold hover:text-gold/80 transition-colors"
              >
                Request invitation <ArrowRight className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
