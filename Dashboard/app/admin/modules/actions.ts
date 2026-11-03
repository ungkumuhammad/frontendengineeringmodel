"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getModule } from "@/lib/modules";
import { recordActivity } from "@/services/audit";
import type { ActionResult } from "@/types";

/** Hide or show a module for every user. Admin-only. */
export async function setModuleHidden(
  _prev: ActionResult | undefined,
  formData: FormData,
): Promise<ActionResult> {
  const admin = await requireAdmin();

  const slug = String(formData.get("slug") ?? "");
  const hidden = String(formData.get("hidden") ?? "false") === "true";

  const mod = getModule(slug);
  if (!mod) return { ok: false, message: "Unknown module." };

  const client = createAdminClient();
  const { error } = await client
    .from("module_settings")
    .upsert({ slug, hidden, updated_by: admin.id });

  if (error) {
    return {
      ok: false,
      message: `Could not update ${mod.title}: ${error.message}. Has migration 0004_module_settings.sql been applied?`,
    };
  }

  await recordActivity({
    actorId: admin.id,
    actorEmail: admin.email,
    action: hidden ? "module_hidden" : "module_shown",
    target: mod.title,
    metadata: { slug },
  });

  // Sidebar, /dashboard, /modules and the module routes all read the flag.
  revalidatePath("/", "layout");
  return { ok: true, message: hidden ? `${mod.title} hidden.` : `${mod.title} is visible again.` };
}
