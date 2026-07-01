// Audit logging service. Writes to login_logs and activity_logs using the
// service-role client so inserts always succeed regardless of RLS, while
// reads elsewhere remain governed by RLS (admin-only SELECT policies).
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import type { ActivityAction } from "@/types";

interface LoginContext {
  userId: string;
  email: string;
  ip: string | null;
  userAgent: string | null;
  sessionId: string | null;
}

/** Insert a login_logs row and return its id (for later logout update). */
export async function recordLogin(ctx: LoginContext): Promise<string | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("login_logs")
    .insert({
      user_id: ctx.userId,
      email: ctx.email,
      ip_address: ctx.ip,
      user_agent: ctx.userAgent,
      session_id: ctx.sessionId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("recordLogin failed", error.message);
    return null;
  }
  return data?.id ?? null;
}

/** Stamp logout_time on the most recent open login for this session/user. */
export async function recordLogout(params: {
  userId: string;
  sessionId: string | null;
}): Promise<void> {
  const admin = createAdminClient();
  let query = admin
    .from("login_logs")
    .update({ logout_time: new Date().toISOString() })
    .is("logout_time", null)
    .eq("user_id", params.userId);

  if (params.sessionId) {
    query = query.eq("session_id", params.sessionId);
  }

  const { error } = await query;
  if (error) console.error("recordLogout failed", error.message);
}

interface ActivityContext {
  actorId: string | null;
  actorEmail: string | null;
  action: ActivityAction;
  target?: string | null;
  metadata?: Record<string, unknown> | null;
}

/** Insert an activity_logs row for an important action. */
export async function recordActivity(ctx: ActivityContext): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("activity_logs").insert({
    user_id: ctx.actorId,
    user_email: ctx.actorEmail,
    action: ctx.action,
    target: ctx.target ?? null,
    metadata: ctx.metadata ?? null,
  });
  if (error) console.error("recordActivity failed", error.message);
}
