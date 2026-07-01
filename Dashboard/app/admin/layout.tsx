import { requireAdmin } from "@/lib/auth";
import { AppShell } from "@/components/layout/app-shell";

// Admin shell. requireAdmin() is a server-side guard in addition to the
// middleware check, so admin pages are protected even if middleware is bypassed.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireAdmin();
  return <AppShell profile={profile}>{children}</AppShell>;
}
