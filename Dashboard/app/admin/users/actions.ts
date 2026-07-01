"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { recordActivity } from "@/services/audit";
import type { ActionResult, UserRole } from "@/types";

/**
 * Create a new user. Admin-only. Performs the full sync:
 *   1. Create the Supabase Auth account (email confirmed).
 *   2. Create the profiles row.
 *   3. Assign the role.
 * A DB trigger also inserts a default profile row; we upsert to be safe.
 */
export async function createUser(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = (String(formData.get("role") ?? "user") as UserRole) || "user";

  if (!email || !password) {
    return { ok: false, message: "Email and password are required." };
  }
  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  const client = createAdminClient();

  // 1. Create the auth account.
  const { data: created, error: createErr } = await client.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  });

  if (createErr || !created.user) {
    return { ok: false, message: createErr?.message ?? "Failed to create user." };
  }

  // 2 + 3. Upsert the profile with the assigned role.
  const { error: profileErr } = await client
    .from("profiles")
    .upsert({ id: created.user.id, email, name: name || null, role });

  if (profileErr) {
    // Roll back the orphaned auth user so we don't leave a partial account.
    await client.auth.admin.deleteUser(created.user.id);
    return { ok: false, message: profileErr.message };
  }

  await recordActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "user_created",
    target: email,
    metadata: { role },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, message: `User ${email} created.` };
}

/** Update a user's name and/or role. Admin-only. */
export async function updateUser(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const role = String(formData.get("role") ?? "user") as UserRole;

  if (!userId) return { ok: false, message: "Missing user id." };

  const client = createAdminClient();

  const { data: before } = await client
    .from("profiles")
    .select("role, email")
    .eq("id", userId)
    .single();

  const { error } = await client
    .from("profiles")
    .update({ name: name || null, role })
    .eq("id", userId);

  if (error) return { ok: false, message: error.message };

  await recordActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "profile_updated",
    target: before?.email ?? userId,
    metadata: { name, role },
  });

  // Separately record a role change if it actually changed.
  if (before && before.role !== role) {
    await recordActivity({
      actorId: admin.id,
      actorEmail: admin.email,
      action: "role_changed",
      target: before.email,
      metadata: { from: before.role, to: role },
    });
  }

  revalidatePath("/admin/users");
  return { ok: true, message: "User updated." };
}

/** Reset a user's password. Admin-only. */
export async function resetPassword(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const password = String(formData.get("password") ?? "");
  const email = String(formData.get("email") ?? "");

  if (!userId || password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  const client = createAdminClient();
  const { error } = await client.auth.admin.updateUserById(userId, { password });
  if (error) return { ok: false, message: error.message };

  await recordActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "password_reset",
    target: email || userId,
  });

  revalidatePath("/admin/users");
  return { ok: true, message: "Password reset." };
}

/** Enable or disable a user. Disabling blocks login without deleting data. */
export async function setUserDisabled(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const email = String(formData.get("email") ?? "");
  const disabled = String(formData.get("disabled") ?? "false") === "true";

  if (!userId) return { ok: false, message: "Missing user id." };
  if (userId === admin.id) {
    return { ok: false, message: "You cannot disable your own account." };
  }

  const client = createAdminClient();

  const { error } = await client
    .from("profiles")
    .update({ disabled })
    .eq("id", userId);
  if (error) return { ok: false, message: error.message };

  // Also ban at the auth layer so existing sessions can't be refreshed.
  await client.auth.admin.updateUserById(userId, {
    ban_duration: disabled ? "876000h" : "none",
  });

  await recordActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: disabled ? "user_disabled" : "user_enabled",
    target: email || userId,
  });

  revalidatePath("/admin/users");
  return { ok: true, message: disabled ? "User disabled." : "User enabled." };
}

/** Permanently delete a user (auth account + profile via cascade). */
export async function deleteUser(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const userId = String(formData.get("userId") ?? "");
  const email = String(formData.get("email") ?? "");

  if (!userId) return { ok: false, message: "Missing user id." };
  if (userId === admin.id) {
    return { ok: false, message: "You cannot delete your own account." };
  }

  const client = createAdminClient();
  const { error } = await client.auth.admin.deleteUser(userId);
  if (error) return { ok: false, message: error.message };

  await recordActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: "user_deleted",
    target: email || userId,
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin");
  return { ok: true, message: "User deleted." };
}
