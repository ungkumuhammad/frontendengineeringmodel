import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardHeader, CardBody } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProfileForm, PasswordForm } from "./settings-forms";

export default async function SettingsPage() {
  const profile = await requireUser();

  return (
    <>
      <PageHeader
        title="Settings"
        description="Manage your profile and account security."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Profile"
            description="Your account details"
            action={
              <Badge tone={profile.role === "admin" ? "info" : "default"}>
                {profile.role}
              </Badge>
            }
          />
          <CardBody>
            <ProfileForm profile={profile} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader
            title="Security"
            description="Change your password"
          />
          <CardBody>
            <PasswordForm />
          </CardBody>
        </Card>
      </div>
    </>
  );
}
