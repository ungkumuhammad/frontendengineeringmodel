// Server-side lookup of which modules an admin has hidden (public.module_settings).
// The module list itself stays in lib/modules.ts; this only filters it.
import "server-only";
import { createClient } from "@/lib/supabase/server";
import { MODULES, type ModuleDefinition } from "@/lib/modules";

/**
 * Slugs of modules hidden from the dashboard. Fails open: if the table is
 * missing (migration 0004 not applied) or Supabase errors, nothing is hidden,
 * so a settings problem never takes every module offline.
 */
export async function getHiddenModuleSlugs(): Promise<string[]> {
  // Outside the try: createClient() reads cookies(), which throws Next's
  // dynamic-rendering signal at build time. Swallowing it would let a page be
  // pre-rendered with nothing hidden.
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from("module_settings")
      .select("slug")
      .eq("hidden", true);
    if (error) {
      console.error("getHiddenModuleSlugs failed", error.message);
      return [];
    }
    return (data ?? []).map((r) => r.slug);
  } catch (err) {
    console.error("getHiddenModuleSlugs failed", err);
    return [];
  }
}

/** Modules not hidden by an admin, in registry order. */
export async function getVisibleModules(): Promise<ModuleDefinition[]> {
  const hidden = new Set(await getHiddenModuleSlugs());
  return MODULES.filter((m) => !hidden.has(m.slug));
}
