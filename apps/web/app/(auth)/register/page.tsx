"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function RegisterPage(): JSX.Element {
  const [status, setStatus] = useState<string>("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? "")
    };

    const response = await fetch("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    setStatus(response.ok ? "Account created. You can sign in now." : "Registration failed.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50 p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <Input name="name" placeholder="Full name" required />
          <Input name="email" type="email" placeholder="Email" required />
          <Input name="password" type="password" placeholder="Password" required />
          <Button type="submit" className="w-full">
            Register
          </Button>
        </form>
        {status ? <p className="mt-4 text-sm text-gray-700">{status}</p> : null}
        <Link href="/login" className="mt-4 block text-sm text-indigo-600 hover:text-indigo-700">
          Back to login
        </Link>
      </Card>
    </div>
  );
}
