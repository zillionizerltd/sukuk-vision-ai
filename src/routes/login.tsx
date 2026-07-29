import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Mail, ShieldCheck } from "lucide-react";
import { AgrofeedLogo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/primitives";

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
  const [mfa, setMfa] = useState(false);
  const [otp, setOtp] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfa) { setMfa(true); return; }
    if (otp.length >= 6) navigate({ to: "/dashboard" });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left brand panel */}
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
            AI-powered structuring, compliance intelligence, and due diligence — in one workspace.
          </p>
          <div className="flex items-center gap-2 text-xs text-navy-foreground/70">
            <ShieldCheck className="h-4 w-4 text-gold" />
            AES-256 · TLS 1.3 · MFA · Immutable audit trail
          </div>
        </div>
        <div className="relative text-[11px] text-navy-foreground/50">© Agrofeed Global · Confidential</div>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8"><AgrofeedLogo /></div>
          <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-1">Access the Agrofeed Global Sukuk Data Room.</p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            {!mfa ? (
              <>
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
                  <div className="flex justify-between items-baseline">
                    <span className="text-foreground/80 font-medium">Password</span>
                    <a className="text-xs text-primary hover:underline" href="#">Forgot?</a>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                           placeholder="••••••••••••"
                           className="w-full h-11 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </label>
                <Button className="w-full h-11" type="submit">Continue</Button>

                <div className="relative py-2">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                  <div className="relative flex justify-center text-[11px] uppercase tracking-widest">
                    <span className="bg-background px-2 text-muted-foreground">or continue with</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" className="h-10 rounded-lg border border-input text-xs font-medium hover:bg-secondary">Google</button>
                  <button type="button" className="h-10 rounded-lg border border-input text-xs font-medium hover:bg-secondary">Microsoft</button>
                  <button type="button" className="h-10 rounded-lg border border-input text-xs font-medium hover:bg-secondary">SSO</button>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-lg border border-input bg-secondary/40 p-4 text-sm">
                  <div className="font-medium">Two-factor authentication</div>
                  <p className="text-muted-foreground text-xs mt-1">Enter the 6-digit code from your authenticator app.</p>
                </div>
                <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                       inputMode="numeric" placeholder="000000"
                       className="w-full h-14 rounded-lg border border-input bg-background text-center text-2xl tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-ring" />
                <Button className="w-full h-11" type="submit">Verify & sign in</Button>
                <button type="button" onClick={() => setMfa(false)} className="w-full text-xs text-muted-foreground hover:text-foreground">Back</button>
              </>
            )}
          </form>

          <p className="mt-8 text-[11px] leading-relaxed text-muted-foreground">
            By signing in you agree to Agrofeed Global's data room terms. This platform provides analytical tools only —
            not legal, financial, regulatory, or Sharia advice. <Link to="/dashboard" className="text-primary hover:underline">Skip to demo</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
