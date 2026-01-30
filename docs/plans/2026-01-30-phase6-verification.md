# Phase 6: Verification & Testing

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Verify all pages and features work correctly after migration.

---

## Task 1: Build Verification

**Step 1: Run TypeScript check**

```bash
cd apps/web
bun run tsc
```

Expected: No TypeScript errors (or only minor ones)

**Step 2: Run build**

```bash
bun run build
```

Expected: Build completes successfully

**Step 3: Fix any build errors**

Common issues:
- Missing imports from content-collections
- Type mismatches from contentlayer migration
- Missing dependencies

**Step 4: Commit fixes**

```bash
git add .
git commit -m "fix(web): resolve build errors"
```

---

## Task 2: Start Development Server

**Step 1: Start dev server**

```bash
cd apps/web
bun run dev
```

**Step 2: Check server starts without errors**

Expected: Server starts on http://localhost:3000

**Step 3: Check console for warnings**

Note any:
- Hydration warnings
- next-intl warnings
- Content-collections warnings

---

## Task 3: Test Landing Page

**Step 1: Visit http://localhost:3000/vi**

Verify:
- [ ] Page loads without errors
- [ ] Header displays correctly
- [ ] Footer displays correctly
- [ ] Vortex animation works (if present)
- [ ] Theme toggle (dark/light) works
- [ ] Language toggle works
- [ ] All links are clickable

**Step 2: Check browser console**

Verify:
- [ ] No JavaScript errors
- [ ] No hydration warnings
- [ ] No 404 for assets

**Step 3: Take screenshots for comparison**

Compare with original design if available.

---

## Task 4: Test Docs Pages

**Step 1: Visit http://localhost:3000/vi/docs**

Verify:
- [ ] Docs index page loads
- [ ] Sidebar navigation displays
- [ ] Table of contents displays
- [ ] MDX content renders correctly

**Step 2: Test a docs page with code**

Visit http://localhost:3000/vi/docs/mdx/code

Verify:
- [ ] Code blocks render with syntax highlighting
- [ ] Copy button works (if present)
- [ ] Code line highlighting works

**Step 3: Test sidebar navigation**

Verify:
- [ ] All sidebar items are clickable
- [ ] Active state shows correctly
- [ ] Nested items expand/collapse

**Step 4: Test docs pager**

Verify:
- [ ] Previous/Next links work
- [ ] Links go to correct pages

---

## Task 5: Test Blog Pages

**Step 1: Visit http://localhost:3000/vi/blog**

Verify:
- [ ] Blog index page loads
- [ ] Blog post cards display
- [ ] Pagination works (if present)
- [ ] Author info displays

**Step 2: Test a blog post**

Visit a specific blog post (e.g., /vi/blog/gioi-thieu-blog)

Verify:
- [ ] Post title displays
- [ ] Post date displays
- [ ] Author info displays
- [ ] Tags display
- [ ] Read time displays
- [ ] MDX content renders correctly

**Step 3: Test blog OG image**

Visit http://localhost:3000/vi/blog/og/gioi-thieu-blog

Verify:
- [ ] OG image generates correctly
- [ ] No server errors

---

## Task 6: Test RSS Feeds

**Step 1: Test XML feed**

Visit http://localhost:3000/vi/feed/blog.xml

Verify:
- [ ] Valid XML response
- [ ] Blog posts included
- [ ] Correct URLs

**Step 2: Test JSON feed**

Visit http://localhost:3000/vi/feed/blog.json

Verify:
- [ ] Valid JSON response
- [ ] Blog posts included

---

## Task 7: Test Search/Command Menu

**Step 1: Open command menu**

Press Ctrl/Cmd + K

Verify:
- [ ] Command menu opens
- [ ] Docs are searchable
- [ ] Blog posts are searchable
- [ ] Navigation works

---

## Task 8: Test Responsive Design

**Step 1: Test mobile view**

Use browser dev tools to test 375px width

Verify:
- [ ] Mobile navigation works
- [ ] Content is readable
- [ ] No horizontal scroll
- [ ] Touch interactions work

**Step 2: Test tablet view**

Use browser dev tools to test 768px width

Verify:
- [ ] Layout adapts correctly
- [ ] Sidebar behavior is correct

---

## Task 9: Test Theme Switching

**Step 1: Test light mode**

Click theme toggle to light mode

Verify:
- [ ] All colors change correctly
- [ ] Code blocks have light theme
- [ ] No flash on refresh

**Step 2: Test dark mode**

Click theme toggle to dark mode

Verify:
- [ ] All colors change correctly
- [ ] Code blocks have dark theme
- [ ] Persists on refresh

**Step 3: Test system preference**

Set theme to "system" and toggle OS dark mode

Verify:
- [ ] Theme changes with OS setting

---

## Task 10: Final Verification

**Step 1: Run production build**

```bash
cd apps/web
bun run build
bun run start
```

**Step 2: Test all pages in production mode**

Repeat critical tests:
- [ ] Landing page loads
- [ ] Docs pages load
- [ ] Blog pages load
- [ ] RSS feeds work
- [ ] Theme toggle works

**Step 3: Check for console errors**

Verify no errors in production mode.

**Step 4: Final commit**

```bash
git add .
git commit -m "feat(web): migration complete - all pages verified"
```

---

## Checklist Summary

### Build & Server
- [ ] TypeScript check passes
- [ ] Build completes successfully
- [ ] Dev server starts without errors
- [ ] Production build works

### Landing Page
- [ ] Renders correctly
- [ ] Header/Footer work
- [ ] Theme toggle works
- [ ] Language toggle works

### Docs
- [ ] Index page works
- [ ] Individual docs render
- [ ] Sidebar navigation works
- [ ] Code highlighting works
- [ ] Pager works

### Blog
- [ ] Index page works
- [ ] Individual posts render
- [ ] Author info works
- [ ] Tags work
- [ ] OG images generate

### RSS
- [ ] XML feed works
- [ ] JSON feed works

### UI/UX
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Theme switching works
- [ ] Animations work
- [ ] No hydration errors

---

## Troubleshooting

### If pages 404:
1. Check middleware is routing correctly
2. Verify generateStaticParams returns locales
3. Check content-collections generates content

### If content doesn't render:
1. Check content-collections built correctly
2. Verify MDXContent component is used
3. Check mdx field exists on documents

### If styles look wrong:
1. Check globals.css is imported
2. Verify @theme inline has all variables
3. Check no CSS was accidentally modified

### If hydration errors:
1. Add suppressHydrationWarning to html
2. Check server/client content matches
3. Verify next-intl is configured correctly
