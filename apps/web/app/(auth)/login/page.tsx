"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IbbulAuthError,
  IbbulAuthLink,
  IbbulAuthShell
} from "@/components/auth/ibbul-auth-shell";
import { requestApi } from "@/lib/api/client";

const DEMO_PASSWORD = "ChangeMe123!";

const DEMO_ACCOUNTS = [
  { title: "System Administrator", email: "super@nexus.dev" },
  { title: "University Administrator", email: "admin@nexus.dev" },
  { title: "Dr. Musa (Approver)", email: "approver@nexus.dev" },
  { title: "Lecturer", email: "user@nexus.dev" },
  { title: "Student", email: "viewer@nexus.dev" }
] as const;

export default function LoginPage(): JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pre = params.get("email");
    if (pre) setEmail(decodeURIComponent(pre));
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    setLoading(true);

    try {
      await requestApi(`/api/v1/auth/login-check`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password })
      });

      const result = await signIn("credentials", {
        email: email.trim(),
        password,
        callbackUrl: "/dashboard",
        redirect: false
      });

      if (result?.error) {
        setFormError("Sign-in could not be completed. Please try again.");
        return;
      }

      if (result?.ok) {
        const next = result.url?.startsWith("http") ? new URL(result.url).pathname : (result.url ?? "/dashboard");
        router.push(next as Route);
        router.refresh();
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign-in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IbbulAuthShell title="University Event Platform" subtitle="Sign in with your institutional account">
      {formError ? <IbbulAuthError message={formError} /> : null}

      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[hsl(var(--color-text))]">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="name@ibbul.edu.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[hsl(var(--color-text))]">
            Password
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-5 flex flex-col items-center gap-2 border-t border-[hsl(var(--color-border))] pt-5 text-center">
        <IbbulAuthLink href="/forgot-password">Forgot your password?</IbbulAuthLink>
        <button
          type="button"
          onClick={() => setShowDemo((v) => !v)}
          className="text-xs text-[hsl(var(--color-text-muted))] hover:text-[hsl(var(--color-text))]"
        >
          {showDemo ? "Hide demo accounts" : "Show FYP demo accounts"}
        </button>
      </div>

      {showDemo ? (
        <div className="mt-4 space-y-2 rounded-[var(--radius-sm)] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-panel-muted))] p-3">
          <p className="text-[11px] text-[hsl(var(--color-text-muted))]">Demo password: {DEMO_PASSWORD}</p>
          {DEMO_ACCOUNTS.map((row) => (
            <button
              key={row.email}
              type="button"
              onClick={() => {
                setEmail(row.email);
                setPassword(DEMO_PASSWORD);
              }}
              className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-xs hover:bg-[hsl(var(--color-panel))]"
            >
              <span className="text-[hsl(var(--color-text))]">{row.title}</span>
              <span className="text-[hsl(var(--color-text-muted))]">{row.email}</span>
            </button>
          ))}
        </div>
      ) : null}
    </IbbulAuthShell>
  );
}
