import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { MODULES } from "@/lib/modules";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, Card, CardHeader, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/modules/module-card";

export default async function DashboardPage() {
  const profile = await requireUser();

  const byCategory = MODULES.reduce<Record<string, typeof MODULES>>(
    (acc, m) => {
      (acc[m.category] ??= []).push(m);
      return acc;
    },
    {},
  );

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Your centralized workspace for engineering analysis tools."
        action={
          profile.role === "admin" ? (
            <Link href="/admin">
              <Button variant="outline">Admin console</Button>
            </Link>
          ) : undefined
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Available modules" value={MODULES.length} hint="Techno-economics & pipeline sizing" />
        <StatCard label="Your role" value={profile.role} hint={profile.email} />
        <StatCard
          label="Module categories"
          value={Object.keys(byCategory).length}
          hint={Object.keys(byCategory).join(" · ")}
        />
      </div>

      {Object.entries(byCategory).map(([category, modules]) => (
        <Card key={category} className="mb-6">
          <CardHeader title={category} description={`${modules.length} tool(s)`} />
          <CardBody>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {modules.map((m) => (
                <ModuleCard key={m.slug} module={m} />
              ))}
            </div>
          </CardBody>
        </Card>
      ))}
    </>
  );
}
