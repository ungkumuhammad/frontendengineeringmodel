import { requireUser } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

// Authenticated shell for standard user routes (dashboard, modules, settings).
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireUser();
  return <AppShell profile={profile}>{children}</AppShell>;
}
