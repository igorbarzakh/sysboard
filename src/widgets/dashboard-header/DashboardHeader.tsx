"use client";

import { signOut } from "next-auth/react";
import { useCurrentUser } from "@/entities/user";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { Logo } from "@/shared/ui/logo";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true">
      <path
        d="M3 5l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DashboardHeader() {
  const user = useCurrentUser();

  return (
    <header className="h-14 bg-bg-elevated border-b border-border-subtle flex items-center justify-between px-6 shrink-0">
      <Logo />

      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 bg-transparent border border-transparent rounded-md px-2 py-1 cursor-pointer text-text-primary transition-[border-color,background] duration-[120ms]">
            <Avatar size="sm">
              <AvatarImage src={user.image ?? undefined} alt={user.name ?? "User avatar"} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>

            <span className="text-sm font-medium text-text-primary max-w-40 truncate">
              {user.name ?? user.email}
            </span>

            <span className="text-text-muted flex">
              <ChevronDownIcon />
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent side="bottom" align="end" sideOffset={6}>
            <div className="px-3 py-2 border-b border-border-faint mb-1">
              <p className="text-sm font-medium text-text-primary truncate max-w-50">
                {user.name ?? "User"}
              </p>
              <p className="text-xs text-text-muted truncate max-w-50">{user.email}</p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="cursor-pointer">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </header>
  );
}
