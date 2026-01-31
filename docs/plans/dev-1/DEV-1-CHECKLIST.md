# DEV-1 Implementation Checklist

> **For Claude/Copilot:** Use this checklist to track progress. Mark items with `[x]` when complete.

**Project:** Blog Personal Next.js  
**Version:** 1.0  
**Start Date:** _____________  
**Last Updated:** _____________

---

## Phase 1: Foundation ⏳

### 1.1 Project Setup

**Commit:** `chore: clean up legacy content collections and install core dependencies`
- [ ] Remove Content Collections (`apps/web/content-collections.ts`)
- [ ] Remove old content folder (`apps/content/`)
- [ ] Clean up unused dependencies from package.json
- [ ] Install Supabase dependencies
  - [ ] `@supabase/ssr`
  - [ ] `@supabase/supabase-js`
- [ ] Install Drizzle ORM
  - [ ] `drizzle-orm`
  - [ ] `postgres`
  - [ ] `drizzle-kit` (dev)
- [ ] Install BlockNote editor
  - [ ] `@blocknote/core`
  - [ ] `@blocknote/react`
  - [ ] `@blocknote/shadcn`
- [ ] Install TanStack dependencies
  - [ ] `@tanstack/react-query`
  - [ ] `@tanstack/react-table`
- [ ] Install form handling
  - [ ] `react-hook-form`
  - [ ] `@hookform/resolvers`
  - [ ] `zod`
- [ ] Install state management
  - [ ] `zustand`
- [ ] Install utilities
  - [ ] `sonner`
  - [ ] `feed`
  - [ ] `react-dropzone`
  - [ ] `@dnd-kit/core`
  - [ ] `@dnd-kit/sortable`
  - [ ] `recharts`

### 1.2 Environment Configuration

**Commit:** `chore: configure environment variables for supabase and cloudinary`

- [ ] Create `.env.local` file
- [ ] Configure `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Configure `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Configure `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Configure `DATABASE_URL`
- [ ] Configure `CLOUDINARY_CLOUD_NAME`
- [ ] Configure `CLOUDINARY_API_KEY`
- [ ] Configure `CLOUDINARY_API_SECRET`
- [ ] Configure `NEXT_PUBLIC_APP_URL`

**Ref:** [02-tech-stack.md](./02-tech-stack.md)

### 1.3 Database Schema

**Commit:** `feat(db): add drizzle orm schemas for blogs, docs, and media`

- [ ] Create `src/lib/db/index.ts` (connection)
- [ ] Create `src/lib/db/schema/index.ts` (exports)
- [ ] Create `src/lib/db/schema/profiles.ts`
- [ ] Create `src/lib/db/schema/blogs.ts`
- [ ] Create `src/lib/db/schema/tags.ts`
- [ ] Create `src/lib/db/schema/docs.ts`
- [ ] Create `src/lib/db/schema/media.ts`
- [ ] Create `src/lib/db/schema/settings.ts`
- [ ] Create `drizzle.config.ts`
- [ ] Run `bunx drizzle-kit generate`
- [ ] Run `bunx drizzle-kit push`
- [ ] Verify all tables exist in Supabase

**Ref:** [03-database-schema.md](./03-database-schema.md)

### 1.4 RLS Policies

**Commit:** `feat(db): implement row level security policies for all tables`

- [ ] Create profile policies in Supabase SQL
- [ ] Create blog policies in Supabase SQL
- [ ] Create tag policies in Supabase SQL
- [ ] Create doc policies in Supabase SQL
- [ ] Create media policies in Supabase SQL
- [ ] Create settings policies in Supabase SQL
- [ ] Verify RLS is enabled on all tables

**Ref:** [03-database-schema.md#rls-policies](./03-database-schema.md)

### 1.5 Authentication Setup

**Commit:** `feat(auth): implement supabase authentication with admin middleware`

- [ ] Create `src/lib/supabase/client.ts`
- [ ] Create `src/lib/supabase/server.ts`
- [ ] Create `src/lib/supabase/middleware.ts`
- [ ] Create `src/lib/auth/get-user.ts`
- [ ] Create `src/lib/actions/auth.ts`
- [ ] Create `src/middleware.ts`
- [ ] Update `src/proxy.ts` for admin protection
- [ ] Create `src/app/(auth)/login/page.tsx`
- [ ] Create `src/components/auth/login-form.tsx`

**Ref:** [04-auth-admin.md](./04-auth-admin.md)

### ✅ Phase 1 Verification
- [ ] Database connection works (`bunx drizzle-kit studio`)
- [ ] All tables visible in Drizzle Studio
- [ ] RLS policies active (test in Supabase Dashboard)
- [ ] Login page renders at `/login`
- [ ] Can sign in with email/password
- [ ] Admin user has `role: 'admin'` in profiles
- [ ] `/admin` routes redirect to `/login` when not authenticated
- [ ] `/admin` routes accessible when authenticated as admin

---

## Phase 2: Core Features ⏳

### 2.1 Admin Layout

**Commit:** `feat(admin): create admin layout with sidebar and header navigation`
- [ ] Create `src/app/(admin)/layout.tsx`
- [ ] Create `src/components/admin/admin-sidebar.tsx`
- [ ] Create `src/components/admin/admin-header.tsx`
- [ ] Sidebar navigation items working
- [ ] User avatar/logout in header
- [ ] Active route highlighting

**Ref:** [07-feature-admin-dashboard.md](./07-feature-admin-dashboard.md)

### 2.2 Dashboard Overview

**Commit:** `feat(admin): add dashboard with stats cards and analytics charts`

- [ ] Create `src/app/(admin)/admin/page.tsx`
- [ ] Create `src/lib/db/queries/dashboard.ts`
- [ ] Create `src/components/admin/dashboard/stats-cards.tsx`
- [ ] Create `src/components/admin/dashboard/views-chart.tsx`
- [ ] Create `src/components/admin/dashboard/recent-posts.tsx`
- [ ] Create `src/components/admin/dashboard/quick-actions.tsx`
- [ ] Stats cards show correct counts
- [ ] Chart displays view data

**Ref:** [07-feature-admin-dashboard.md](./07-feature-admin-dashboard.md)

### 2.3 Blog Queries & Actions

**Commit:** `feat(blog): implement blog queries and server actions with zod validation`

- [ ] Create `src/lib/db/queries/blogs.ts`
- [ ] Create `src/lib/actions/blog.ts`
- [ ] Create `src/lib/schemas/blog.ts`
- [ ] `getBlogs()` - list with pagination
- [ ] `getBlogById()` - single blog
- [ ] `createBlog()` - server action
- [ ] `updateBlog()` - server action
- [ ] `deleteBlog()` - server action
- [ ] `publishBlog()` - server action

**Ref:** [05-feature-blog.md](./05-feature-blog.md)

### 2.4 Blog Admin UI

**Commit:** `feat(admin): add blog management table with search, filter, and pagination`

- [ ] Create `src/app/(admin)/admin/blog/page.tsx`
- [ ] Create `src/app/(admin)/admin/blog/new/page.tsx`
- [ ] Create `src/app/(admin)/admin/blog/[id]/edit/page.tsx`
- [ ] Create `src/components/admin/blog/blog-table.tsx`
- [ ] Create `src/components/admin/blog/blog-editor.tsx`
- [ ] Create `src/components/admin/blog/tag-selector.tsx`
- [ ] Table displays blogs with sorting
- [ ] Search/filter works
- [ ] Pagination works
- [ ] New blog form works
- [ ] Edit blog form works
- [ ] Delete confirmation works
- [ ] Status toggle works

**Ref:** [05-feature-blog.md](./05-feature-blog.md)

### 2.5 BlockNote Editor

**Commit:** `feat(editor): integrate blocknote rich text editor with cloudinary images`

- [ ] Create `src/components/editor/block-editor.tsx`
- [ ] Editor initializes correctly
- [ ] Content saves as JSON
- [ ] Image block works with Cloudinary
- [ ] Basic formatting works (headings, bold, etc.)
- [ ] Code blocks work
- [ ] Content loads from saved state

**Ref:** [05-feature-blog.md#blocknote-editor](./05-feature-blog.md)

### 2.6 Tag Management

**Commit:** `feat(blog): add tag management with auto-create and inline selection`

- [ ] Tags auto-create on blog save
- [ ] Tag selector shows existing tags
- [ ] Can create new tags inline
- [ ] Blog-tag relationships persist

### 2.7 Cloudinary Setup

**Commit:** `feat(media): implement cloudinary upload and transformation utilities`

- [ ] Create `src/lib/cloudinary/index.ts`
- [ ] Upload function works
- [ ] Delete function works
- [ ] Transformation URLs generate

**Ref:** [07-feature-admin-dashboard.md#media-library](./07-feature-admin-dashboard.md)

### 2.8 Media Library

**Commit:** `feat(admin): add media library with drag-drop upload and grid view`

- [ ] Create `src/lib/db/queries/media.ts`
- [ ] Create `src/lib/actions/media.ts`
- [ ] Create `src/app/(admin)/admin/media/page.tsx`
- [ ] Create `src/components/admin/media/media-grid.tsx`
- [ ] Create `src/components/admin/media/media-upload-zone.tsx`
- [ ] Create `src/components/admin/media/image-uploader.tsx`
- [ ] Drag-drop upload works
- [ ] Grid displays all media
- [ ] Delete media works
- [ ] Copy URL works
- [ ] Filter by type works

**Ref:** [07-feature-admin-dashboard.md#media-library](./07-feature-admin-dashboard.md)

### ✅ Phase 2 Verification
- [ ] Admin sidebar navigation works
- [ ] Dashboard shows stats (even if 0)
- [ ] Blog table displays data
- [ ] Can create new blog post
- [ ] Can edit existing blog post
- [ ] Can delete blog post
- [ ] BlockNote editor saves content
- [ ] Tags work correctly
- [ ] Media uploads to Cloudinary
- [ ] Media library displays files
- [ ] Can delete media files

---

## Phase 3: Documentation System ⏳

### 3.1 Topic Queries & Actions

**Commit:** `feat(docs): implement topic hierarchy queries and server actions`
- [ ] Create `src/lib/db/queries/docs.ts`
- [ ] Create `src/lib/actions/docs.ts`
- [ ] Create `src/lib/schemas/doc.ts`
- [ ] `getTopics()` - list with hierarchy
- [ ] `getTopicById()` - single topic
- [ ] `createTopic()` - server action
- [ ] `updateTopic()` - server action
- [ ] `deleteTopic()` - server action
- [ ] `reorderTopics()` - server action

**Ref:** [06-feature-docs.md](./06-feature-docs.md)

### 3.2 Topics Admin UI

**Commit:** `feat(admin): add topics tree view with drag-drop reordering`

- [ ] Create `src/app/(admin)/admin/docs/topics/page.tsx`
- [ ] Create `src/app/(admin)/admin/docs/topics/new/page.tsx`
- [ ] Create `src/app/(admin)/admin/docs/topics/[id]/edit/page.tsx`
- [ ] Create `src/components/admin/docs/topics-tree.tsx`
- [ ] Create `src/components/admin/docs/topic-form.tsx`
- [ ] Tree displays hierarchy correctly
- [ ] Can create root topic
- [ ] Can create child topic
- [ ] Drag-drop reorder works
- [ ] Edit topic works
- [ ] Delete topic works

**Ref:** [06-feature-docs.md](./06-feature-docs.md)

### 3.3 Doc Queries & Actions

**Commit:** `feat(docs): add documentation queries with topic filtering and ordering`

- [ ] `getDocs()` - list with topic filter
- [ ] `getDocById()` - single doc
- [ ] `getDocBySlug()` - public query
- [ ] `createDoc()` - server action
- [ ] `updateDoc()` - server action
- [ ] `deleteDoc()` - server action
- [ ] `reorderDocs()` - server action

### 3.4 Docs Admin UI

**Commit:** `feat(admin): add documentation management with topic assignment`

- [ ] Create `src/app/(admin)/admin/docs/page.tsx`
- [ ] Create `src/app/(admin)/admin/docs/new/page.tsx`
- [ ] Create `src/app/(admin)/admin/docs/[id]/edit/page.tsx`
- [ ] Create `src/components/admin/docs/docs-table.tsx`
- [ ] Create `src/components/admin/docs/doc-editor.tsx`
- [ ] Table displays docs
- [ ] Filter by topic works
- [ ] Create doc works
- [ ] Edit doc works
- [ ] Delete doc works
- [ ] Topic assignment works
- [ ] Order within topic works

**Ref:** [06-feature-docs.md](./06-feature-docs.md)

### ✅ Phase 3 Verification
- [ ] Topics tree displays hierarchy
- [ ] Can create parent topics
- [ ] Can create child topics
- [ ] Drag-drop reorder works
- [ ] Can create docs
- [ ] Can assign docs to topics
- [ ] Can set doc order
- [ ] Docs display in correct order

---

## Phase 4: Public Pages ⏳

### 4.1 Blog List Page

**Commit:** `feat(blog): add public blog listing with search, filters, and pagination`
- [ ] Create `src/app/(public)/[locale]/blog/page.tsx`
- [ ] Create `src/components/blog/blog-list.tsx`
- [ ] Create `src/components/blog/blog-card.tsx`
- [ ] Create `src/components/blog/blog-search.tsx`
- [ ] Create `src/components/blog/blog-filters.tsx`
- [ ] Create `src/components/blog/blog-pagination.tsx`
- [ ] List shows published posts only
- [ ] Search filters by title/content
- [ ] Date filter works
- [ ] Tag filter works
- [ ] Pagination works
- [ ] URL params persist filters

**Ref:** [05-feature-blog.md](./05-feature-blog.md)

### 4.2 Blog Detail Page

**Commit:** `feat(blog): add blog detail page with toc, reading time, and view count`

- [ ] Create `src/app/(public)/[locale]/blog/[slug]/page.tsx`
- [ ] Create `src/components/blog/blog-header.tsx`
- [ ] Create `src/components/blog/blog-content.tsx`
- [ ] Create `src/components/blog/blog-toc.tsx`
- [ ] Create `src/lib/utils/markdown.ts`
- [ ] Page renders correctly
- [ ] TOC generates from headings
- [ ] View count increments
- [ ] Reading time displays
- [ ] Tags display with links
- [ ] Share buttons work (optional)

**Ref:** [05-feature-blog.md](./05-feature-blog.md)

### 4.3 RSS Feed

**Commit:** `feat(blog): generate rss and atom feeds for published posts`

- [ ] Create `src/app/(public)/[locale]/feed/[feed]/route.ts`
- [ ] RSS XML generates
- [ ] Atom XML generates
- [ ] All published posts included

**Ref:** [05-feature-blog.md](./05-feature-blog.md)

### 4.4 Docs Layout

**Commit:** `feat(docs): add public docs layout with collapsible sidebar navigation`

- [ ] Create `src/app/(public)/[locale]/docs/layout.tsx`
- [ ] Create `src/components/docs/docs-sidebar.tsx`
- [ ] Create `src/components/docs/docs-search.tsx`
- [ ] Sidebar displays topic hierarchy
- [ ] Active doc highlighted
- [ ] Collapsible sections work
- [ ] Mobile sidebar works

**Ref:** [06-feature-docs.md](./06-feature-docs.md)

### 4.5 Docs Pages

**Commit:** `feat(docs): add documentation pages with toc, breadcrumb, and prev/next nav`

- [ ] Create `src/app/(public)/[locale]/docs/page.tsx`
- [ ] Create `src/app/(public)/[locale]/docs/[slug]/page.tsx`
- [ ] Create `src/components/docs/doc-content.tsx`
- [ ] Create `src/components/docs/doc-toc.tsx`
- [ ] Create `src/components/docs/doc-pagination.tsx`
- [ ] Create `src/components/docs/doc-breadcrumb.tsx`
- [ ] Index page lists topics
- [ ] Doc content renders
- [ ] TOC works
- [ ] Prev/Next navigation works
- [ ] Breadcrumb shows hierarchy
- [ ] 404 for non-existent docs

**Ref:** [06-feature-docs.md](./06-feature-docs.md)

### 4.6 Search API

**Commit:** `feat(api): add documentation search endpoint with snippets`

- [ ] Create `src/app/api/docs/search/route.ts`
- [ ] Search returns matching docs
- [ ] Results include snippet

### 4.7 Command Menu Search

**Commit:** `feat(ui): integrate docs search into command menu (cmd+k)`

- [ ] Update command menu for docs search
- [ ] Results link to doc pages

**Ref:** [06-feature-docs.md](./06-feature-docs.md)

### ✅ Phase 4 Verification
- [ ] `/blog` shows published posts
- [ ] Search filters work
- [ ] Date filter works
- [ ] Tag filter works
- [ ] Pagination works
- [ ] `/blog/[slug]` renders correctly
- [ ] TOC generates from content
- [ ] View count increments
- [ ] RSS feed at `/feed/rss` works
- [ ] Atom feed at `/feed/atom` works
- [ ] `/docs` layout renders
- [ ] Sidebar shows hierarchy
- [ ] Doc pages render content
- [ ] Prev/Next navigation works
- [ ] Cmd+K search finds docs

---

## Phase 5: Polish ⏳

### 5.1 SEO - Metadata

**Commit:** `feat(seo): add dynamic metadata generation for all pages`
- [ ] Update `src/app/layout.tsx` with root metadata
- [ ] Add `generateMetadata` to blog list page
- [ ] Add `generateMetadata` to blog detail page
- [ ] Add `generateMetadata` to docs layout
- [ ] Add `generateMetadata` to doc detail page

**Ref:** [08-seo-nextjs.md](./08-seo-nextjs.md)

### 5.2 SEO - OG Images

**Commit:** `feat(seo): generate dynamic open graph images with @vercel/og`

- [ ] Create `src/app/api/og/route.tsx` (default)
- [ ] Create `src/app/api/og/blog/route.tsx`
- [ ] OG images generate correctly
- [ ] Correct dimensions (1200x630)
- [ ] Dynamic content displays

**Ref:** [08-seo-nextjs.md](./08-seo-nextjs.md)

### 5.3 SEO - Sitemap & Robots

**Commit:** `feat(seo): add dynamic sitemap.xml and robots.txt generation`

- [ ] Create/Update `src/app/sitemap.ts`
- [ ] Create/Update `src/app/robots.ts`
- [ ] Sitemap includes all public pages
- [ ] Sitemap includes all blog posts
- [ ] Sitemap includes all docs
- [ ] Robots allows search engines

**Ref:** [08-seo-nextjs.md](./08-seo-nextjs.md)

### 5.4 SEO - Structured Data

**Commit:** `feat(seo): implement json-ld structured data for articles and breadcrumbs`

- [ ] Create `src/components/structured-data/website-schema.tsx`
- [ ] Create `src/components/structured-data/article-schema.tsx`
- [ ] Create `src/components/structured-data/breadcrumb-schema.tsx`
- [ ] Add WebSite schema to root layout
- [ ] Add Article schema to blog detail
- [ ] Add Breadcrumb schema to doc pages
- [ ] Validate with Google Rich Results Test

**Ref:** [08-seo-nextjs.md](./08-seo-nextjs.md)

### 5.5 Settings - Queries & Actions

**Commit:** `feat(settings): add settings queries and server actions`

- [ ] Create `src/lib/db/queries/settings.ts`
- [ ] Create `src/lib/actions/settings.ts`
- [ ] Create `src/lib/schemas/settings.ts`
- [ ] `getSettings()` - get all settings
- [ ] `updateSettings()` - server action

### 5.6 Settings - UI

**Commit:** `feat(admin): add settings pages for general, seo, and profile config`

- [ ] Create `src/app/(admin)/admin/settings/page.tsx`
- [ ] Create `src/app/(admin)/admin/settings/seo/page.tsx`
- [ ] Create `src/app/(admin)/admin/settings/profile/page.tsx`
- [ ] Create `src/components/admin/settings/general-settings-form.tsx`
- [ ] Create `src/components/admin/settings/seo-settings-form.tsx`
- [ ] Create `src/components/admin/settings/profile-form.tsx`
- [ ] General settings save
- [ ] SEO settings save
- [ ] Profile settings save

**Ref:** [07-feature-admin-dashboard.md](./07-feature-admin-dashboard.md)

### 5.7 Error Pages

**Commit:** `feat(ui): add custom error and not-found pages with error boundaries`

- [ ] Create/Update `src/app/error.tsx`
- [ ] Create/Update `src/app/not-found.tsx`
- [ ] Create `src/app/(public)/[locale]/blog/[slug]/not-found.tsx`
- [ ] Create `src/app/(public)/[locale]/docs/[slug]/not-found.tsx`
- [ ] Error page renders correctly
- [ ] 404 pages render correctly
- [ ] Error boundary catches errors

**Ref:** [09-ux-guidelines.md](./09-ux-guidelines.md)

### 5.8 Final Testing

**Commit:** `test: verify all features, accessibility, and lighthouse scores`

- [ ] All admin CRUD operations work
- [ ] All public pages render without errors
- [ ] SEO metadata correct on all pages
- [ ] OG images generate for all pages
- [ ] Mobile responsive on all pages
- [ ] Dark mode works throughout
- [ ] Keyboard navigation works
- [ ] Screen reader accessible
- [ ] Lighthouse Performance > 90
- [ ] Lighthouse Accessibility > 90
- [ ] Lighthouse Best Practices > 90
- [ ] Lighthouse SEO > 90
- [ ] No console errors in production

### ✅ Phase 5 Verification
- [ ] All metadata displays correctly
- [ ] OG images work (test with opengraph.xyz)
- [ ] `/sitemap.xml` accessible
- [ ] `/robots.txt` accessible
- [ ] Settings pages save data
- [ ] Error pages render
- [ ] 404 pages render
- [ ] Lighthouse scores all > 90

---

## Phase 6: Deployment (Cloudflare) ⏳

### 6.1 Cloudflare Setup

**Commit:** `chore(deploy): configure opennext adapter and wrangler for cloudflare`
- [ ] Install `@opennextjs/cloudflare` adapter
- [ ] Create `wrangler.jsonc` configuration
- [ ] Create `open-next.config.ts` (if needed)
- [ ] Add deploy scripts to `package.json`
- [ ] Create `public/_headers` for caching
- [ ] Add `.open-next` to `.gitignore`

### 6.2 Environment & Domain

**Commit:** `chore(deploy): configure cloudflare dns and environment variables`

- [ ] Create Cloudflare account (if not exists)
- [ ] Add domain to Cloudflare DNS
- [ ] Configure environment variables in Workers
- [ ] Set up custom domain for Workers

### 6.3 Deployment

**Commit:** `chore(deploy): deploy to cloudflare workers with custom domain`

- [ ] Run `npm run preview` locally
- [ ] Test all features work in preview
- [ ] Run `npm run deploy`
- [ ] Verify production URL works
- [ ] Configure custom domain
- [ ] Test SSL/HTTPS works

### ✅ Phase 6 Verification
- [ ] Site accessible via custom domain
- [ ] HTTPS working (auto SSL)
- [ ] All pages render correctly
- [ ] API routes work
- [ ] Image optimization works
- [ ] ISR/caching works
- [ ] Environment variables loaded

**Ref:** [02-tech-stack.md#deployment](./02-tech-stack.md)

---

## Documentation Reference

| Doc | Purpose |
|-----|---------|
| [01-architecture-overview.md](./01-architecture-overview.md) | Project structure, route groups, data flow |
| [02-tech-stack.md](./02-tech-stack.md) | Dependencies, versions, configurations, **Cloudflare deployment** |
| [03-database-schema.md](./03-database-schema.md) | Drizzle schemas, RLS policies |
| [04-auth-admin.md](./04-auth-admin.md) | Supabase Auth, middleware, protected routes |
| [05-feature-blog.md](./05-feature-blog.md) | Blog system implementation |
| [06-feature-docs.md](./06-feature-docs.md) | Documentation system implementation |
| [07-feature-admin-dashboard.md](./07-feature-admin-dashboard.md) | Admin UI, media library, settings |
| [08-seo-nextjs.md](./08-seo-nextjs.md) | SEO implementation |
| [09-ux-guidelines.md](./09-ux-guidelines.md) | Design system, accessibility |
| [10-implementation-plan.md](./10-implementation-plan.md) | Phased approach, task breakdown |

---

## Completion Summary

| Phase | Status | Tasks | Completed |
|-------|--------|-------|-----------|
| Phase 1: Foundation | ⏳ | 45 | 0 |
| Phase 2: Core Features | ⏳ | 55 | 0 |
| Phase 3: Documentation | ⏳ | 30 | 0 |
| Phase 4: Public Pages | ⏳ | 35 | 0 |
| Phase 5: Polish | ⏳ | 40 | 0 |
| Phase 6: Deployment | ⏳ | 15 | 0 |
| **Total** | | **220** | **0** |

**Legend:**
- ⏳ Not Started
- 🔄 In Progress
- ✅ Completed

---

**Notes:**
- Update this checklist as you complete tasks
- Reference specific doc files for implementation details
- Ask for clarification if any task is unclear
