"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Command,
  Inbox,
  Mail,
  Calendar,
  Sparkles,
  Bot,
  Settings,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  {
    label: "Command Center",
    href: "/command-center",
    icon: Command,
  },
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Inbox",
    href: "/inbox",
    icon: Inbox,
  },
  {
    label: "Mail",
    href: "/mail",
    icon: Mail,
  },
  {
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    label: "Agent",
    href: "/agent",
    icon: Sparkles,
  },
  {
    label: "Assistant",
    href: "/assistant",
    icon: Bot,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
  },
];


export function AppSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger toggle — hidden on desktop */}
      <button
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-4 z-30 rounded-lg border border-white/10 bg-[#111111] p-2 text-zinc-300 md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile backdrop — hidden on desktop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r border-white/10 bg-[#111111] transition-transform duration-200 md:static md:z-auto md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-start justify-between border-b border-white/10 p-6">
          <div>
            <h1 className="text-xl font-semibold">Stelix</h1>
            <p className="text-sm text-zinc-400">
              AI Command Center
            </p>
          </div>

          {/* Mobile close button — hidden on desktop */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="text-zinc-400 transition hover:text-white md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="space-y-1 p-4">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition
                    ${pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}