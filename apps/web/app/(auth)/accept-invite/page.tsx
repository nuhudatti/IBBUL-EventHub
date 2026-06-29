"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IbbulAuthError,
  IbbulAuthLink,
  IbbulAuthShell,
  IbbulAuthSuccess
} from "@/components/auth/ibbul-auth-shell";
import { requestApiWithMessage } from "@/lib/api/client";

function AcceptInviteForm(): JSX.Element {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!email || !token) {
      setError("Invalid invitation link.");
      return;
    }
    setLoading(true);
    try {
      await requestApiWithMessage(`/api/v1/auth/accept-invite`, {
        method: "POST",
        body: JSON.stringify({ email, token, password })
      });
      setSuccess("Account activated. Redirecting to sign in…");
      setTimeout(() => router.push(`/login?email=${encodeURIComponent(email)}` as Route), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not activate account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IbbulAuthShell title="Activate Your Account" subtitle={email ? `Welcome, ${email}` : undefined}>
      {error ? <IbbulAuthError message={error} /> : null}
      {success ? <IbbulAuthSuccess message={success} /> : null}

      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Create password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Activating…" : "Activate & continue"}
        </Button>
      </form>

      <p className="mt-5 text-center">
        <IbbulAuthLink href="/login">Already activated? Sign in</IbbulAuthLink>
      </p>
    </IbbulAuthShell>
  );
}

export default function AcceptInvitePage(): JSX.Element {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">Loading invitation…</div>}>
      <AcceptInviteForm />
    </Suspense>
  );
}
