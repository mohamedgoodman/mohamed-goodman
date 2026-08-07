import { NextResponse } from "next/server";
import { Resend } from "resend";

import { contactFormSchema } from "@/lib/validations";
import { siteConfig } from "@/data/site";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 },
    );
  }

  const parsed = contactFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Please check the form and try again." },
      { status: 422 },
    );
  }

  const { name, email, message, company } = parsed.data;

  // Honeypot: if this hidden field is filled, silently pretend success.
  if (company) {
    return NextResponse.json({ ok: true });
  }

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No Resend key configured — log and return success so the UI/UX can
    // still be exercised end-to-end in development or preview environments.
    // TODO: set RESEND_API_KEY in your environment to send real emails.
    console.info("[contact] mock submission (no RESEND_API_KEY set):", {
      name,
      email,
      message,
    });
    return NextResponse.json({ ok: true, mocked: true });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: `${siteConfig.name} Portfolio <onboarding@resend.dev>`, // TODO: replace with your verified sending domain
      to: siteConfig.email,
      replyTo: email,
      subject: `New message from ${name} via portfolio site`,
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) {
      console.error("[contact] Resend error:", error);
      return NextResponse.json(
        { error: "Could not send your message. Please try again later." },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[contact] unexpected error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again later." },
      { status: 500 },
    );
  }
}
