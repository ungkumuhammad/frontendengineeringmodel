import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { SearchInput } from "@/components/ui/search-input";
import { Pagination } from "@/components/ui/pagination";
import { EmptyState } from "@/components/ui/states";
import {
  UserManagementCreateButton,
  UserManagementTable,
} from "@/components/admin/user-management";
import type { Profile } from "@/types";

const PAGE_SIZE = 10;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const admin = await requireAdmin();
  const supabase = createClient();

  const q = searchParams.q?.trim() ?? "";
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (q) {
    query = query.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
  }

  const { data, count } = await query.range(from, to);
  const users = (data ?? []) as Profile[];

  return (
    <>
      <PageHeader
        title="Users"
        description="Create, edit, and manage user accounts. No Supabase dashboard required."
      />

      <Card>
        <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <SearchInput placeholder="Search by name or email…" />
          <UserManagementCreateButton />
        </div>

        {users.length === 0 ? (
          <EmptyState
            title={q ? "No matching users" : "No users yet"}
            description={
              q
                ? "Try a different search term."
                : "Create your first user to get started."
            }
          />
        ) : (
          <UserManagementTable users={users} currentAdminId={admin.id} />
        )}

        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      </Card>
    </>
  );
}
