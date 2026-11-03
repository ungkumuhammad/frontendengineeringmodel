import { getVisibleModules } from "@/lib/module-visibility";
import { PageHeader } from "@/components/ui/page-header";
import { ModuleCard } from "@/components/modules/module-card";

export default async function ModulesIndexPage() {
  const modules = await getVisibleModules();
  return (
    <>
      <PageHeader
        title="Modules"
        description="All available engineering analysis tools."
      />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((m) => (
          <ModuleCard key={m.slug} module={m} />
        ))}
      </div>
    </>
  );
}
