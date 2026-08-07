import { z } from "zod";

export const contactFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters.")
    .max(100, "Name is too long."),
  email: z.email("Enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Message must be at least 10 characters.")
    .max(2000, "Message is too long."),
  // Honeypot field — real users never fill this in (it's visually hidden).
  // Left unrestricted so a filled value still passes validation; the route
  // handler checks it and silently no-ops instead of surfacing an error,
  // which would tip off unsophisticated bots that they were detected.
  company: z.string().optional().or(z.literal("")),
});

export type ContactFormValues = z.infer<typeof contactFormSchema>;
