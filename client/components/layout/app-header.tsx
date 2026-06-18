"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  getCurrentUser,
  logout,
} from "@/lib/api/auth";

type User = {
  id: string;
  full_name: string;
  email: string;
};

export function AppHeader() {
  const router = useRouter();

  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    async function loadUser() {
      try {
        const data =
          await getCurrentUser();

        setUser(data.user);
      } catch {
        console.error(
          "Failed to load user"
        );
      }
    }

    loadUser();
  }, []);

  async function handleLogout() {
    try {
      await logout();

      router.push("/login");
    } catch {
      console.error(
        "Logout failed"
      );
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-white/10 px-6">
      <div>
        <h2 className="text-lg font-semibold">
          Command Center
        </h2>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarFallback>
              {user?.full_name
                ?.split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div>
              <p className="font-medium">
                {user?.full_name}
              </p>

              <p className="text-xs text-zinc-400">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() =>
              router.push("/profile")
            }
          >
            Profile
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() =>
              router.push(
                "/settings"
              )
            }
          >
            Settings
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={handleLogout}
          >
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}