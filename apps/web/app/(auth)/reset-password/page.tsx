"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IbbulAuthError,
  IbbulAuthShell,
  IbbulAuthSuccess
} from "@/components/auth/ibbul-auth-shell";
import { requestApiWithMessage } from "@/lib/api/client";

function ResetForm(): JSX.Element {
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
      setError("Invalid reset link.");
      return;
    }
    setLoading(true);
    try {
      await requestApiWithMessage(`/api/v1/auth/reset-password`, {
        method: "POST",
        body: JSON.stringify({ email, token, password })
      });
      setSuccess("Password updated successfully.");
      setTimeout(() => router.push(`/login?email=${encodeURIComponent(email)}` as Route), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IbbulAuthShell title="Choose New Password" subtitle={email ? `For ${email}` : undefined}>
      {error ? <IbbulAuthError message={error} /> : null}
      {success ? <IbbulAuthSuccess message={success} /> : null}

      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label className="mb-1.5 block text-sm font-medium">New password</label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={8} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">Confirm password</label>
          <Input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} minLength={8} required />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>

      <p className="mt-5 text-center text-sm">
        <Link href="/login" className="text-[hsl(var(--color-primary))] hover:underline">
          Back to sign in
        </Link>
      </p>
    </IbbulAuthShell>
  );
}

export default function ResetPasswordPage(): JSX.Element {
  return (
    <Suspense fallback={<div className="grid min-h-screen place-items-center">Loading…</div>}>
      <ResetForm />
    </Suspense>
  );
}
