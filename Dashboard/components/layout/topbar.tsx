"use client";

import { useState } from "react";
import { ThemeToggle } from "./theme-toggle";
import { logout } from "@/app/login/actions";
import { Badge } from "@/components/ui/badge";
import type { Profile } from "@/types";

export function Topbar({
  profile,
  onMenu,
}: {
  profile: Profile;
  onMenu: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (profile.name || profile.email)
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b bg-card/80 px-4 backdrop-blur lg:px-6">
      <button
        onClick={onMenu}
        className="flex h-9 w-9 items-center justify-center rounded-md border text-muted-foreground hover:bg-accent lg:hidden"
        aria-label="Open menu"
      >
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
        </svg>
      </button>

      <div className="hidden text-sm text-muted-foreground sm:block">
        Welcome back, {profile.name || profile.email.split("@")[0]}
      </div>

      <div className="ml-auto flex items-center gap-3">
        <ThemeToggle />

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md border px-2 py-1.5 hover:bg-accent"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </span>
            <span className="hidden text-sm font-medium sm:block">
              {profile.name || profile.email}
            </span>
          </button>

          {menuOpen ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border bg-card p-3 shadow-lg">
                <div className="border-b pb-2">
                  <p className="truncate text-sm font-medium">
                    {profile.name || "—"}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                  <div className="mt-2">
                    <Badge tone={profile.role === "admin" ? "info" : "default"}>
                      {profile.role}
                    </Badge>
                  </div>
                </div>
                <form action={logout} className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-md px-2 py-1.5 text-left text-sm text-[hsl(var(--destructive))] hover:bg-muted"
                  >
                    Sign out
                  </button>
                </form>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </header>
  );
}
