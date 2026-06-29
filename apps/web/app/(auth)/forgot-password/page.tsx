"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  IbbulAuthError,
  IbbulAuthLink,
  IbbulAuthShell,
  IbbulAuthSuccess
} from "@/components/auth/ibbul-auth-shell";
import { requestApiWithMessage } from "@/lib/api/client";

export default function ForgotPasswordPage(): JSX.Element {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const { message } = await requestApiWithMessage<{ sent: boolean }>(`/api/v1/auth/forgot-password`, {
        method: "POST",
        body: JSON.stringify({ email: email.trim() })
      });
      setSuccess(message ?? "Check your inbox for reset instructions.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <IbbulAuthShell title="Reset Password" subtitle="We will email you a secure reset link">
      {error ? <IbbulAuthError message={error} /> : null}
      {success ? <IbbulAuthSuccess message={success} /> : null}

      <form className="mt-6 space-y-4" onSubmit={(e) => void onSubmit(e)}>
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="name@ibbul.edu.ng"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" size="lg" disabled={loading}>
          {loading ? "Sending…" : "Send reset link"}
        </Button>
      </form>

      <p className="mt-5 text-center">
        <IbbulAuthLink href="/login">Back to sign in</IbbulAuthLink>
      </p>
    </IbbulAuthShell>
  );
}
