"use client";

import Image from "next/image";
import Link from "next/link";
import type { PropsWithChildren } from "react";
import { Card } from "@/components/ui/card";

type IbbulAuthShellProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function IbbulAuthShell({ title, subtitle, children }: IbbulAuthShellProps): JSX.Element {
  return (
    <div className="relative min-h-screen bg-[hsl(var(--color-bg))]">
      <Image
        src="/branding/ibbul-gate.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center opacity-[0.12]"
        sizes="100vw"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-10">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image
            src="/branding/ibbul-logo.png"
            alt="IBBUL logo"
            width={72}
            height={72}
            className="mb-4 h-[72px] w-[72px] object-contain"
            priority
          />
          <p className="text-xs font-medium uppercase tracking-widest text-[hsl(var(--color-text-muted))]">
            Ibrahim Badamasi Babangida University
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[hsl(var(--color-text))]">{title}</h1>
          {subtitle ? <p className="mt-1.5 text-sm text-[hsl(var(--color-text-muted))]">{subtitle}</p> : null}
          <p className="mt-2 text-sm italic text-[hsl(var(--color-text-muted))]">Learning for Service</p>
        </div>

        <Card className="w-full max-w-md border border-[hsl(var(--color-border))] p-6 shadow-[var(--shadow-sm)] md:p-8">
          {children}
        </Card>

        <p className="mt-6 text-center text-xs text-[hsl(var(--color-text-muted))]">
          Event Scheduling &amp; Notification System · Lapai
        </p>
      </div>
    </div>
  );
}

export function IbbulAuthError({ message }: { message: string }): JSX.Element {
  return (
    <p
      className="rounded-[var(--radius-sm)] border border-[hsl(var(--color-danger)/0.35)] bg-[hsl(var(--color-danger)/0.08)] px-3 py-2.5 text-sm text-[hsl(var(--color-danger))]"
      role="alert"
    >
      {message}
    </p>
  );
}

export function IbbulAuthSuccess({ message }: { message: string }): JSX.Element {
  return (
    <p
      className="rounded-[var(--radius-sm)] border border-[hsl(var(--color-success)/0.35)] bg-[hsl(var(--color-success)/0.08)] px-3 py-2.5 text-sm text-[hsl(var(--color-success))]"
      role="status"
    >
      {message}
    </p>
  );
}

export function IbbulAuthLink({ href, children }: { href: string; children: React.ReactNode }): JSX.Element {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[hsl(var(--color-primary))] transition-colors hover:underline"
    >
      {children}
    </Link>
  );
}
