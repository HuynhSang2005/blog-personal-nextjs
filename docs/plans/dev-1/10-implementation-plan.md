# Implementation Plan - Blog Personal Next.js

> **For Claude/Copilot:** Follow this phased approach. Complete each phase before moving to the next.

**Goal:** Systematic implementation with clear milestones and verification steps.

**Last Updated:** 2026-01-30

---

## 1. Implementation Overview

### 1.1 Phase Summary
```
┌─────────────────────────────────────────────────────────────┐
│                   IMPLEMENTATION PHASES                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PHASE 1: Foundation (Days 1-3)                             │
│  ├─ Project setup & dependencies                            │
│  ├─ Database schema & migrations                            │
│  └─ Authentication setup                                    │
│                                                              │
│  PHASE 2: Core Features (Days 4-8)                          │
│  ├─ Admin dashboard shell                                   │
│  ├─ Blog CRUD with BlockNote                                │
│  └─ Media library                                           │
│                                                              │
│  PHASE 3: Documentation (Days 9-11)                         │
│  ├─ Topics hierarchy                                        │
│  ├─ Doc CRUD                                                │
│  └─ Sidebar navigation                                      │
│                                                              │
│  PHASE 4: Public Pages (Days 12-15)                         │
│  ├─ Blog list & detail pages                                │
│  ├─ Docs layout & pages                                     │
│  └─ Search functionality                                    │
│                                                              │
│  PHASE 5: Polish (Days 16-18)                               │
│  ├─ SEO implementation                                      │
│  ├─ Settings pages                                          │
│  └─ Final testing & fixes                                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Prerequisites Checklist
- [ ] Supabase project created
- [ ] Cloudinary account set up
- [ ] Environment variables configured
- [ ] Git repository initialized
- [ ] Bun.js installed (v1.2+)

---

## 2. Phase 1: Foundation

### 2.1 Project Setup Tasks

#### Task 1.1: Clean existing codebase
```bash
# Remove Content Collections and MDX-related files
rm -rf apps/web/content-collections.ts
rm -rf apps/content/

# Remove old route patterns
# Keep only essential files
```

#### Task 1.2: Install dependencies
```bash
cd apps/web

# Core dependencies
bun add @supabase/ssr @supabase/supabase-js
bun add drizzle-orm postgres
bun add @blocknote/core @blocknote/react @blocknote/shadcn
bun add @tanstack/react-query @tanstack/react-table
bun add zustand
bun add zod @hookform/resolvers
bun add react-hook-form
bun add @radix-ui/react-slot # If not installed
bun add sonner # Toast notifications
bun add feed # RSS generation
bun add react-dropzone # Media upload
bun add @dnd-kit/core @dnd-kit/sortable # Drag and drop
bun add recharts # Charts

# Dev dependencies
bun add -D drizzle-kit @types/node
```

#### Task 1.3: Configure environment
```env
# apps/web/.env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Database (Supabase connection string)
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2.2 Database Setup Tasks

#### Task 1.4: Create Drizzle schema
**Files to create:**
- `apps/web/src/lib/db/index.ts` - Database connection
- `apps/web/src/lib/db/schema/index.ts` - Schema exports
- `apps/web/src/lib/db/schema/profiles.ts`
- `apps/web/src/lib/db/schema/blogs.ts`
- `apps/web/src/lib/db/schema/tags.ts`
- `apps/web/src/lib/db/schema/docs.ts`
- `apps/web/src/lib/db/schema/media.ts`
- `apps/web/src/lib/db/schema/settings.ts`

**Reference:** [03-database-schema.md](./03-database-schema.md)

#### Task 1.5: Run migrations
```bash
cd apps/web

# Generate migrations
bunx drizzle-kit generate

# Push to database (or use migrate in production)
bunx drizzle-kit push
```

#### Task 1.6: Create RLS policies
**Run in Supabase SQL Editor:**
- Profile policies
- Blog policies  
- Doc policies
- Media policies
- Settings policies

**Reference:** [03-database-schema.md#rls-policies](./03-database-schema.md)

### 2.3 Authentication Tasks

#### Task 1.7: Create Supabase clients
**Files to create:**
- `apps/web/src/lib/supabase/client.ts` - Browser client
- `apps/web/src/lib/supabase/server.ts` - Server client
- `apps/web/src/lib/supabase/middleware.ts` - Middleware client

**Reference:** [04-auth-admin.md](./04-auth-admin.md)

#### Task 1.8: Create auth utilities
**Files to create:**
- `apps/web/src/lib/auth/get-user.ts` - Get current user
- `apps/web/src/lib/actions/auth.ts` - Auth actions

#### Task 1.9: Create middleware
**Files to create:**
- `apps/web/src/middleware.ts` - Route protection
- `apps/web/src/proxy.ts` - Admin protection logic

#### Task 1.10: Create login page
**Files to create:**
- `apps/web/src/app/(auth)/login/page.tsx`
- `apps/web/src/components/auth/login-form.tsx`

### 2.4 Phase 1 Verification
- [ ] Can connect to Supabase database
- [ ] All tables created in database
- [ ] RLS policies active
- [ ] Login page renders
- [ ] Can log in with admin account
- [ ] Protected routes redirect to login
- [ ] Logged-in user can access /admin

---

## 3. Phase 2: Core Features

### 3.1 Admin Dashboard Shell

#### Task 2.1: Create admin layout
**Files to create:**
- `apps/web/src/app/(admin)/layout.tsx`
- `apps/web/src/components/admin/admin-sidebar.tsx`
- `apps/web/src/components/admin/admin-header.tsx`

**Reference:** [07-feature-admin-dashboard.md](./07-feature-admin-dashboard.md)

#### Task 2.2: Create dashboard overview
**Files to create:**
- `apps/web/src/app/(admin)/admin/page.tsx`
- `apps/web/src/components/admin/dashboard/stats-cards.tsx`
- `apps/web/src/components/admin/dashboard/views-chart.tsx`
- `apps/web/src/components/admin/dashboard/recent-posts.tsx`
- `apps/web/src/components/admin/dashboard/quick-actions.tsx`
- `apps/web/src/lib/db/queries/dashboard.ts`

### 3.2 Blog System

#### Task 2.3: Create blog queries
**Files to create:**
- `apps/web/src/lib/db/queries/blogs.ts`
- `apps/web/src/lib/actions/blog.ts`
- `apps/web/src/lib/schemas/blog.ts`

**Reference:** [05-feature-blog.md](./05-feature-blog.md)

#### Task 2.4: Create blog admin pages
**Files to create:**
- `apps/web/src/app/(admin)/admin/blog/page.tsx`
- `apps/web/src/app/(admin)/admin/blog/new/page.tsx`
- `apps/web/src/app/(admin)/admin/blog/[id]/edit/page.tsx`
- `apps/web/src/components/admin/blog/blog-table.tsx`
- `apps/web/src/components/admin/blog/blog-editor.tsx`
- `apps/web/src/components/admin/blog/tag-selector.tsx`

#### Task 2.5: Create BlockNote editor
**Files to create:**
- `apps/web/src/components/editor/block-editor.tsx`
- `apps/web/src/components/editor/extensions/` (if custom)

### 3.3 Media Library

#### Task 2.6: Set up Cloudinary
**Files to create:**
- `apps/web/src/lib/cloudinary/index.ts`
- `apps/web/src/lib/db/queries/media.ts`
- `apps/web/src/lib/actions/media.ts`

#### Task 2.7: Create media UI
**Files to create:**
- `apps/web/src/app/(admin)/admin/media/page.tsx`
- `apps/web/src/components/admin/media/media-grid.tsx`
- `apps/web/src/components/admin/media/media-upload-zone.tsx`
- `apps/web/src/components/admin/media/image-uploader.tsx`

**Reference:** [07-feature-admin-dashboard.md#media-library](./07-feature-admin-dashboard.md)

### 3.4 Phase 2 Verification
- [ ] Admin sidebar navigation works
- [ ] Dashboard shows stats (can be 0)
- [ ] Can create/edit/delete blog posts
- [ ] BlockNote editor saves content
- [ ] Tags can be created and assigned
- [ ] Media uploads to Cloudinary
- [ ] Media library shows all uploaded files
- [ ] Can delete media

---

## 4. Phase 3: Documentation System

### 4.1 Topics Management

#### Task 3.1: Create topic queries
**Files to create:**
- `apps/web/src/lib/db/queries/docs.ts`
- `apps/web/src/lib/actions/docs.ts`
- `apps/web/src/lib/schemas/doc.ts`

**Reference:** [06-feature-docs.md](./06-feature-docs.md)

#### Task 3.2: Create topics admin
**Files to create:**
- `apps/web/src/app/(admin)/admin/docs/topics/page.tsx`
- `apps/web/src/app/(admin)/admin/docs/topics/new/page.tsx`
- `apps/web/src/app/(admin)/admin/docs/topics/[id]/edit/page.tsx`
- `apps/web/src/components/admin/docs/topics-tree.tsx`
- `apps/web/src/components/admin/docs/topic-form.tsx`

### 4.2 Docs Management

#### Task 3.3: Create docs admin
**Files to create:**
- `apps/web/src/app/(admin)/admin/docs/page.tsx`
- `apps/web/src/app/(admin)/admin/docs/new/page.tsx`
- `apps/web/src/app/(admin)/admin/docs/[id]/edit/page.tsx`
- `apps/web/src/components/admin/docs/docs-table.tsx`
- `apps/web/src/components/admin/docs/doc-editor.tsx`

### 4.3 Phase 3 Verification
- [ ] Can create parent topics
- [ ] Can create child topics
- [ ] Can drag to reorder topics
- [ ] Can create docs assigned to topics
- [ ] Can set doc order within topic
- [ ] Docs appear in correct hierarchy

---

## 5. Phase 4: Public Pages

### 5.1 Blog Public Pages

#### Task 4.1: Create blog list page
**Files to create:**
- `apps/web/src/app/(public)/[locale]/blog/page.tsx`
- `apps/web/src/components/blog/blog-list.tsx`
- `apps/web/src/components/blog/blog-card.tsx`
- `apps/web/src/components/blog/blog-search.tsx`
- `apps/web/src/components/blog/blog-filters.tsx`
- `apps/web/src/components/blog/blog-pagination.tsx`

**Reference:** [05-feature-blog.md](./05-feature-blog.md)

#### Task 4.2: Create blog detail page
**Files to create:**
- `apps/web/src/app/(public)/[locale]/blog/[slug]/page.tsx`
- `apps/web/src/components/blog/blog-header.tsx`
- `apps/web/src/components/blog/blog-content.tsx`
- `apps/web/src/components/blog/blog-toc.tsx`
- `apps/web/src/lib/utils/markdown.ts` (markdown processing)

#### Task 4.3: Create RSS feed
**Files to create:**
- `apps/web/src/app/(public)/[locale]/feed/[feed]/route.ts`

### 5.2 Documentation Public Pages

#### Task 4.4: Create docs layout
**Files to create:**
- `apps/web/src/app/(public)/[locale]/docs/layout.tsx`
- `apps/web/src/components/docs/docs-sidebar.tsx`
- `apps/web/src/components/docs/docs-search.tsx`

#### Task 4.5: Create doc page
**Files to create:**
- `apps/web/src/app/(public)/[locale]/docs/page.tsx` (index)
- `apps/web/src/app/(public)/[locale]/docs/[slug]/page.tsx`
- `apps/web/src/components/docs/doc-content.tsx`
- `apps/web/src/components/docs/doc-toc.tsx`
- `apps/web/src/components/docs/doc-pagination.tsx`
- `apps/web/src/components/docs/doc-breadcrumb.tsx`

### 5.3 Search API

#### Task 4.6: Create search endpoint
**Files to create:**
- `apps/web/src/app/api/docs/search/route.ts`

### 5.4 Phase 4 Verification
- [ ] Blog list page shows published posts
- [ ] Search filters blog posts
- [ ] Date filters work
- [ ] Pagination works
- [ ] Blog detail page renders markdown
- [ ] TOC generates from headings
- [ ] View count increments
- [ ] Docs sidebar shows hierarchy
- [ ] Docs pages render correctly
- [ ] Prev/Next navigation works
- [ ] Search (cmd+k) finds docs
- [ ] RSS feed generates

---

## 6. Phase 5: Polish

### 6.1 SEO Implementation

#### Task 5.1: Root metadata
**Files to update:**
- `apps/web/src/app/layout.tsx`

#### Task 5.2: Page-specific metadata
**Files to update:**
- All page.tsx files with `generateMetadata`

#### Task 5.3: Dynamic OG images
**Files to create:**
- `apps/web/src/app/api/og/route.tsx`
- `apps/web/src/app/api/og/blog/route.tsx`

#### Task 5.4: Sitemap & robots
**Files to create:**
- `apps/web/src/app/sitemap.ts`
- `apps/web/src/app/robots.ts`

#### Task 5.5: Structured data
**Files to create:**
- `apps/web/src/components/structured-data/website-schema.tsx`
- `apps/web/src/components/structured-data/article-schema.tsx`
- `apps/web/src/components/structured-data/breadcrumb-schema.tsx`

**Reference:** [08-seo-nextjs.md](./08-seo-nextjs.md)

### 6.2 Settings Pages

#### Task 5.6: Settings queries and actions
**Files to create:**
- `apps/web/src/lib/db/queries/settings.ts`
- `apps/web/src/lib/actions/settings.ts`
- `apps/web/src/lib/schemas/settings.ts`

#### Task 5.7: Settings UI
**Files to create:**
- `apps/web/src/app/(admin)/admin/settings/page.tsx`
- `apps/web/src/app/(admin)/admin/settings/seo/page.tsx`
- `apps/web/src/app/(admin)/admin/settings/profile/page.tsx`
- `apps/web/src/components/admin/settings/general-settings-form.tsx`
- `apps/web/src/components/admin/settings/seo-settings-form.tsx`
- `apps/web/src/components/admin/settings/profile-form.tsx`

### 6.3 Error Pages

#### Task 5.8: Error handling
**Files to create:**
- `apps/web/src/app/error.tsx`
- `apps/web/src/app/not-found.tsx`
- `apps/web/src/app/(public)/[locale]/blog/[slug]/not-found.tsx`
- `apps/web/src/app/(public)/[locale]/docs/[slug]/not-found.tsx`

### 6.4 Final Testing

#### Task 5.9: Testing checklist
- [ ] All admin CRUD operations work
- [ ] All public pages render
- [ ] SEO metadata correct
- [ ] OG images generate
- [ ] Mobile responsive
- [ ] Dark mode works
- [ ] Accessibility (keyboard nav, screen reader)
- [ ] Performance (Lighthouse > 90)
- [ ] No console errors

### 6.5 Phase 5 Verification
- [ ] SEO metadata on all pages
- [ ] OG images generate correctly
- [ ] Sitemap.xml accessible
- [ ] Robots.txt accessible
- [ ] Settings save and persist
- [ ] Error pages render
- [ ] 404 pages render
- [ ] Lighthouse score > 90

---

## 7. File Structure After Implementation

```
apps/web/src/
├── app/
│   ├── (admin)/
│   │   ├── layout.tsx
│   │   └── admin/
│   │       ├── page.tsx
│   │       ├── blog/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   └── [id]/edit/page.tsx
│   │       ├── docs/
│   │       │   ├── page.tsx
│   │       │   ├── new/page.tsx
│   │       │   ├── [id]/edit/page.tsx
│   │       │   └── topics/
│   │       │       ├── page.tsx
│   │       │       ├── new/page.tsx
│   │       │       └── [id]/edit/page.tsx
│   │       ├── media/
│   │       │   └── page.tsx
│   │       └── settings/
│   │           ├── page.tsx
│   │           ├── seo/page.tsx
│   │           └── profile/page.tsx
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (public)/
│   │   └── [locale]/
│   │       ├── layout.tsx
│   │       ├── page.tsx
│   │       ├── blog/
│   │       │   ├── page.tsx
│   │       │   └── [slug]/page.tsx
│   │       ├── docs/
│   │       │   ├── layout.tsx
│   │       │   ├── page.tsx
│   │       │   └── [slug]/page.tsx
│   │       └── feed/
│   │           └── [feed]/route.ts
│   ├── api/
│   │   ├── og/
│   │   │   ├── route.tsx
│   │   │   └── blog/route.tsx
│   │   ├── docs/
│   │   │   └── search/route.ts
│   │   └── admin/
│   │       └── stats/
│   │           └── views/route.ts
│   ├── layout.tsx
│   ├── error.tsx
│   ├── not-found.tsx
│   ├── sitemap.ts
│   ├── robots.ts
│   └── manifest.ts
├── components/
│   ├── admin/
│   │   ├── admin-sidebar.tsx
│   │   ├── admin-header.tsx
│   │   ├── blog/
│   │   │   ├── blog-table.tsx
│   │   │   ├── blog-editor.tsx
│   │   │   └── tag-selector.tsx
│   │   ├── docs/
│   │   │   ├── docs-table.tsx
│   │   │   ├── doc-editor.tsx
│   │   │   ├── topics-tree.tsx
│   │   │   └── topic-form.tsx
│   │   ├── media/
│   │   │   ├── media-grid.tsx
│   │   │   ├── media-upload-zone.tsx
│   │   │   └── image-uploader.tsx
│   │   ├── dashboard/
│   │   │   ├── stats-cards.tsx
│   │   │   ├── views-chart.tsx
│   │   │   ├── recent-posts.tsx
│   │   │   └── quick-actions.tsx
│   │   └── settings/
│   │       ├── general-settings-form.tsx
│   │       ├── seo-settings-form.tsx
│   │       └── profile-form.tsx
│   ├── auth/
│   │   └── login-form.tsx
│   ├── blog/
│   │   ├── blog-list.tsx
│   │   ├── blog-card.tsx
│   │   ├── blog-search.tsx
│   │   ├── blog-filters.tsx
│   │   ├── blog-pagination.tsx
│   │   ├── blog-header.tsx
│   │   ├── blog-content.tsx
│   │   └── blog-toc.tsx
│   ├── docs/
│   │   ├── docs-sidebar.tsx
│   │   ├── docs-search.tsx
│   │   ├── doc-content.tsx
│   │   ├── doc-toc.tsx
│   │   ├── doc-pagination.tsx
│   │   └── doc-breadcrumb.tsx
│   ├── editor/
│   │   └── block-editor.tsx
│   ├── structured-data/
│   │   ├── website-schema.tsx
│   │   ├── article-schema.tsx
│   │   └── breadcrumb-schema.tsx
│   ├── ui/
│   │   └── ... (shadcn components)
│   ├── theme-provider.tsx
│   └── theme-mode-toggle.tsx
├── lib/
│   ├── db/
│   │   ├── index.ts
│   │   ├── schema/
│   │   │   ├── index.ts
│   │   │   ├── profiles.ts
│   │   │   ├── blogs.ts
│   │   │   ├── tags.ts
│   │   │   ├── docs.ts
│   │   │   ├── media.ts
│   │   │   └── settings.ts
│   │   └── queries/
│   │       ├── blogs.ts
│   │       ├── docs.ts
│   │       ├── media.ts
│   │       ├── settings.ts
│   │       └── dashboard.ts
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── auth/
│   │   └── get-user.ts
│   ├── actions/
│   │   ├── auth.ts
│   │   ├── blog.ts
│   │   ├── docs.ts
│   │   ├── media.ts
│   │   └── settings.ts
│   ├── schemas/
│   │   ├── blog.ts
│   │   ├── doc.ts
│   │   └── settings.ts
│   ├── cloudinary/
│   │   └── index.ts
│   ├── utils/
│   │   ├── date.ts
│   │   ├── format.ts
│   │   ├── markdown.ts
│   │   └── read-time.ts
│   └── hooks/
│       └── use-debounce.ts
├── middleware.ts
├── proxy.ts
└── styles/
    └── globals.css
```

---

## Next Steps

See [DEV-1-CHECKLIST.md](./DEV-1-CHECKLIST.md) for the master tracking checklist.
