"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import type { Board } from "../model/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";

function formatRelativeTime(dateStr: string): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffMs = new Date(dateStr).getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHr / 24);

  if (Math.abs(diffSec) < 60) return rtf.format(diffSec, "second");
  if (Math.abs(diffMin) < 60) return rtf.format(diffMin, "minute");
  if (Math.abs(diffHr) < 24) return rtf.format(diffHr, "hour");
  return rtf.format(diffDay, "day");
}

interface BoardCardProps {
  board: Board;
  onDelete: (id: string) => void;
}

export function BoardCard({ board, onDelete }: BoardCardProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <>
      <article
        className="group/card w-full border border-border-default rounded-[10px] overflow-hidden cursor-pointer transition-[border-color] duration-150 hover:border-border-strong"
        onClick={() => router.push(`/board/${board.id}`)}>
        {/* Preview */}
        <div
          className="aspect-video bg-white"
          style={{
            backgroundImage: "radial-gradient(circle, #dee2e6 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        {/* Info bar */}
        <div className="px-3.5 py-3 bg-white border-t border-border-subtle flex flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-text-primary truncate flex-1 min-w-0">
              {board.name}
            </h3>

            <DropdownMenu>
              <DropdownMenuTrigger
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 bg-transparent border-none cursor-pointer text-text-muted p-1.5 rounded-md flex items-center justify-center transition-colors duration-150 hover:text-text-secondary hover:bg-bg-surface">
                <MoreHorizontal size={16} />
              </DropdownMenuTrigger>

              <DropdownMenuContent side="bottom" align="start" sideOffset={4} className="w-36">
                <DropdownMenuItem
                  onClick={(e) => { e.stopPropagation(); router.push(`/board/${board.id}`); }}
                  className="cursor-pointer transition-colors duration-150 focus:bg-bg-surface focus:text-text-primary">
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer transition-colors duration-150 focus:bg-bg-surface focus:text-text-primary">
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer transition-colors duration-150 focus:bg-bg-surface focus:text-text-primary">
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmOpen(true);
                  }}
                  className="cursor-pointer transition-colors duration-150 text-text-primary focus:bg-danger-bg focus:text-danger">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <time dateTime={board.updatedAt} className="text-xs text-text-muted">
            {formatRelativeTime(board.updatedAt)}
          </time>
        </div>
      </article>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          showCloseButton={false}
          className="bg-bg-elevated border border-border-default ring-0 max-w-sm">
          <DialogHeader>
            <DialogTitle>{`Delete "${board.name}"?`}</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="border-border-default">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setConfirmOpen(false);
                onDelete(board.id);
              }}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
