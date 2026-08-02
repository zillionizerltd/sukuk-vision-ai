import { useState } from "react";
import { KeyRound, ShieldAlert, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/primitives";
import { supabase } from "@/integrations/supabase/client";
import { Profile, useAuth } from "@/hooks/use-auth";

export function ForcePasswordResetModal() {
  const { profile, user, setProfile } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If the user does not need to reset password, do not render modal
  if (!profile?.must_reset_password) {
    return null;
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) {
        throw authError;
      }

      if (user?.id) {
        await supabase
          .from("profiles")
          .update({ must_reset_password: false })
          .eq("id", user.id);
      }

      setSuccess(true);
      setTimeout(() => {
        if (setProfile) {
          setProfile((prev) => (prev ? { ...prev, must_reset_password: false } : null));
        }
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl md:p-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold">
            <KeyRound className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Password Change Required</h2>
            <p className="text-xs text-muted-foreground">Secure your account to proceed</p>
          </div>
        </div>

        <div className="mb-6 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2.5">
          <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
          <span>
            You are signed in with a temporary system-generated password. Please set a new permanent
            password before accessing the Data Room.
          </span>
        </div>

        {success ? (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
            <h3 className="font-semibold text-emerald-700 dark:text-emerald-300">
              Password Updated Successfully
            </h3>
            <p className="text-xs text-muted-foreground">
              Redirecting you into the Data Room…
            </p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <label className="block text-sm">
              <span className="text-xs font-medium text-foreground/80">New Password</span>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full h-10 rounded-lg border border-input bg-background pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            <label className="block text-sm">
              <span className="text-xs font-medium text-foreground/80">Confirm New Password</span>
              <div className="relative mt-1">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full h-10 rounded-lg border border-input bg-background pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </label>

            {error && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={busy} className="w-full h-10">
                {busy ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating password…
                  </>
                ) : (
                  "Set Permanent Password"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
