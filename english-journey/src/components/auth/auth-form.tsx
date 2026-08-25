"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof typeof values) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((prev) => ({ ...prev, [key]: event.target.value }));

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          isRegister ? values : { email: values.email, password: values.password },
        ),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.push(isRegister ? "/onboarding" : "/dashboard");
      router.refresh();
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2 self-start font-semibold">
        <span className="grid size-9 place-items-center rounded-xl text-white shadow-[0_4px_16px_rgba(124,58,237,0.45),inset_0_1px_0_rgba(255,255,255,0.25)] [background:var(--grad-brand)]">
          EJ
        </span>
        English Journey
      </Link>

      <div className="card card-elevated glow-purple animate-in-up p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {isRegister
            ? "Two minutes of setup, then your first session is ready."
            : "Pick up where you left off — your streak is waiting."}
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {isRegister ? (
            <Field label="Your name">
              {({ id }) => (
                <Input
                  id={id}
                  value={values.name}
                  onChange={set("name")}
                  autoComplete="name"
                  placeholder="Amina"
                  required
                />
              )}
            </Field>
          ) : null}

          <Field label="Email">
            {({ id }) => (
              <Input
                id={id}
                type="email"
                value={values.email}
                onChange={set("email")}
                autoComplete="email"
                placeholder="you@example.com"
                required
              />
            )}
          </Field>

          <Field
            label="Password"
            hint={isRegister ? "At least 8 characters." : undefined}
          >
            {({ id }) => (
              <Input
                id={id}
                type="password"
                value={values.password}
                onChange={set("password")}
                autoComplete={isRegister ? "new-password" : "current-password"}
                placeholder="••••••••"
                required
              />
            )}
          </Field>

          {error ? (
            <p role="alert" className="rounded-xl border border-danger/30 bg-danger-soft px-3.5 py-2.5 text-sm text-on-danger">
              {error}
            </p>
          ) : null}

          <Button type="submit" size="lg" loading={loading} className="w-full">
            {isRegister ? "Create account" : "Sign in"}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          {isRegister ? "Already have an account? " : "New here? "}
          <Link
            href={isRegister ? "/login" : "/register"}
            className="font-medium text-on-brand hover:underline"
          >
            {isRegister ? "Sign in" : "Create one"}
          </Link>
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-dim">
        Email and password today. The auth layer is provider-shaped, so OAuth can be added without
        touching the rest of the app.
      </p>
    </div>
  );
}
