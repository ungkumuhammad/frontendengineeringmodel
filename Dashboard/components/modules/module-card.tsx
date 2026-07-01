import Link from "next/link";
import type { ModuleDefinition } from "@/lib/modules";
import { ICONS } from "@/components/layout/nav-config";
import { Badge } from "@/components/ui/badge";

export function ModuleCard({ module }: { module: ModuleDefinition }) {
  return (
    <Link
      href={`/modules/${module.slug}`}
      className="group flex flex-col rounded-lg border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/40"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={ICONS[module.icon] ?? ICONS.grid} />
          </svg>
        </span>
        <Badge tone="default">{module.category}</Badge>
      </div>
      <h3 className="text-sm font-semibold group-hover:text-primary">
        {module.title}
      </h3>
      <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">
        {module.description}
      </p>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
        Open module
        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </Link>
  );
}
