// Shared domain types for the Engineering Dashboard.

export type UserRole = "admin" | "user";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  disabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginLog {
  id: string;
  user_id: string | null;
  email: string;
  ip_address: string | null;
  user_agent: string | null;
  login_time: string;
  logout_time: string | null;
  session_id: string | null;
}

export type ActivityAction =
  | "login"
  | "logout"
  | "user_created"
  | "user_deleted"
  | "password_reset"
  | "profile_updated"
  | "role_changed"
  | "user_disabled"
  | "user_enabled";

export interface ActivityLog {
  id: string;
  timestamp: string;
  user_id: string | null;
  user_email: string | null;
  action: ActivityAction;
  target: string | null;
  metadata: Record<string, unknown> | null;
}

// Result envelope returned by server actions so client forms can show
// success / error states without throwing across the RSC boundary.
export interface ActionResult<T = undefined> {
  ok: boolean;
  message?: string;
  data?: T;
}
