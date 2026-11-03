import { MODULES } from "@/lib/modules";
import { getHiddenModuleSlugs } from "@/lib/module-visibility";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { ModuleVisibilityTable } from "@/components/admin/module-visibility";

export default async function AdminModulesPage() {
  const hidden = await getHiddenModuleSlugs();

  return (
    <>
      <PageHeader
        title="Module Visibility"
        description="Hide a module from the sidebar, dashboard and module list for all users. Admins can still open a hidden module by its link to check it."
      />
      <Card>
        <CardHeader
          title="Modules"
          description={`${MODULES.filter((m) => !hidden.includes(m.slug)).length} of ${MODULES.length} visible`}
        />
        <ModuleVisibilityTable modules={MODULES} hiddenSlugs={hidden} />
      </Card>
    </>
  );
}
