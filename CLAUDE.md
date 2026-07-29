# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev     # Start dev server at http://localhost:3000 (Next.js, hot reload)
npm run build   # Production build
npm run start   # Serve the production build
npm run lint    # ESLint (flat config in eslint.config.mjs, eslint-config-next rules)
```

There is no test suite configured.

## Architecture

Personal portfolio built with **Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS v4**.

- **Routing** lives in `app/`. Each route is a folder with a `page.tsx` (e.g. `app/projects/`, `app/blog/`). `app/layout.tsx` is the root layout — it wires up the Geist Sans/Mono fonts (exposed as `--font-geist-sans` / `--font-geist-mono` CSS variables) and imports `globals.css`.
- **Page-specific components** that aren't reusable UI live alongside their route or at the top of `app/` (e.g. `app/LandingHero.tsx`). Shared/cross-page components live in `components/` (e.g. `components/WorkInProgress.tsx` — used as the placeholder for unfinished routes like `/blog`).
- Components are **React Server Components by default** (`rsc: true`). Add `"use client"` only when a component needs browser APIs, state, or effects (this matters for Three.js / React Three Fiber components, which must be client components).

### UI system

- **shadcn/ui** (New York style, `neutral` base color, CSS variables) — primitives generated into `components/ui/` (card, button, drawer). Config in `components.json`. To add more, use the shadcn CLI rather than hand-writing.
- Icons: **lucide-react**.
- Class merging: use `cn()` from `lib/utils.ts` (clsx + tailwind-merge) for conditional/merged Tailwind classes.
- Theme tokens (colors, radius, dark-mode variant) are defined as CSS variables in `app/globals.css` via Tailwind v4's `@theme inline`. Tailwind v4 has **no `tailwind.config.js`** — configuration is CSS-first in `globals.css`.

### Conventions

- **Import alias**: `@/*` maps to the project root (e.g. `@/components/ui/button`, `@/lib/utils`).
- Static assets (tech-stack SVG logos, icons) live in `public/` and are rendered with `next/image`.
- TypeScript is in `strict` mode.
