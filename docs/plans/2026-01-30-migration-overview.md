# Blog Personal Next.js 16 Migration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Migrate "web" and "content" folders from old project to Next.js 16 + Turborepo monorepo while maintaining 100% UI/UX and styles.

**Architecture:** 
- Consolidate two route patterns (`[lang]` new vs `[locale]` old) into unified `[locale]` pattern
- Replace abandoned Contentlayer2 with Content Collections for MDX processing
- Configure next-intl for i18n with Next.js 16 App Router
- Keep all shadcn/ui components and Tailwind CSS styles intact

**Tech Stack:**
- Runtime: Bun.js 1.2.0
- Framework: Next.js 16.1.5 + React 19.2.3
- Content: Content Collections (replacing Contentlayer2)
- i18n: next-intl 4.x
- Styling: Tailwind CSS 4, shadcn/ui (new-york style)
- State: Zustand 5, TanStack Query 5
- Forms: React Hook Form 7, Zod 4

---

## Analysis Summary

### Current State Issues

#### 1. Missing Dependencies (Critical)
The old project used packages not installed in the new monorepo:

**Content Processing:**
- `contentlayer2` - ABANDONED, incompatible with Next.js 14+
- `next-contentlayer2` - depends on contentlayer2
- `rehype-pretty-code` - code syntax highlighting
- `rehype-autolink-headings` - auto link headings
- `rehype-slug` - add IDs to headings
- `remark-gfm` - GitHub Flavored Markdown
- `remark-code-import` - import code from files
- `unist-util-visit` - AST traversal

**i18n:**
- `next-intl` - internationalization

**UI/Theming:**
- `next-themes` - dark/light mode
- `tailwindcss-animate` - animation utilities

#### 2. Conflicting Route Structures
```
[lang]/           ← New Next.js 16 setup (minimal)
  ├── layout.tsx  - Basic RootLayout with QueryProvider
  ├── page.tsx    - Placeholder page
  └── globals.css - New Tailwind 4 oklch colors

[locale]/         ← Old project (full features)
  ├── layout.tsx  - Full layout with ThemeProvider, Header, Footer
  ├── page.tsx    - Landing page
  ├── blog/       - Blog pages
  ├── docs/       - Documentation pages
  └── feed/       - RSS feeds
```

#### 3. Dual CSS Files
- `src/app/[lang]/globals.css` - New Tailwind 4 (oklch colors, @theme inline)
- `src/styles/globals.css` - Old project (hsl colors, @plugin "tailwindcss-animate")

#### 4. Contentlayer References
Multiple files import from `contentlayer/generated`:
- `src/app/sitemap.ts`
- `src/app/[locale]/blog/*/page.tsx`
- `src/app/[locale]/docs/*/page.tsx`
- `src/components/blog/*.tsx`
- `src/components/docs/*.tsx`
- `src/lib/core/utils/blog.ts`
- `src/lib/core/utils/doc.ts`

---

## Migration Strategy

### Phase 1: Dependencies Setup
Install all missing dependencies and configure them.

### Phase 2: Content System Migration
Replace Contentlayer2 with Content Collections.

### Phase 3: Route Consolidation
Merge `[lang]` and `[locale]` into unified structure.

### Phase 4: i18n Configuration
Set up next-intl with Next.js 16.

### Phase 5: Styles Unification
Consolidate CSS files while keeping old design intact.

### Phase 6: Verification
Test all pages and features work correctly.

---

## Detailed Plans

The migration is split into separate plan documents:

1. [Phase 1: Dependencies](./2026-01-30-phase1-dependencies.md)
2. [Phase 2: Content Collections](./2026-01-30-phase2-content-collections.md)
3. [Phase 3: Route Consolidation](./2026-01-30-phase3-routes.md)
4. [Phase 4: i18n Setup](./2026-01-30-phase4-i18n.md)
5. [Phase 5: Styles](./2026-01-30-phase5-styles.md)
6. [Phase 6: Verification](./2026-01-30-phase6-verification.md)

---

## Quick Reference

### Key Files to Keep (DO NOT MODIFY UI/STYLES)
```
src/components/           - All shadcn/ui and custom components
src/styles/globals.css    - Old project styles (KEEP hsl colors)
src/styles/mdx.css        - MDX styling
src/config/               - Site, blog, docs configuration
```

### Key Files to Modify
```
apps/web/package.json     - Add missing dependencies
apps/web/next.config.ts   - Add next-intl plugin
apps/web/tsconfig.json    - Update paths
content-collections.ts    - NEW: Replace contentlayer.config.ts
src/middleware.ts         - NEW: next-intl middleware
```

### Key Files to Delete/Consolidate
```
src/app/[lang]/           - DELETE: Merge into [locale]
contentlayer.config.ts    - REPLACE: With content-collections.ts
```
