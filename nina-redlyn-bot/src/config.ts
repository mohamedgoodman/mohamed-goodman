import { z } from "zod";

/**
 * Every value the bot needs, validated once at boot. A missing or malformed
 * variable fails loudly here rather than as a confusing runtime error deep
 * inside a handler.
 */
const schema = z.object({
  BOT_TOKEN: z
    .string()
    .min(20, "BOT_TOKEN looks wrong — get it from @BotFather"),

  /** Channel to publish to: `@nina_redlyn` or a numeric id like `-1001234567890`. */
  CHANNEL_ID: z.string().min(2),

  /** Optional discussion group linked to the channel — moderation runs there. */
  GROUP_ID: z.coerce.number().int().optional(),

  /** Telegram user ids allowed to compose, schedule and broadcast. */
  ADMIN_IDS: z
    .string()
    .min(1)
    .transform((raw) =>
      raw
        .split(/[,\s]+/)
        .filter(Boolean)
        .map((id) => Number(id)),
    )
    .refine(
      (ids) => ids.length > 0 && ids.every((id) => Number.isInteger(id)),
      "ADMIN_IDS must be a comma-separated list of numeric Telegram user ids",
    ),

  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),

  /** Shared secret Telegram echoes back on every webhook call. */
  WEBHOOK_SECRET: z.string().min(16),

  /** Guards the cron endpoints against public calls. */
  CRON_SECRET: z.string().min(16),

  /** Appended to every published post. Empty string disables it. */
  SIGNATURE: z.string().default(""),

  /** Default timezone for scheduling, e.g. "Africa/Casablanca". */
  TIMEZONE: z.string().default("Africa/Casablanca"),
});

export type Config = z.infer<typeof schema>;

let cached: Config | undefined;

export function config(): Config {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  • ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid environment configuration:\n${issues}`);
  }
  cached = parsed.data;
  return cached;
}

export function isAdmin(userId: number | undefined): boolean {
  return userId !== undefined && config().ADMIN_IDS.includes(userId);
}
