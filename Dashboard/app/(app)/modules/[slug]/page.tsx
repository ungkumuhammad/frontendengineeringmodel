import { notFound } from "next/navigation";
import Link from "next/link";
import { getModule, MODULES } from "@/lib/modules";
import { ModuleFrame } from "@/components/layout/module-frame";
import { Badge } from "@/components/ui/badge";

// Pre-render a route for each known module slug.
export function generateStaticParams() {
  return MODULES.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const mod = getModule(params.slug);
  return { title: mod ? `${mod.title} · Dashboard` : "Module" };
}

export default function ModulePage({ params }: { params: { slug: string } }) {
  const mod = getModule(params.slug);
  if (!mod) notFound();

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
