# Migration Checklist for AI-Agent

> **IMPORTANT:** Follow this checklist in order. Each phase depends on the previous one.

---

## Pre-Migration Checklist

- [ ] Read all plan documents in `docs/plans/`
- [ ] Understand the current project structure
- [ ] Ensure clean git state before starting
- [ ] Create a backup branch: `git checkout -b backup/pre-migration`

---

## Phase 1: Dependencies (Est: 10 min)

**File: [2026-01-30-phase1-dependencies.md](./2026-01-30-phase1-dependencies.md)**

### Content Processing
- [ ] `bun add @content-collections/core`
- [ ] `bun add @content-collections/mdx`
- [ ] `bun add @content-collections/next`
- [ ] `bun add rehype-pretty-code`
- [ ] `bun add rehype-autolink-headings`
- [ ] `bun add rehype-slug`
- [ ] `bun add remark-gfm`
- [ ] `bun add remark-code-import`
- [ ] `bun add unist-util-visit`
- [ ] `bun add shiki`
- [ ] `bun add -D @types/mdx`

### i18n
- [ ] `bun add next-intl`

### Theming
- [ ] `bun add next-themes`

### Verification
- [ ] Run `bun install` from root - no errors
- [ ] Commit: `git commit -m "feat(web): add all required dependencies"`

---

## Phase 2: Content Collections (Est: 30 min)

**File: [2026-01-30-phase2-content-collections.md](./2026-01-30-phase2-content-collections.md)**

### Setup
- [ ] Create `apps/web/content-collections.ts`
- [ ] Update `apps/web/next.config.ts` with withContentCollections
- [ ] Update `apps/web/tsconfig.json` with content-collections path
- [ ] Create type definitions at `src/lib/core/types/content.ts`

### Migration
- [ ] Update all imports from `contentlayer/generated` to `content-collections`
- [ ] Update MDX rendering from useMDXComponent to MDXContent
- [ ] Delete `apps/web/contentlayer.config.ts`

### Verification
- [ ] Run `bun run dev` - content generates
- [ ] Check `.content-collections/generated` folder exists
- [ ] Commit: `git commit -m "feat(web): migrate to content-collections"`

---

## Phase 3: Route Consolidation (Est: 20 min)

**File: [2026-01-30-phase3-routes.md](./2026-01-30-phase3-routes.md)**

### CSS
- [ ] Update `src/styles/globals.css` with @theme inline block
- [ ] Verify all CSS variables are mapped

### Routes
- [ ] Move `src/app/[lang]/demo/` to `src/app/[locale]/demo/`
- [ ] Update `src/app/[locale]/layout.tsx` with QueryProvider
- [ ] Delete `src/app/[lang]/` folder

### Static Params
- [ ] Add generateStaticParams to all [locale] pages

### Verification
- [ ] All routes accessible
- [ ] Commit: `git commit -m "feat(web): consolidate routes to [locale]"`

---

## Phase 4: i18n Configuration (Est: 20 min)

**File: [2026-01-30-phase4-i18n.md](./2026-01-30-phase4-i18n.md)**

### Setup
- [ ] Create `src/i18n/routing.ts`
- [ ] Create `src/middleware.ts`
- [ ] Update `src/i18n/request.ts`
- [ ] Update `next.config.ts` with next-intl plugin

### Layout
- [ ] Update `src/lib/core/navigation.ts`
- [ ] Update NextIntlClientProvider in layout with getMessages

### Pages
- [ ] Add setRequestLocale to all pages in [locale]

### Verification
- [ ] Locale routing works
- [ ] No hydration errors
- [ ] Commit: `git commit -m "feat(web): configure next-intl for i18n"`

---

## Phase 5: Styles (Est: 10 min)

**File: [2026-01-30-phase5-styles.md](./2026-01-30-phase5-styles.md)**

### Updates
- [ ] Ensure globals.css has @theme inline
- [ ] Verify font variables work
- [ ] Check animations work

### DO NOT MODIFY
- [ ] `src/styles/mdx.css` - unchanged
- [ ] `src/styles/themes/` - unchanged
- [ ] `src/components/ui/` - unchanged
- [ ] Color values in :root and .dark - unchanged

### Verification
- [ ] UI looks identical to original
- [ ] Commit: `git commit -m "feat(web): finalize styles for Tailwind 4"`

---

## Phase 6: Verification (Est: 30 min)

**File: [2026-01-30-phase6-verification.md](./2026-01-30-phase6-verification.md)**

### Build
- [ ] `bun run tsc` - no errors
- [ ] `bun run build` - successful
- [ ] `bun run dev` - server starts

### Pages
- [ ] Landing page (http://localhost:3000/vi)
- [ ] Docs index (http://localhost:3000/vi/docs)
- [ ] Docs page with code (http://localhost:3000/vi/docs/mdx/code)
- [ ] Blog index (http://localhost:3000/vi/blog)
- [ ] Blog post (http://localhost:3000/vi/blog/gioi-thieu-blog)
- [ ] RSS XML feed (http://localhost:3000/vi/feed/blog.xml)
- [ ] RSS JSON feed (http://localhost:3000/vi/feed/blog.json)

### Features
- [ ] Theme toggle (dark/light) works
- [ ] Sidebar navigation works
- [ ] Command menu (Ctrl+K) works
- [ ] Mobile responsive works

### Final
- [ ] Production build works
- [ ] No console errors
- [ ] Commit: `git commit -m "feat(web): migration complete"`

---

## Post-Migration

- [ ] Update README.md with new setup instructions
- [ ] Delete backup branch if everything works
- [ ] Tag release: `git tag v1.0.0-migrated`

---

## Quick Reference Commands

```bash
# Navigate to web app
cd apps/web

# Install dependency
bun add <package>

# Run dev server
bun run dev

# Build
bun run build

# Type check
bun run tsc

# Lint
bun run lint

# Format
bun run format
```

---

## Rollback Plan

If migration fails:
```bash
git checkout backup/pre-migration
git branch -D main
git checkout -b main
```
