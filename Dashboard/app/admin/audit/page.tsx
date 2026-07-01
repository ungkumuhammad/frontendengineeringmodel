import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatDateTime } from "@/lib/utils";
import type { ActivityAction, ActivityLog } from "@/types";

const PAGE_SIZE = 20;

const ACTION_TONE: Record<ActivityAction, "default" | "success" | "warning" | "danger" | "info"> = {
  login: "success",
  logout: "default",
  user_created: "info",
  user_deleted: "danger",
  password_reset: "warning",
  profile_updated: "default",
  role_changed: "warning",
  user_disabled: "danger",
  user_enabled: "success",
};

const ACTION_LABEL: Record<ActivityAction, string> = {
  login: "Login",
  logout: "Logout",
  user_created: "User Created",
  user_deleted: "User Deleted",
  password_reset: "Password Reset",
  profile_updated: "Profile Updated",
  role_changed: "Role Changed",
  user_disabled: "User Disabled",
  user_enabled: "User Enabled",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("timestamp", { ascending: false })
    .range(from, to);

  const logs = (data ?? []) as ActivityLog[];

  return (
    <>
      <PageHeader
        title="Audit Log"
        description="Record of important actions across the platform."
      />
      <Card>
        {logs.length === 0 ? (
          <EmptyState title="No activity recorded" />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Timestamp</TH>
                <TH>Action</TH>
                <TH>Actor</TH>
                <TH>Target</TH>
                <TH>Details</TH>
              </TR>
            </THead>
            <TBody>
              {logs.map((log) => (
                <TR key={log.id}>
                  <TD className="whitespace-nowrap text-muted-foreground">
                    {formatDateTime(log.timestamp)}
                  </TD>
                  <TD>
                    <Badge tone={ACTION_TONE[log.action]}>
                      {ACTION_LABEL[log.action] ?? log.action}
                    </Badge>
                  </TD>
                  <TD>{log.user_email ?? "—"}</TD>
                  <TD>{log.target ?? "—"}</TD>
                  <TD className="max-w-xs truncate font-mono text-xs text-muted-foreground">
                    {log.metadata ? JSON.stringify(log.metadata) : "—"}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
        <Pagination page={page} pageSize={PAGE_SIZE} total={count ?? 0} />
      </Card>
    </>
  );
}
