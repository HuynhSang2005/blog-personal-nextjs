# Phase 1: Dependencies Setup

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Install all missing dependencies required for the old project to work with Next.js 16.

**Files:**
- Modify: `apps/web/package.json`

---

## Task 1: Install Content Processing Dependencies

**Step 1: Add content-collections packages**

Run in `apps/web`:
```bash
bun add @content-collections/core @content-collections/mdx @content-collections/next
```

**Step 2: Add MDX processing packages**

```bash
bun add rehype-pretty-code rehype-autolink-headings rehype-slug remark-gfm remark-code-import unist-util-visit shiki
```

**Step 3: Add remark/rehype type definitions**

```bash
bun add -D @types/mdx
```

**Step 4: Commit**

```bash
git add apps/web/package.json apps/web/bun.lockb
git commit -m "feat(web): add content-collections and MDX processing dependencies"
```

---

## Task 2: Install i18n Dependencies

**Step 1: Add next-intl**

Run in `apps/web`:
```bash
bun add next-intl
```

**Step 2: Commit**

```bash
git add apps/web/package.json apps/web/bun.lockb
git commit -m "feat(web): add next-intl for internationalization"
```

---

## Task 3: Install UI/Theming Dependencies

**Step 1: Add next-themes for dark mode**

Run in `apps/web`:
```bash
bun add next-themes
```

**Step 2: Verify tailwindcss-animate**

Check if `tailwindcss-animate` is needed. The old project uses `@plugin "tailwindcss-animate"` but new Tailwind 4 has `tw-animate-css` already installed.

If animations don't work, install:
```bash
bun add tailwindcss-animate
```

**Step 3: Commit**

```bash
git add apps/web/package.json apps/web/bun.lockb
git commit -m "feat(web): add next-themes for dark/light mode"
```

---

## Task 4: Verify All Dependencies

**Step 1: Check package.json has all required dependencies**

Expected dependencies section should include:
```json
{
  "dependencies": {
    "@content-collections/core": "^x.x.x",
    "@content-collections/mdx": "^x.x.x",
    "@content-collections/next": "^x.x.x",
    "next-intl": "^4.x.x",
    "next-themes": "^0.4.x",
    "rehype-pretty-code": "^x.x.x",
    "rehype-autolink-headings": "^x.x.x",
    "rehype-slug": "^x.x.x",
    "remark-gfm": "^x.x.x",
    "remark-code-import": "^x.x.x",
    "unist-util-visit": "^x.x.x",
    "shiki": "^x.x.x"
  }
}
```

**Step 2: Run bun install from root**

```bash
cd D:\blog-personal-nextjs
bun install
```

**Step 3: Verify no dependency conflicts**

Expected: No errors, all packages installed successfully.

**Step 4: Final commit**

```bash
git add .
git commit -m "chore: verify all dependencies installed correctly"
```

---

## Checklist

- [ ] @content-collections/core installed
- [ ] @content-collections/mdx installed
- [ ] @content-collections/next installed
- [ ] rehype-pretty-code installed
- [ ] rehype-autolink-headings installed
- [ ] rehype-slug installed
- [ ] remark-gfm installed
- [ ] remark-code-import installed
- [ ] unist-util-visit installed
- [ ] shiki installed
- [ ] next-intl installed
- [ ] next-themes installed
- [ ] @types/mdx installed (devDependency)
- [ ] All dependencies work with bun install (no conflicts)

---

## Troubleshooting

### If peer dependency conflicts occur:
1. Check if the package supports React 19
2. Use `bun add --force` if necessary
3. Report issue in migration notes

### If TypeScript errors appear:
1. Check @types packages are installed
2. Verify tsconfig paths are correct
3. Run `bun run tsc` to identify specific errors
