"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { recordLogin, recordLogout, recordActivity } from "@/services/audit";
import { isBackendUnreachable, parseClientIp } from "@/lib/utils";
import type { ActionResult } from "@/types";

const UNREACHABLE_MESSAGE =
  "Can't reach the authentication service right now. This is not a problem " +
  "with your password — please try again shortly, or contact your administrator.";

/**
 * Email/password login. On success: records a login_logs row + activity_log,
 * then redirects admins to /admin and users to /dashboard.
 */
export async function login(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }

  const supabase = createClient();

  let signIn;
  try {
    signIn = await supabase.auth.signInWithPassword({ email, password });
  } catch (err) {
    // A paused/unresolvable Supabase project throws rather than returning an
    // error; reporting that as bad credentials sends people chasing passwords.
    if (isBackendUnreachable(err)) return { ok: false, message: UNREACHABLE_MESSAGE };
    throw err;
  }

  const { data, error } = signIn;

  if (error) {
    if (isBackendUnreachable(error)) return { ok: false, message: UNREACHABLE_MESSAGE };
    return { ok: false, message: "Invalid email or password." };
  }
  if (!data.user) {
    return { ok: false, message: "Invalid email or password." };
  }

  // Enforce the "disabled" flag at login time as well as in middleware.
  let profileQuery;
  try {
    profileQuery = await supabase
      .from("profiles")
      .select("role, disabled")
      .eq("id", data.user.id)
      .single();
  } catch (err) {
    if (isBackendUnreachable(err)) return { ok: false, message: UNREACHABLE_MESSAGE };
    throw err;
  }

  const { data: profile, error: profileError } = profileQuery;

  if (profileError && isBackendUnreachable(profileError)) {
    return { ok: false, message: UNREACHABLE_MESSAGE };
  }

  if (!profile || profile.disabled) {
    await supabase.auth.signOut();
    return { ok: false, message: "This account has been disabled." };
  }

  // Audit: capture IP / user-agent / session for login tracking.
  const hdrs = headers();
  const sessionId = data.session?.access_token
    ? data.session.access_token.slice(-24)
    : null;

  await recordLogin({
    userId: data.user.id,
    email,
    ip: parseClientIp(hdrs),
    userAgent: hdrs.get("user-agent"),
    sessionId,
  });
  await recordActivity({
    actorId: data.user.id,
    actorEmail: email,
    action: "login",
    target: email,
  });

  redirect(profile.role === "admin" ? "/admin" : "/dashboard");
}

/** Sign out: stamp logout_time, record activity, clear session. */
export async function logout(): Promise<void> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: sessionData } = await supabase.auth.getSession();

  if (user) {
    const sessionId = sessionData.session?.access_token
      ? sessionData.session.access_token.slice(-24)
      : null;
    await recordLogout({ userId: user.id, sessionId });
    await recordActivity({
      actorId: user.id,
      actorEmail: user.email ?? null,
      action: "logout",
      target: user.email ?? null,
    });
  }

  await supabase.auth.signOut();
  redirect("/login");
}
