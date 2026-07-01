import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { LoginForm } from "./login-form";

// Public login page. No public sign-up — accounts are provisioned by an admin.
export default async function LoginPage() {
  // Already signed in? Bounce to the role-appropriate home. (This replaces the
  // equivalent redirect that used to live in middleware.)
  const profile = await getCurrentProfile();
  if (profile && !profile.disabled) {
    redirect(profile.role === "admin" ? "/admin" : "/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2 3 14h7v8l10-12h-7z" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold">Engineering Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to access your engineering tools
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Accounts are provisioned by an administrator. Contact your admin if
          you need access.
        </p>
      </div>
    </div>
  );
}
