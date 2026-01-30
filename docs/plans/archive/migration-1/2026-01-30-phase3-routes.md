# Phase 3: Route Consolidation

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Consolidate `[lang]` and `[locale]` route patterns into a unified `[locale]` structure.

**Files:**
- Delete: `apps/web/src/app/[lang]/` folder
- Keep: `apps/web/src/app/[locale]/` folder (main routes)
- Modify: `apps/web/src/app/[locale]/layout.tsx`

---

## Task 1: Analyze Route Differences

**Current Structure:**

```
src/app/
├── [lang]/                    ← NEW (minimal, to delete)
│   ├── globals.css           ← Different CSS (oklch colors)
│   ├── layout.tsx            ← Basic layout, QueryProvider only
│   ├── page.tsx              ← Placeholder
│   └── demo/page.tsx         ← Demo page
│
├── [locale]/                  ← OLD (full features, to keep)
│   ├── layout.tsx            ← Full layout with Header/Footer/Theme
│   ├── page.tsx              ← Landing page
│   ├── template.tsx          ← Animation template
│   ├── blog/                 ← Blog routes
│   │   ├── layout.tsx
│   │   ├── template.tsx
│   │   ├── og/[slug]/route.tsx
│   │   └── [[...slug]]/page.tsx
│   ├── docs/                 ← Docs routes
│   │   ├── layout.tsx
│   │   ├── template.tsx
│   │   └── [[...slug]]/page.tsx
│   └── feed/[feed]/route.ts  ← RSS feeds
```

**Target Structure:**

```
src/app/
├── [locale]/                  ← UNIFIED
│   ├── globals.css           ← From [lang] (Tailwind 4 compatible)
│   ├── layout.tsx            ← Enhanced with QueryProvider
│   ├── page.tsx              ← Landing page
│   ├── template.tsx
│   ├── blog/
│   ├── docs/
│   ├── demo/                 ← Move from [lang]
│   └── feed/
```

---

## Task 2: Backup and Merge CSS

**Step 1: Compare globals.css files**

`[lang]/globals.css` (new Tailwind 4):
- Uses `@import "tailwindcss"`
- Uses `@import "tw-animate-css"`
- Uses `@custom-variant dark`
- Uses `@theme inline` for colors
- Uses oklch() color format

`[locale]/` imports `@/styles/globals.css`:
- Uses `@import "tailwindcss"`
- Uses `@plugin "tailwindcss-animate"`
- Uses hsl() color format
- Has additional variables (--primary-active, --card-primary)

**Step 2: Decision**

Keep `@/styles/globals.css` as it has the complete theme from the old project.
The `[lang]/globals.css` is just the default shadcn setup.

**Step 3: Ensure globals.css is Tailwind 4 compatible**

Update `src/styles/globals.css` if needed:

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

:root {
  /* Keep existing hsl colors */
  --background: hsl(0 0% 100%);
  /* ... rest of variables ... */
}

/* Add @theme inline block for Tailwind 4 */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... map all variables ... */
}
```

**Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "feat(web): update globals.css for Tailwind 4 compatibility"
```

---

## Task 3: Move Demo Page

**Step 1: Move demo page to [locale]**

```bash
# Create demo folder in [locale]
mkdir -p src/app/[locale]/demo

# Move demo page
mv src/app/[lang]/demo/page.tsx src/app/[locale]/demo/page.tsx
```

**Step 2: Update demo page if needed**

Check if demo page has any [lang]-specific code and update to use `locale`.

**Step 3: Commit**

```bash
git add src/app/[locale]/demo/
git commit -m "feat(web): move demo page to [locale] route"
```

---

## Task 4: Update [locale] Layout

**Step 1: Update layout.tsx to include QueryProvider**

Modify `src/app/[locale]/layout.tsx`:

```typescript
import { setRequestLocale } from 'next-intl/server'
import { NextIntlClientProvider } from 'next-intl'
import type { Metadata, Viewport } from 'next'

import '@/styles/globals.css'

import { getObjectValueByLocale } from '@/lib/core/utils/locale'
import type { LocaleOptions } from '@/lib/core/types/i18n'
import { ThemeProvider } from '@/components/theme-provider'
import { QueryProvider } from '@/lib/providers/query-provider'  // ADD THIS
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { defaultLocale } from '@/config/i18n'
import { siteConfig } from '@/config/site'
import { getSansFont } from '@/lib/fonts'
import { cn } from '@/lib/utils'

// ... generateMetadata unchanged ...

export default async function RootLayout(props: {
  params: Promise<{ locale: string }>
  children: React.ReactNode
}) {
  const params = await props.params
  const locale = (params.locale as LocaleOptions) || defaultLocale
  const { children } = props

  setRequestLocale(locale)

  const fontSans = await getSansFont()
  
  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta content="#181423" name="theme-color" />
      </head>

      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          fontSans.variable
        )}
      >
        <QueryProvider>  {/* ADD QueryProvider wrapper */}
          <NextIntlClientProvider
            locale={params.locale || defaultLocale}
            messages={{}}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="dark"
              disableTransitionOnChange
              enableSystem
            >
              <div>
                <div className="relative z-10 flex min-h-screen flex-col">
                  <SiteHeader />
                  <main className="flex-1">{children}</main>
                  <SiteFooter />
                </div>

                <div className="fixed left-0 top-0 size-full bg-gradient-to-b from-[#a277ff] via-transparent to-transparent opacity-10" />
              </div>
            </ThemeProvider>
          </NextIntlClientProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
```

**Step 2: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat(web): add QueryProvider to [locale] layout"
```

---

## Task 5: Delete [lang] Folder

**Step 1: Verify all content is migrated**

Checklist before deletion:
- [ ] Demo page moved to [locale]
- [ ] globals.css not needed (using @/styles/globals.css)
- [ ] layout.tsx features merged into [locale]/layout.tsx

**Step 2: Delete [lang] folder**

```bash
rm -rf src/app/[lang]
```

**Step 3: Commit**

```bash
git add -A
git commit -m "chore(web): remove redundant [lang] route folder"
```

---

## Task 6: Update generateStaticParams

**Step 1: Check all pages have generateStaticParams**

Each page with `[locale]` needs:

```typescript
import { locales } from '@/config/i18n'

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
```

**Step 2: Update pages if missing**

Files to check:
- `src/app/[locale]/page.tsx`
- `src/app/[locale]/blog/[[...slug]]/page.tsx`
- `src/app/[locale]/docs/[[...slug]]/page.tsx`
- `src/app/[locale]/demo/page.tsx`

**Step 3: Commit**

```bash
git add src/app/[locale]/
git commit -m "feat(web): ensure generateStaticParams on all [locale] pages"
```

---

## Checklist

- [ ] CSS differences analyzed
- [ ] src/styles/globals.css updated for Tailwind 4
- [ ] Demo page moved to [locale]
- [ ] [locale]/layout.tsx has QueryProvider
- [ ] [lang] folder deleted
- [ ] generateStaticParams added to all pages
- [ ] No dead imports or references to [lang]
- [ ] All routes work correctly

---

## Troubleshooting

### If styles break after deletion:
1. Check CSS import path is correct (`@/styles/globals.css`)
2. Verify Tailwind 4 @theme inline block is present
3. Check no CSS variables are missing

### If routes 404:
1. Verify middleware is redirecting correctly
2. Check generateStaticParams returns correct locales
3. Ensure locale param is being read correctly
