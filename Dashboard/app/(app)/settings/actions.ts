"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireUser } from "@/lib/auth";
import { recordActivity } from "@/services/audit";
import type { ActionResult } from "@/types";

/** Update the signed-in user's own display name. */
export async function updateOwnProfile(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireUser();
  const name = String(formData.get("name") ?? "").trim();

  const supabase = createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ name: name || null })
    .eq("id", profile.id);

  if (error) return { ok: false, message: error.message };

  await recordActivity({
    actorId: profile.id,
    actorEmail: profile.email,
    action: "profile_updated",
    target: profile.email,
    metadata: { name },
  });

  revalidatePath("/settings");
  return { ok: true, message: "Profile updated." };
}

/** Change the signed-in user's own password. */
export async function updateOwnPassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const profile = await requireUser();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }
  if (password !== confirm) {
    return { ok: false, message: "Passwords do not match." };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { ok: false, message: error.message };

  await recordActivity({
    actorId: profile.id,
    actorEmail: profile.email,
    action: "password_reset",
    target: profile.email,
    metadata: { self: true },
  });

  return { ok: true, message: "Password changed." };
}
