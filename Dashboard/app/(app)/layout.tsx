import { requireUser } from "@/lib/auth";
import { getHiddenModuleSlugs } from "@/lib/module-visibility";
import { AppShell } from "@/components/layout/app-shell";

// Authenticated shell for standard user routes (dashboard, modules, settings).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireUser();
  const hiddenModules = await getHiddenModuleSlugs();
  return (
    <AppShell profile={profile} hiddenModules={hiddenModules}>
      {children}
    </AppShell>
  );
}
