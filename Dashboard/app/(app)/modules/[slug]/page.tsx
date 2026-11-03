import { notFound } from "next/navigation";
import Link from "next/link";
import { getModule } from "@/lib/modules";
import { getCurrentProfile } from "@/lib/auth";
import { getHiddenModuleSlugs } from "@/lib/module-visibility";
import { ModuleFrame } from "@/components/layout/module-frame";
import { Badge } from "@/components/ui/badge";

// Rendered per request: whether a module is hidden (Admin > Module Visibility)
// can change at any time, so the route cannot be pre-rendered.
export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { slug: string } }) {
  const mod = getModule(params.slug);
  return { title: mod ? `${mod.title} · Dashboard` : "Module" };
}

export default async function ModulePage({ params }: { params: { slug: string } }) {
  const mod = getModule(params.slug);
  if (!mod) notFound();

  // A module hidden in Admin > Module Visibility 404s for users; admins can
  // still open it by link to check it before showing it again.
  const [profile, hiddenSlugs] = await Promise.all([getCurrentProfile(), getHiddenModuleSlugs()]);
  const isHidden = hiddenSlugs.includes(mod.slug);
  if (isHidden && profile?.role !== "admin") notFound();

  return (
    <div className="flex h-full flex-col">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/modules"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Modules
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-lg font-semibold">{mod.title}</h1>
          <Badge tone="default">{mod.category}</Badge>
          {isHidden ? (
            <Link href="/admin/modules">
              <Badge tone="warning">Hidden from users</Badge>
            </Link>
          ) : null}
        </div>
        <a
          href={mod.htmlPath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          Open in new tab
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 3h7v7M10 14 21 3M21 14v7H3V3h7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      </div>
      <ModuleFrame src={mod.htmlPath} title={mod.title} />
    </div>
  );
}
