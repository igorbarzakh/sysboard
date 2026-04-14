"use client";

import { useEffect, useState, startTransition } from "react";
import { LayoutGrid, List } from "lucide-react";
import { getBoards, BoardCard } from "@/entities/board";
import type { Board } from "@/entities/board";
import { CreateBoardButton } from "@/features/create-board";
import { useDeleteBoard } from "@/features/delete-board";
import type { WorkspaceBoard } from "@/entities/workspace";

type ViewMode = "grid" | "list";

function SkeletonCard() {
  return (
    <div className="w-full border border-border-subtle rounded-[10px] overflow-hidden">
      <div className="aspect-video bg-bg-surface animate-pulse" />
      <div className="px-3.5 py-3 bg-white border-t border-bg-surface flex flex-col gap-2">
        <div className="h-3.5 w-[55%] bg-bg-surface rounded-sm animate-pulse" />
        <div className="h-3 w-[30%] bg-bg-surface rounded-sm animate-pulse" />
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="grid grid-cols-[1fr_180px_180px_40px] gap-2 items-center px-3 py-2 rounded-lg">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-[100px] h-[64px] rounded-md border border-border-subtle bg-bg-surface animate-pulse shrink-0" />
        <div className="h-3.5 w-[40%] bg-bg-surface rounded-sm animate-pulse" />
      </div>
      <div className="h-3.5 w-[60%] bg-bg-surface rounded-sm animate-pulse" />
      <div className="h-3.5 w-[60%] bg-bg-surface rounded-sm animate-pulse" />
      <div />
    </div>
  );
}

function EmptyState({
  workspaceSlug,
  boardCount,
  onCreated,
}: {
  workspaceSlug: string;
  boardCount: number;
  onCreated: (b: WorkspaceBoard) => void;
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
      <CreateBoardButton
        workspaceSlug={workspaceSlug}
        boardCount={boardCount}
        onSuccess={onCreated}
      />
    </div>
  );
}

interface BoardListProps {
  workspaceSlug: string;
}

export function BoardList({ workspaceSlug }: BoardListProps) {
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<ViewMode>("grid");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = (localStorage.getItem("sdb:board-view") as ViewMode | null) ?? "grid";
    startTransition(() => {
      setView(saved);
      setMounted(true);
    });
  }, []);

  function handleViewChange(v: ViewMode) {
    setView(v);
    localStorage.setItem("sdb:board-view", v);
  }
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

  function handleCreated(board: WorkspaceBoard) {
    setBoards((prev) => [board as Board, ...prev]);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-text-primary">Boards</h1>

        <div className="flex items-center gap-2">
          {boards.length > 0 && !isLoading && (
            <CreateBoardButton
              workspaceSlug={workspaceSlug}
              boardCount={boards.length}
              onSuccess={handleCreated}
            />
          )}

          <div className="flex items-center bg-bg-surface p-0.5 rounded-lg gap-0.5">
            <button
              onClick={() => handleViewChange("grid")}
              className={`flex items-center justify-center w-8 h-7 rounded-md transition-all duration-250 ease-in-out cursor-pointer border-none ${
                view === "grid"
                  ? "bg-bg-elevated text-text-primary"
                  : "bg-transparent text-text-muted hover:text-text-primary"
              }`}>
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => handleViewChange("list")}
              className={`flex items-center justify-center w-8 h-7 rounded-md transition-all duration-250 ease-in-out cursor-pointer border-none ${
                view === "list"
                  ? "bg-bg-elevated text-text-primary"
                  : "bg-transparent text-text-muted hover:text-text-primary"
              }`}>
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {!mounted ? null : isLoading ? (
        view === "grid" ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="flex flex-col max-w-4xl">
            <div className="grid grid-cols-[1fr_180px_180px_40px] gap-2 px-3 pb-2">
              <span className="text-xs text-text-muted">Name</span>
              <span className="text-xs text-text-muted">Last modified</span>
              <span className="text-xs text-text-muted">Created</span>
              <span />
            </div>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </div>
        )
      ) : boards.length === 0 ? (
        <EmptyState workspaceSlug={workspaceSlug} boardCount={0} onCreated={handleCreated} />
      ) : view === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col max-w-4xl">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_180px_180px_40px] gap-2 px-3 pb-2">
            <span className="text-xs text-text-muted">Name</span>
            <span className="text-xs text-text-muted">Last modified</span>
            <span className="text-xs text-text-muted">Created</span>
            <span />
          </div>
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={handleDelete} view="list" />
          ))}
        </div>
      )}
    </div>
  );
}
