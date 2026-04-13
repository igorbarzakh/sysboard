"use client";

import { useEffect, useState } from "react";
import { getBoards, BoardCard } from "@/entities/board";
import type { Board } from "@/entities/board";
import { useCurrentUser } from "@/entities/user";
import { CreateBoardButton } from "@/features/create-board";
import { useDeleteBoard } from "@/features/delete-board";

function SkeletonCard() {
  return (
    <div className="w-70 bg-bg-elevated border border-border-default rounded-lg overflow-hidden shadow-node">
      <div className="aspect-video bg-bg-surface animate-pulse" />
      <div className="px-4 py-3 flex flex-col gap-3">
        <div className="h-4 w-[65%] bg-bg-surface rounded-sm animate-pulse" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-bg-surface shrink-0 animate-pulse" />
          <div className="h-3 w-[40%] bg-bg-surface rounded-sm animate-pulse" />
        </div>
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
    <div className="flex flex-col items-center gap-5 py-12 px-6 text-center">
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

      <div className="flex flex-col gap-2">
        <p className="text-md font-semibold text-text-primary">No boards yet</p>
        <p className="text-base text-text-secondary">Create your first board to start designing</p>
      </div>

      <CreateBoardButton boardCount={boardCount} onSuccess={onCreated} />
    </div>
  );
}

export function BoardList() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const user = useCurrentUser();
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
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text-primary">My boards</h1>
        {!isLoading && boards.length > 0 && (
          <CreateBoardButton boardCount={boards.length} onSuccess={handleCreated} />
        )}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : boards.length === 0 ? (
        <EmptyState boardCount={0} onCreated={handleCreated} />
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-5">
          {boards.map((board) => (
            <BoardCard
              key={board.id}
              board={board}
              currentUserId={user?.id ?? ""}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
