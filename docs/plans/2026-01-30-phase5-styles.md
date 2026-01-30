# Phase 5: Styles Unification

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unify CSS styles while keeping the old project's UI/UX intact. Make styles Tailwind CSS 4 compatible.

**Files:**
- Modify: `apps/web/src/styles/globals.css`
- Keep: `apps/web/src/styles/mdx.css` (DO NOT MODIFY)
- Keep: `apps/web/src/styles/themes/` (DO NOT MODIFY)
- Delete: `apps/web/src/app/[lang]/globals.css` (after route consolidation)

---

## Task 1: Analyze CSS Differences

**Current Files:**

1. `src/app/[lang]/globals.css` (New Tailwind 4 default):
```css
@import "tailwindcss";
@import "tw-animate-css";
@custom-variant dark (&:is(.dark *));

:root {
  --background: oklch(1 0 0);
  /* ... oklch colors ... */
}

@theme inline {
  --color-background: var(--background);
  /* ... theme mappings ... */
}
```

2. `src/styles/globals.css` (Old project - KEEP THIS):
```css
@import "tailwindcss";
@plugin "tailwindcss-animate";
@custom-variant dark (&:is(.dark *));

:root {
  --background: hsl(0 0% 100%);
  --primary-active: hsl(161 100% 69%);  /* Extra variable */
  --card-primary: hsl(0 0% 6% / 0);      /* Extra variable */
  /* ... hsl colors ... */
}
```

**Differences:**
| Aspect | [lang]/globals.css | styles/globals.css |
|--------|-------------------|-------------------|
| Colors | oklch() | hsl() |
| Animations | tw-animate-css | tailwindcss-animate |
| Extra vars | No | --primary-active, --card-primary |
| @theme | Yes | No (needs adding) |

---

## Task 2: Update globals.css for Tailwind 4

**Step 1: Update src/styles/globals.css**

Keep all existing styles but add Tailwind 4 compatibility:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/* ============================================
   LIGHT THEME - DO NOT MODIFY COLORS
   ============================================ */
:root {
  --background: hsl(0 0% 100%);
  --foreground: hsl(240 10% 3.9%);
  --card: hsl(0 0% 100%);
  --card-primary: hsl(0 0% 6% / 0);
  --card-foreground: hsl(240 10% 3.9%);
  --popover: hsl(0 0% 100%);
  --popover-foreground: hsl(240 10% 3.9%);
  --primary: hsl(240 5.9% 10%);
  --primary-active: hsl(161 100% 69%);
  --primary-foreground: hsl(0 0% 98%);
  --secondary: hsl(240 4.8% 95.9%);
  --secondary-foreground: hsl(240 5.9% 10%);
  --muted: hsl(240 4.8% 95.9%);
  --muted-foreground: hsl(240 3.8% 46.1%);
  --accent: hsl(240 4.8% 95.9%);
  --accent-foreground: hsl(240 5.9% 10%);
  --destructive: hsl(0 72.22% 50.59%);
  --destructive-foreground: hsl(0 0% 98%);
  --border: hsl(240 5.9% 90%);
  --input: hsl(240 5.9% 90%);
  --ring: hsl(240 5% 64.9%);
  --radius: 0.5rem;
}

/* ============================================
   DARK THEME - DO NOT MODIFY COLORS
   ============================================ */
.dark {
  --background: hsl(240 10% 3.9%);
  --foreground: hsl(0 0% 98%);
  --card: hsl(240 10% 3.9%);
  --card-foreground: hsl(0 0% 98%);
  --popover: hsl(240 10% 3.9%);
  --popover-foreground: hsl(0 0% 98%);
  --primary: hsl(0 0% 98%);
  --primary-active: hsl(161 100% 69%);
  --primary-foreground: hsl(240 5.9% 10%);
  --secondary: hsl(240 3.7% 15.9%);
  --secondary-foreground: hsl(0 0% 98%);
  --muted: hsl(240 3.7% 15.9%);
  --muted-foreground: hsl(240 5% 64.9%);
  --accent: hsl(240 3.7% 15.9%);
  --accent-foreground: hsl(0 0% 98%);
  --destructive: hsl(0 62.8% 30.6%);
  --destructive-foreground: hsl(0 85.7% 97.3%);
  --border: hsl(240 3.7% 15.9%);
  --input: hsl(240 3.7% 15.9%);
  --ring: hsl(240 4.9% 83.9%);
}

/* ============================================
   TAILWIND 4 THEME MAPPING
   Required for Tailwind 4 to use CSS variables
   ============================================ */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-primary: var(--card-primary);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-active: var(--primary-active);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

/* ============================================
   BASE LAYER - DO NOT MODIFY
   ============================================ */
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

**Step 2: Commit**

```bash
git add apps/web/src/styles/globals.css
git commit -m "feat(web): update globals.css for Tailwind 4 with @theme inline"
```

---

## Task 3: Verify Font Variables

**Step 1: Check font variables in layout**

The layout should set font CSS variables:

```tsx
// In layout.tsx
const fontSans = await getSansFont();

return (
  <body className={cn(
    'bg-background min-h-screen font-sans antialiased',
    fontSans.variable
  )}>
```

**Step 2: Add font mapping to @theme if needed**

If fonts aren't working, add to globals.css:

```css
@theme inline {
  /* ... existing mappings ... */
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}
```

**Step 3: Commit**

```bash
git add apps/web/src/styles/globals.css
git commit -m "feat(web): add font variable mappings to @theme"
```

---

## Task 4: Verify Animation Plugin

**Step 1: Check if tw-animate-css provides needed animations**

The old project uses `@plugin "tailwindcss-animate"` which is now `tw-animate-css`.

Check that animations like:
- `animate-in`
- `animate-out`
- `fade-in`
- `fade-out`
- `slide-in-from-*`
- `slide-out-to-*`

...are working correctly.

**Step 2: If animations don't work**

Install tailwindcss-animate and use both:

```css
@import "tailwindcss";
@import "tw-animate-css";

/* If tw-animate-css doesn't have all animations */
@plugin "tailwindcss-animate";
```

**Step 3: Commit if changes made**

```bash
git add apps/web/src/styles/globals.css
git commit -m "fix(web): ensure animation utilities work correctly"
```

---

## Task 5: Keep MDX Styles Intact

**Step 1: DO NOT MODIFY mdx.css**

The file `src/styles/mdx.css` contains all MDX-specific styles including:
- Code block styling
- Heading anchors
- Prose typography
- Syntax highlighting

This file should remain unchanged to preserve UI/UX.

**Step 2: Verify mdx.css is imported**

Check that mdx.css is imported where needed (usually in docs layout or MDX component).

---

## Task 6: Delete Redundant CSS File

**Step 1: Delete [lang]/globals.css**

After route consolidation (Phase 3), delete:

```bash
rm apps/web/src/app/[lang]/globals.css
```

(This should already be done in Phase 3)

---

## Checklist

- [ ] globals.css has @import "tw-animate-css"
- [ ] globals.css has @custom-variant dark
- [ ] globals.css has @theme inline block
- [ ] All CSS variables mapped in @theme
- [ ] Font variables work correctly
- [ ] Animations work correctly
- [ ] mdx.css NOT modified
- [ ] themes/ folder NOT modified
- [ ] [lang]/globals.css deleted (in Phase 3)
- [ ] UI/UX looks identical to old project

---

## Critical: DO NOT MODIFY

These files contain the project's unique UI/UX and must NOT be changed:

1. `src/styles/mdx.css` - MDX styling
2. `src/styles/themes/` - Theme variations
3. `src/components/ui/` - shadcn/ui components
4. Color values in `:root` and `.dark` (only add @theme mapping)

---

## Troubleshooting

### If colors look different:
1. Check @theme inline has all color mappings
2. Verify no oklch() colors were accidentally added
3. Check dark mode selector is `.dark` not `:is(.dark *)`

### If fonts don't load:
1. Check font CSS variables in layout
2. Verify @theme has font mappings
3. Check getSansFont() returns correct variable

### If animations don't work:
1. Check tw-animate-css is imported
2. Try adding tailwindcss-animate as fallback
3. Verify animation classes exist in Tailwind config
