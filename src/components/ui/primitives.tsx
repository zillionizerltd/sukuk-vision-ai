import React, { type ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, children, ...rest }: React.ComponentPropsWithoutRef<"div"> & { className?: string; children: ReactNode }) {
  return <div className={cn("card-elevated p-5", className)} {...rest}>{children}</div>;
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Pill({ tone = "neutral", children }: { tone?: "neutral" | "success" | "warning" | "danger" | "info" | "gold"; children: ReactNode }) {
  const tones: Record<string, string> = {
    neutral: "bg-secondary text-secondary-foreground",
    success: "bg-[color-mix(in_oklab,var(--success)_18%,transparent)] text-[color-mix(in_oklab,var(--success)_60%,black)] dark:text-[color-mix(in_oklab,var(--success)_85%,white)]",
    warning: "bg-[color-mix(in_oklab,var(--warning)_22%,transparent)] text-[color-mix(in_oklab,var(--warning)_55%,black)] dark:text-[color-mix(in_oklab,var(--warning)_85%,white)]",
    danger:  "bg-[color-mix(in_oklab,var(--destructive)_18%,transparent)] text-[color-mix(in_oklab,var(--destructive)_55%,black)] dark:text-[color-mix(in_oklab,var(--destructive)_85%,white)]",
    info:    "bg-[color-mix(in_oklab,var(--info)_18%,transparent)] text-[color-mix(in_oklab,var(--info)_55%,black)] dark:text-[color-mix(in_oklab,var(--info)_85%,white)]",
    gold:    "bg-[color-mix(in_oklab,var(--gold)_25%,transparent)] text-[color-mix(in_oklab,var(--gold)_45%,black)]",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium", tones[tone])}>{children}</span>;
}

export function Button({ variant = "primary", size = "md", className, children, ...rest }: {
  variant?: "primary" | "secondary" | "ghost" | "gold";
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const base = "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring";
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm" };
  const variants = {
    primary: "gradient-emerald text-primary-foreground shadow-sm hover:opacity-95",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/70 border border-input",
    ghost: "hover:bg-secondary",
    gold: "bg-gold text-gold-foreground hover:opacity-90 shadow-sm",
  };
  return <button className={cn(base, sizes[size], variants[variant], className)} {...rest}>{children}</button>;
}

export function ProgressBar({ value, tone = "emerald" }: { value: number; tone?: "emerald" | "gold" | "danger" }) {
  const bg = tone === "gold" ? "bg-gold" : tone === "danger" ? "bg-destructive" : "gradient-emerald";
  return (
    <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", bg)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}
