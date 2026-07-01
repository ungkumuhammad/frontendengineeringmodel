import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";

// Entry point: "/" routes to /login when unauthenticated, otherwise to the
// role-appropriate home (admins -> /admin, users -> /dashboard).
export default async function RootPage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  redirect(profile.role === "admin" ? "/admin" : "/dashboard");
}
