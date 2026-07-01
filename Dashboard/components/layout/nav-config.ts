// Navigation definitions shared by the sidebar. Icons are inline SVG path
// data keyed by name (kept dependency-free).
import { MODULES } from "@/lib/modules";
import type { UserRole } from "@/types";

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  adminOnly?: boolean;
}

export interface NavSection {
  title: string;
  items: NavItem[];
}

export function buildNav(role: UserRole): NavSection[] {
  const sections: NavSection[] = [
    {
      title: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: "home" },
        { label: "Modules", href: "/modules", icon: "grid" },
      ],
    },
    {
      title: "Engineering Modules",
      items: MODULES.map((m) => ({
        label: m.title,
        href: `/modules/${m.slug}`,
        icon: m.icon,
      })),
    },
    {
      title: "Account",
      items: [{ label: "Settings", href: "/settings", icon: "settings" }],
    },
  ];

  if (role === "admin") {
    sections.splice(1, 0, {
      title: "Administration",
      items: [
        { label: "Admin Home", href: "/admin", icon: "shield" },
        { label: "Users", href: "/admin/users", icon: "users" },
        { label: "Login Activity", href: "/admin/logins", icon: "activity" },
        { label: "Audit Log", href: "/admin/audit", icon: "list" },
      ],
    });
  }

  return sections;
}

export const ICONS: Record<string, string> = {
  home: "M3 11 12 3l9 8M5 10v10h14V10",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  settings:
    "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.8 19a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H1a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 2.2 6a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H7a1.6 1.6 0 0 0 1-1.5V.9a2 2 0 1 1 4 0V1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V7a1.6 1.6 0 0 0 1.5 1h.1a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1z",
  shield: "M12 3l8 3v6c0 5-3.5 7.7-8 9-4.5-1.3-8-4-8-9V6z",
  users:
    "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  activity: "M22 12h-4l-3 9L9 3l-3 9H2",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  bolt: "M13 2 3 14h7v8l10-12h-7z",
  swap: "M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4",
  pipe: "M3 12h3m12 0h3M6 9a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3z",
};
