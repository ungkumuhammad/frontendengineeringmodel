"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { buildNav, ICONS } from "./nav-config";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";

function NavIcon({ name }: { name: string }) {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={ICONS[name] ?? ICONS.grid} />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      className={cn("h-4 w-4 shrink-0 transition-transform", collapsed ? "-rotate-90" : "")}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Sidebar({
  role,
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  role: UserRole;
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const pathname = usePathname();
  const sections = buildNav(role);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (title: string) =>
    setCollapsedSections((prev) => ({ ...prev, [title]: !prev[title] }));

  return (
    <>
      {/* Mobile backdrop */}
      {open ? (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
          collapsed ? "lg:hidden" : "",
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-5">
          <div className="relative h-8 w-8 shrink-0">
            <Image
              src="/branding/gentari-icon.png"
              alt="Gentari"
              fill
              className="object-contain"
              priority
            />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Front End Engineering</p>
            <p className="text-xs text-muted-foreground">Tool Dashboard</p>
          </div>
          <button
            onClick={onToggleCollapse}
            className="ml-auto hidden h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-accent lg:flex"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 5 8 12l7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {sections.map((section) => {
            const sectionCollapsed = collapsedSections[section.title];
            return (
              <div key={section.title} className="mb-5">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="flex w-full items-center justify-between px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
                >
                  <span>{section.title}</span>
                  <ChevronIcon collapsed={!!sectionCollapsed} />
                </button>
                {!sectionCollapsed ? (
                  <ul className="space-y-0.5">
                    {section.items.map((item) => {
                      const active =
                        pathname === item.href ||
                        (item.href !== "/dashboard" &&
                          item.href !== "/admin" &&
                          pathname.startsWith(item.href));
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                              "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm transition-colors",
                              active
                                ? "bg-primary/10 font-medium text-primary"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground",
                            )}
                          >
                            <NavIcon name={item.icon} />
                            <span className="truncate">{item.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
