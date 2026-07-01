import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard, Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { formatDateTime, formatDuration, friendlyBrowser } from "@/lib/utils";
import type { LoginLog } from "@/types";

export default async function AdminHome() {
  const supabase = createClient();

  const [{ count: userCount }, { count: adminCount }, { count: disabledCount }, recent] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role", "admin"),
      supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("disabled", true),
      supabase
        .from("login_logs")
        .select("*")
        .order("login_time", { ascending: false })
        .limit(8),
    ]);

  const logins = (recent.data ?? []) as LoginLog[];

  return (
    <>
      <PageHeader
        title="Admin Console"
        description="Manage users and monitor platform activity."
      />

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total users" value={userCount ?? 0} />
        <StatCard label="Administrators" value={adminCount ?? 0} />
        <StatCard label="Disabled" value={disabledCount ?? 0} />
        <StatCard
          label="Standard users"
          value={(userCount ?? 0) - (adminCount ?? 0)}
        />
      </div>

      <Card>
        <CardHeader
          title="Recent Login Activity"
          description="Latest sign-ins across the platform"
          action={
            <Link
              href="/admin/logins"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          }
        />
        {logins.length === 0 ? (
          <CardBody>
            <EmptyState
              title="No login activity yet"
              description="Login events will appear here once users sign in."
            />
          </CardBody>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Email</TH>
                <TH>Login Time</TH>
                <TH>Logout Time</TH>
                <TH>Duration</TH>
                <TH>IP</TH>
                <TH>Browser</TH>
              </TR>
            </THead>
            <TBody>
              {logins.map((log) => (
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
      </Card>
    </>
  );
}
