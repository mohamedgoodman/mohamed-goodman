"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2Icon, Loader2Icon, XCircleIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Reveal } from "@/components/motion/reveal";
import { contactFormSchema, type ContactFormValues } from "@/lib/validations";

type SubmitState = "idle" | "submitting" | "success" | "error";

export function Contact() {
  const [state, setState] = React.useState<SubmitState>("idle");
  const [serverError, setServerError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", message: "", company: "" },
  });

  async function onSubmit(values: ContactFormValues) {
    setState("submitting");
    setServerError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await res.json()) as { ok?: boolean; error?: string };

      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Something went wrong.");
      }

      setState("success");
      reset();
    } catch (error) {
      setState("error");
      setServerError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  }

  return (
    <section id="contact" aria-labelledby="contact-heading" className="py-24">
      <div className="container-page max-w-2xl">
        <Reveal>
          <h2
            id="contact-heading"
            className="text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Get in touch
          </h2>
          <p className="text-muted-foreground mt-3 sm:text-lg">
            Have a project in mind or just want to say hi? My inbox is open.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mt-8 space-y-5"
          >
            {/* Honeypot field — hidden from real users, visible to bots */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                {...register("company")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <p
                  id="name-error"
                  role="alert"
                  className="text-destructive text-sm"
                >
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <p
                  id="email-error"
                  role="alert"
                  className="text-destructive text-sm"
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                rows={5}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                {...register("message")}
              />
              {errors.message && (
                <p
                  id="message-error"
                  role="alert"
                  className="text-destructive text-sm"
                >
                  {errors.message.message}
                </p>
              )}
            </div>

            <Button type="submit" size="lg" disabled={state === "submitting"}>
              {state === "submitting" && (
                <Loader2Icon
                  className="size-4 animate-spin"
                  aria-hidden="true"
                />
              )}
              {state === "submitting" ? "Sending…" : "Send message"}
            </Button>

            <div role="status" aria-live="polite">
              {state === "success" && (
                <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2Icon className="size-4" aria-hidden="true" />
                  Thanks! Your message has been sent — I&apos;ll get back to you
                  soon.
                </p>
              )}
              {state === "error" && (
                <p className="text-destructive flex items-center gap-2 text-sm">
                  <XCircleIcon className="size-4" aria-hidden="true" />
                  {serverError}
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}
