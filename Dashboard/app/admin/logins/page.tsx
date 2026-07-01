import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Pagination } from "@/components/ui/pagination";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatDateTime, formatDuration, friendlyBrowser } from "@/lib/utils";
import type { LoginLog } from "@/types";

const PAGE_SIZE = 20;

export default async function LoginActivityPage({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const supabase = createClient();
  const page = Math.max(1, Number(searchParams.page ?? "1") || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, count } = await supabase
    .from("login_logs")
    .select("*", { count: "exact" })
    .order("login_time", { ascending: false })
    .range(from, to);

  const logs = (data ?? []) as LoginLog[];

  return (
    <>
      <PageHeader
        title="Login Activity"
        description="Full audit trail of user sign-in sessions."
      />
      <Card>
        {logs.length === 0 ? (
          <EmptyState title="No login activity" />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>Login Time</TH>
                <TH>Logout Time</TH>
                <TH>Duration</TH>
                <TH>IP Address</TH>
                <TH>Browser</TH>
              </TR>
            </THead>
            <TBody>
              {logs.map((log) => (
                <TR key={log.id}>
                  <TD className="font-medium">{log.email}</TD>
                  <TD>{formatDateTime(log.login_time)}</TD>
                  <TD>{formatDateTime(log.logout_time)}</TD>
                  <TD>
                    {log.logout_time ? (
                      formatDuration(log.login_time, log.logout_time)
                    ) : (
                      <Badge tone="success">Active</Badge>
                    )}
                  </TD>
                  <TD className="font-mono text-xs">{log.ip_address ?? "—"}</TD>
                  <TD>{friendlyBrowser(log.user_agent)}</TD>
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
