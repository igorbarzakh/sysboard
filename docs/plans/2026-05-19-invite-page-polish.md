# Invite Page Polish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Polish the invite acceptance page styling without changing invite behavior.

**Architecture:** The invite page UI already lives in the `pages-layer` slice. This change is limited to the page SCSS module and keeps the React component, route loading, and API flow intact.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, SCSS Modules, shared CSS tokens, shared Button primitive.

---

### Task 1: Polish Invite Page Styles

**Files:**
- Modify: `src/pages-layer/invite-accept/InviteAcceptPage.module.scss`

**Step 1: Adjust layout rhythm**

Update the page and card spacing so the card remains centered but feels more intentional: use responsive padding, a slightly narrower card, and more controlled internal gaps.

**Step 2: Refine icon and heading treatment**

Keep the same status icon behavior, but tune icon size, spacing, title line-height, and description width so the text reads cleaner on desktop and mobile.

**Step 3: Strengthen the action area**

Keep the shared `Button`, but locally size invite-page actions to full width with a taller control and balanced icon gap.

**Step 4: Verify**

Run:

```bash
npm run lint:styles:fix
npm run lint:styles
npm run build
```

Then run the app and visually inspect the invite page in a browser.
