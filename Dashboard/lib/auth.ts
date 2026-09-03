// Server-side auth/session helpers shared across RSC pages and actions.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isBackendUnreachable } from "@/lib/utils";
import type { Profile } from "@/types";

/**
 * Return the current profile or null (no redirect). If Supabase itself is
 * unreachable we resolve to null (treated as signed out) rather than throwing:
 * an uncaught fetch failure here 500s every page, including /login, so nobody
 * can even reach the sign-in form to see what went wrong.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = createClient();

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return (profile as Profile | null) ?? null;
  } catch (err) {
    if (isBackendUnreachable(err)) return null;
    throw err;
  }
}

/** Require an authenticated, non-disabled user or redirect to /login. */
export async function requireUser(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  if (profile.disabled) redirect("/unauthorized");
  return profile;
}

/** Require an admin or redirect to /unauthorized. */
export async function requireAdmin(): Promise<Profile> {
  const profile = await requireUser();
  if (profile.role !== "admin") redirect("/unauthorized");
  return profile;
}
