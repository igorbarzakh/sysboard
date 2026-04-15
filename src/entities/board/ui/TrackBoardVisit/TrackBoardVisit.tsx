"use client";

import { useEffect } from "react";
import { useRecentBoards } from "../../hooks";

interface TrackBoardVisitProps {
  id: string;
  name: string;
  workspaceSlug: string;
}

export function TrackBoardVisit({ id, name, workspaceSlug }: TrackBoardVisitProps) {
  const { addRecentBoard } = useRecentBoards();

  useEffect(() => {
    addRecentBoard({ id, name, workspaceSlug });
  }, [id, name, workspaceSlug, addRecentBoard]);

  return null;
}
