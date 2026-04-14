"use client";

import { signOut } from "next-auth/react";
import { ChevronDown, Settings, LogOut } from "lucide-react";
import { useCurrentUser, Avatar } from "@/entities/user";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { Logo } from "@/shared/ui/logo";

export function DashboardHeader() {
  const user = useCurrentUser();

  return (
    <header className="h-[52px] bg-bg-elevated border-b border-border-default flex items-center gap-4 px-6 shrink-0">
      <Logo />
      <div className="flex-1" />

      <div className="shrink-0">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-1 bg-transparent border-none cursor-pointer rounded-lg px-2 py-1 transition-all duration-250 ease-in-out hover:bg-bg-surface group">
              <div className="flex items-center gap-2">
                <Avatar name={user.name} image={user.image} size="sm" />
                <span className="text-[13px] font-medium text-text-primary max-w-40 truncate">
                  {user.name ?? user.email}
                </span>
              </div>
              <ChevronDown size={14} className="text-text-primary" />
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side="bottom"
              align="end"
              sideOffset={8}
              className="w-55 rounded-xl bg-bg-elevated border border-border-default shadow-none p-0 overflow-hidden ring-0">
              <div className="flex flex-col items-center gap-2 px-4 pt-4 pb-3">
                <Avatar name={user.name} image={user.image} size="lg" />
                <div className="flex flex-col items-center gap-0.5 text-center">
                  <p className="text-sm font-semibold text-text-primary truncate max-w-45">
                    {user.name ?? "User"}
                  </p>
                  <p className="text-xs text-text-muted truncate max-w-45">{user.email}</p>
                </div>
              </div>

              <DropdownMenuSeparator className="bg-border-subtle mx-0" />

              <div className="p-1">
                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2 text-sm text-text-primary rounded-lg cursor-pointer transition-all duration-250 ease-in-out focus:bg-bg-surface focus:text-text-primary">
                  <Settings size={16} />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg cursor-pointer transition-all duration-250 ease-in-out text-text-primary hover:bg-danger-bg hover:text-danger focus:bg-danger-bg focus:text-danger focus:[&_svg]:text-danger">
                  <LogOut size={16} />
                  Log out
                </DropdownMenuItem>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
