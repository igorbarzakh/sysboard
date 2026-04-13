"use client";

import { useRouter } from "next/navigation";
import type { Board } from "../model/types";
import { Avatar } from "@/entities/user";

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

function getBoardGradient(id: string): string {
  const hash = id.split("").reduce((acc, c) => (acc * 31 + c.charCodeAt(0)) | 0, 0);
  const gradients = [
    "linear-gradient(135deg, rgba(66,99,235,0.12) 0%, rgba(121,80,242,0.12) 100%)",
    "linear-gradient(135deg, rgba(230,119,0,0.12) 0%, rgba(194,37,92,0.12) 100%)",
    "linear-gradient(135deg, rgba(47,158,68,0.12) 0%, rgba(66,99,235,0.12) 100%)",
    "linear-gradient(135deg, rgba(121,80,242,0.12) 0%, rgba(194,37,92,0.12) 100%)",
    "linear-gradient(135deg, rgba(92,124,250,0.12) 0%, rgba(47,158,68,0.12) 100%)",
  ];
  return gradients[Math.abs(hash) % gradients.length];
}

interface BoardCardProps {
  board: Board;
  currentUserId: string;
  onDelete: (id: string) => void;
}

export function BoardCard({ board, currentUserId, onDelete }: BoardCardProps) {
  const router = useRouter();
  const isOwner = board.ownerId === currentUserId;

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    onDelete(board.id);
  }

  return (
    <article
      className="group/card w-70 bg-bg-elevated border border-border-default rounded-lg overflow-hidden flex flex-col shadow-node cursor-pointer transition-[box-shadow,transform] duration-150 hover:shadow-elevated hover:-translate-y-0.5"
      onClick={() => router.push(`/board/${board.id}`)}>
      {/* Preview */}
      <div
        className="aspect-video border-b border-border-faint flex items-center justify-center"
        style={{ background: getBoardGradient(board.id) }}>
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          className="opacity-30">
          <rect x="2" y="2" width="12" height="8" rx="2" fill="currentColor" />
          <rect x="18" y="2" width="12" height="8" rx="2" fill="currentColor" />
          <rect x="10" y="22" width="12" height="8" rx="2" fill="currentColor" />
          <line x1="8" y1="10" x2="8" y2="16" stroke="currentColor" strokeWidth="1.5" />
          <line x1="24" y1="10" x2="24" y2="16" stroke="currentColor" strokeWidth="1.5" />
          <line x1="8" y1="16" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" />
          <line x1="24" y1="16" x2="16" y2="22" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </div>

      {/* Content */}
      <div className="px-4 py-3 flex flex-col gap-2">
        {/* Name row */}
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-md font-semibold text-text-primary truncate flex-1 min-w-0">
            {board.name}
          </h3>

          {isOwner && (
            <button
              className="opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto shrink-0 bg-transparent border-none cursor-pointer text-text-muted p-1 rounded-sm flex items-center justify-center transition-opacity duration-100"
              onClick={handleDelete}
              aria-label="Delete board">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true">
                <path
                  d="M2 3.5h10M5.5 3.5V2.5h3v1M5.833 6.5v4M8.167 6.5v4M3.5 3.5l.667 8h5.666l.667-8"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Owner + time */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar name={board.owner.name} image={board.owner.image} size="sm" />
            <span className="text-sm text-text-secondary truncate max-w-30">
              {board.owner.name ?? "Unknown"}
            </span>
          </div>

          <time dateTime={board.updatedAt} className="text-xs text-text-muted shrink-0">
            {formatRelativeTime(board.updatedAt)}
          </time>
        </div>
      </div>
    </article>
  );
}
