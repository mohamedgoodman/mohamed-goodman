import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "./config.js";

export type MediaType = "photo" | "video" | "animation" | "document" | "audio";

export type Button = { text: string; url: string };

export type Post = {
  id: number;
  author_id: number;
  status: "draft" | "scheduled" | "published" | "failed";
  body_html: string;
  media_type: MediaType | null;
  media_file_id: string | null;
  buttons: Button[];
  scheduled_at: string | null;
  published_at: string | null;
  message_id: number | null;
  error: string | null;
  attempts: number;
};

export type Broadcast = {
  id: number;
  author_id: number;
  body_html: string;
  buttons: Button[];
  status: "running" | "done" | "cancelled";
  cursor_id: number;
  sent_count: number;
  failed_count: number;
};

/** Steps of the post composer. `idle` is represented by the absence of a row. */
export type Step =
  | "post:content"
  | "post:buttons"
  | "post:review"
  | "post:schedule"
  | "broadcast:content"
  | "broadcast:confirm";

export type AdminState = {
  user_id: number;
  step: Step;
  data: {
    body_html?: string;
    media_type?: MediaType;
    media_file_id?: string;
    buttons?: Button[];
    post_id?: number;
  };
};

let client: SupabaseClient | undefined;

export function db(): SupabaseClient {
  if (!client) {
    const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = config();
    client = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

/** Throws with the Supabase message attached, so failures are never silent. */
function unwrap<T>(result: { data: T; error: { message: string } | null }): T {
  if (result.error) throw new Error(`Supabase: ${result.error.message}`);
  return result.data;
}

// --- Subscribers -----------------------------------------------------------

export async function upsertSubscriber(input: {
  user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  language?: string;
  source?: string;
}): Promise<void> {
  unwrap(
    await db()
      .from("subscribers")
      .upsert(
        { ...input, is_active: true, last_seen_at: new Date().toISOString() },
        { onConflict: "user_id" },
      ),
  );
}

export async function deactivateSubscriber(userId: number): Promise<void> {
  unwrap(
    await db()
      .from("subscribers")
      .update({ is_active: false })
      .eq("user_id", userId),
  );
}

export async function countSubscribers(): Promise<number> {
  const { count, error } = await db()
    .from("subscribers")
    .select("user_id", { count: "exact", head: true })
    .eq("is_active", true);
  if (error) throw new Error(`Supabase: ${error.message}`);
  return count ?? 0;
}

/** One page of active subscribers, ordered by id so a cursor can resume. */
export async function subscriberPage(
  afterId: number,
  limit: number,
): Promise<number[]> {
  const rows = unwrap(
    await db()
      .from("subscribers")
      .select("user_id")
      .eq("is_active", true)
      .gt("user_id", afterId)
      .order("user_id", { ascending: true })
      .limit(limit),
  ) as { user_id: number }[] | null;
  return (rows ?? []).map((r) => r.user_id);
}

// --- Composer state --------------------------------------------------------

export async function getState(userId: number): Promise<AdminState | null> {
  const rows = unwrap(
    await db()
      .from("admin_state")
      .select("user_id, step, data")
      .eq("user_id", userId)
      .limit(1),
  ) as AdminState[] | null;
  return rows?.[0] ?? null;
}

export async function setState(
  userId: number,
  step: Step,
  data: AdminState["data"],
): Promise<void> {
  unwrap(
    await db().from("admin_state").upsert(
      {
        user_id: userId,
        step,
        data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    ),
  );
}

export async function clearState(userId: number): Promise<void> {
  unwrap(await db().from("admin_state").delete().eq("user_id", userId));
}

// --- Posts -----------------------------------------------------------------

export async function createPost(input: {
  author_id: number;
  status: Post["status"];
  body_html: string;
  media_type?: MediaType;
  media_file_id?: string;
  buttons: Button[];
  scheduled_at?: string;
}): Promise<Post> {
  const rows = unwrap(
    await db().from("posts").insert(input).select().limit(1),
  ) as Post[] | null;
  const post = rows?.[0];
  if (!post) throw new Error("Supabase: insert returned no row");
  return post;
}

export async function updatePost(
  id: number,
  patch: Partial<Post>,
): Promise<void> {
  unwrap(
    await db()
      .from("posts")
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq("id", id),
  );
}

export async function duePosts(limit: number): Promise<Post[]> {
  return (unwrap(
    await db()
      .from("posts")
      .select("*")
      .eq("status", "scheduled")
      .lte("scheduled_at", new Date().toISOString())
      .order("scheduled_at", { ascending: true })
      .limit(limit),
  ) ?? []) as Post[];
}

export async function upcomingPosts(limit: number): Promise<Post[]> {
  return (unwrap(
    await db()
      .from("posts")
      .select("*")
      .eq("status", "scheduled")
      .order("scheduled_at", { ascending: true })
      .limit(limit),
  ) ?? []) as Post[];
}

export async function getPost(id: number): Promise<Post | null> {
  const rows = unwrap(
    await db().from("posts").select("*").eq("id", id).limit(1),
  ) as Post[] | null;
  return rows?.[0] ?? null;
}

export async function countPublished(): Promise<number> {
  const { count, error } = await db()
    .from("posts")
    .select("id", { count: "exact", head: true })
    .eq("status", "published");
  if (error) throw new Error(`Supabase: ${error.message}`);
  return count ?? 0;
}

// --- Broadcasts ------------------------------------------------------------

export async function createBroadcast(input: {
  author_id: number;
  body_html: string;
  buttons: Button[];
}): Promise<Broadcast> {
  const rows = unwrap(
    await db().from("broadcasts").insert(input).select().limit(1),
  ) as Broadcast[] | null;
  const row = rows?.[0];
  if (!row) throw new Error("Supabase: insert returned no row");
  return row;
}

export async function runningBroadcast(): Promise<Broadcast | null> {
  const rows = unwrap(
    await db()
      .from("broadcasts")
      .select("*")
      .eq("status", "running")
      .order("id", { ascending: true })
      .limit(1),
  ) as Broadcast[] | null;
  return rows?.[0] ?? null;
}

export async function updateBroadcast(
  id: number,
  patch: Partial<Broadcast> & { finished_at?: string },
): Promise<void> {
  unwrap(await db().from("broadcasts").update(patch).eq("id", id));
}

// --- Inquiries -------------------------------------------------------------

export async function saveInquiry(input: {
  user_id: number;
  username?: string;
  body: string;
  admin_chat_id?: number;
  admin_msg_id?: number;
}): Promise<void> {
  unwrap(await db().from("inquiries").insert(input));
}

/** Finds who an admin is answering, given the forwarded copy they replied to. */
export async function inquiryByAdminMessage(
  adminChatId: number,
  adminMsgId: number,
): Promise<{ id: number; user_id: number } | null> {
  const rows = unwrap(
    await db()
      .from("inquiries")
      .select("id, user_id")
      .eq("admin_chat_id", adminChatId)
      .eq("admin_msg_id", adminMsgId)
      .limit(1),
  ) as { id: number; user_id: number }[] | null;
  return rows?.[0] ?? null;
}

export async function markInquiryAnswered(id: number): Promise<void> {
  unwrap(await db().from("inquiries").update({ answered: true }).eq("id", id));
}

// --- Moderation ------------------------------------------------------------

export async function addWarning(
  chatId: number,
  userId: number,
  reason: string,
): Promise<number> {
  unwrap(
    await db()
      .from("warnings")
      .insert({ chat_id: chatId, user_id: userId, reason }),
  );
  const { count, error } = await db()
    .from("warnings")
    .select("id", { count: "exact", head: true })
    .eq("chat_id", chatId)
    .eq("user_id", userId)
    .gte(
      "created_at",
      new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
    );
  if (error) throw new Error(`Supabase: ${error.message}`);
  return count ?? 1;
}
