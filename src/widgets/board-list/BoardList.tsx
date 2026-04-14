"use client";

import { useEffect, useState } from "react";
import { getBoards, BoardCard } from "@/entities/board";
import type { Board } from "@/entities/board";
import { CreateBoardButton } from "@/features/create-board";
import { useDeleteBoard } from "@/features/delete-board";

function SkeletonCard() {
  return (
    <div className="w-full border border-border-default rounded-[10px] overflow-hidden">
      <div className="aspect-video bg-bg-surface animate-pulse" />
      <div className="px-[14px] py-3 bg-white border-t border-border-subtle flex flex-col gap-2">
        <div className="h-3.5 w-[55%] bg-bg-surface rounded-sm animate-pulse" />
        <div className="h-3 w-[30%] bg-bg-surface rounded-sm animate-pulse" />
      </div>
    </div>
  );
}

function EmptyState({
  boardCount,
  onCreated,
}: {
  boardCount: number;
  onCreated: (b: Board) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-5 py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-lg bg-accent-dim flex items-center justify-center text-accent">
        <svg
          width="28"
          height="28"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <rect x="2" y="2" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="16" y="2" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="9" y="19" width="10" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
          <path
            d="M7 9v4.5M21 9v4.5M7 13.5C7 13.5 14 18 21 13.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path d="M14 13.5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-sm font-semibold text-text-primary">No boards yet</p>
        <p className="text-sm text-text-secondary">Create your first board to start designing</p>
      </div>

      <CreateBoardButton boardCount={boardCount} onSuccess={onCreated} />
    </div>
  );
}

export function BoardList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { deleteBoard } = useDeleteBoard();

  useEffect(() => {
    getBoards()
      .then(setBoards)
      .finally(() => setIsLoading(false));
  }, []);

  async function handleDelete(id: string) {
    setBoards((prev) => prev.filter((b) => b.id !== id));
    try {
      await deleteBoard(id);
    } catch {
      getBoards().then(setBoards);
    }
  }

  function handleCreated(board: Board) {
    setBoards((prev) => [board, ...prev]);
  }

  return (
    <div className="flex flex-col gap-4">
      {!isLoading && boards.length > 0 && (
        <div className="flex justify-end">
          <CreateBoardButton boardCount={boards.length} onSuccess={handleCreated} />
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : boards.length === 0 ? (
        <EmptyState boardCount={0} onCreated={handleCreated} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
