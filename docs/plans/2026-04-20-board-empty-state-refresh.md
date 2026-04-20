# Board Empty State Refresh Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current weak empty boards placeholder with a large atmospheric canvas-style empty state that feels like an unstarted system design board.

**Architecture:** Keep the change local to `BoardListEmpty`. Rebuild the markup and SCSS so the empty state becomes a wide, lightly-gridded canvas scene with layered board surfaces, restrained depth, centered copy, and the existing primary board creation CTA.

**Tech Stack:** React 19 client component, Next.js App Router, TypeScript strict mode, SCSS Modules, existing CreateBoardButton feature.

---

### Task 1: Rebuild BoardListEmpty markup

**Files:**
- Modify: `src/widgets/board-list/ui/BoardListEmpty/BoardListEmpty.tsx`

Render:
- outer section
- full-width canvas panel
- stronger central layered SVG scene
- short title/subtitle
- existing `CreateBoardButton`

### Task 2: Rework BoardListEmpty styling

**Files:**
- Modify: `src/widgets/board-list/ui/BoardListEmpty/BoardListEmpty.module.scss`

Style:
- broader canvas proportions
- more visible but subtle grid
- layered board depth instead of small node cards
- restrained neutral palette with minimal accent
- responsive scaling on mobile

### Task 3: Verify

Run:
- `node_modules/.bin/tsc --noEmit --pretty false`
- `npm run lint`
- `npm run lint:styles`
- `npm run build`
