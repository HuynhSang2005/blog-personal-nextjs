# Architecture Overview - Blog Personal Next.js

> **For Claude/Copilot:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this architecture.

**Goal:** Establish a clean, scalable, and maintainable architecture for a personal blog/docs platform with Next.js 16, Turborepo, and Supabase.

**Last Updated:** 2026-01-30

---

## 1. Project Scope & Size

### 1.1 Project Type
- **Type:** Personal Blog & Documentation Platform
- **Scale:** Small-Medium (single admin, public readers)
- **Complexity:** Medium (CRUD operations, auth, media management, markdown rendering)

### 1.2 Core Features
| Feature | Description | Priority |
|---------|-------------|----------|
| Blog System | CRUD blog posts with rich editor, markdown, media | High |
| Docs System | Hierarchical documentation with parent/child topics | High |
| Admin Dashboard | Dashboard, analytics, content management | High |
| Auth | Single admin role using Supabase Auth | High |
| Media Management | Image/video upload via Cloudinary | Medium |
| SEO | Dynamic metadata, sitemap, OG images | High |
| i18n | Multi-language support (Vietnamese primary) | Medium |

---

## 2. Monorepo Architecture (Turborepo)

### 2.1 Recommended Structure
```
blog-personal-nextjs/
├── apps/
│   ├── web/                     # Main Next.js 16 application
│   │   ├── src/
│   │   │   ├── app/             # Next.js App Router
│   │   │   │   ├── (public)/    # Public routes (blog, docs, home)
│   │   │   │   │   ├── [locale]/
│   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   ├── blog/
│   │   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   │   │   └── docs/
│   │   │   │   │   │       ├── page.tsx
│   │   │   │   │   │       └── [[...slug]]/page.tsx
│   │   │   │   ├── (admin)/     # Admin routes (protected)
│   │   │   │   │   ├── layout.tsx
│   │   │   │   │   ├── admin/
│   │   │   │   │   │   ├── page.tsx          # Dashboard
│   │   │   │   │   │   ├── blog/
│   │   │   │   │   │   │   ├── page.tsx      # Blog list
│   │   │   │   │   │   │   ├── new/page.tsx  # Create blog
│   │   │   │   │   │   │   └── [id]/
│   │   │   │   │   │   │       └── edit/page.tsx
│   │   │   │   │   │   ├── docs/
│   │   │   │   │   │   │   ├── page.tsx
│   │   │   │   │   │   │   ├── new/page.tsx
│   │   │   │   │   │   │   └── [id]/edit/page.tsx
│   │   │   │   │   │   ├── media/page.tsx
│   │   │   │   │   │   └── settings/page.tsx
│   │   │   │   ├── (auth)/      # Auth routes
│   │   │   │   │   ├── login/page.tsx
│   │   │   │   │   └── callback/route.ts
│   │   │   │   ├── api/         # API Routes
│   │   │   │   │   ├── auth/
│   │   │   │   │   ├── upload/
│   │   │   │   │   └── revalidate/
│   │   │   │   ├── layout.tsx
│   │   │   │   └── global-error.tsx
│   │   │   ├── components/
│   │   │   │   ├── ui/          # shadcn/ui components
│   │   │   │   ├── blog/        # Blog-specific components
│   │   │   │   ├── docs/        # Docs-specific components
│   │   │   │   ├── admin/       # Admin dashboard components
│   │   │   │   ├── editor/      # BlockNote rich editor
│   │   │   │   └── shared/      # Shared components
│   │   │   ├── lib/
│   │   │   │   ├── supabase/    # Supabase clients
│   │   │   │   │   ├── client.ts
│   │   │   │   │   ├── server.ts
│   │   │   │   │   └── middleware.ts
│   │   │   │   ├── db/          # Drizzle ORM
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── schema/
│   │   │   │   │   │   ├── index.ts
│   │   │   │   │   │   ├── blogs.ts
│   │   │   │   │   │   ├── docs.ts
│   │   │   │   │   │   ├── media.ts
│   │   │   │   │   │   └── profiles.ts
│   │   │   │   │   └── queries/
│   │   │   │   │       ├── blogs.ts
│   │   │   │   │       ├── docs.ts
│   │   │   │   │       └── media.ts
│   │   │   │   ├── hooks/       # Custom React hooks
│   │   │   │   ├── utils/       # Utility functions
│   │   │   │   ├── stores/      # Zustand stores
│   │   │   │   ├── schemas/     # Zod schemas
│   │   │   │   └── constants/   # App constants
│   │   │   ├── config/          # App configuration
│   │   │   ├── i18n/            # Internationalization
│   │   │   ├── styles/          # Global styles
│   │   │   └── types/           # TypeScript types
│   │   ├── public/
│   │   ├── drizzle.config.ts
│   │   ├── next.config.ts
│   │   └── package.json
│   │
│   └── content/                 # Markdown content (legacy - to be migrated to DB)
│       ├── blog/
│       └── docs/
│
├── packages/
│   ├── ui/                      # Shared UI components (optional)
│   │   ├── src/
│   │   └── package.json
│   ├── config/                  # Shared configurations
│   │   ├── biome/
│   │   └── package.json
│   ├── tsconfig/                # Shared TypeScript configs
│   │   ├── base.json
│   │   └── package.json
│   └── db/                      # Shared database types (optional)
│       ├── src/
│       └── package.json
│
├── supabase/                    # Supabase configurations
│   ├── migrations/              # Database migrations
│   ├── functions/               # Edge functions (optional)
│   ├── seed.sql                 # Seed data
│   └── config.toml
│
├── docs/                        # Project documentation
│   └── plans/
│       ├── archive/
│       └── dev-1/               # Current development phase
│
├── turbo.json
├── package.json
├── biome.json
└── bunfig.toml
```

### 2.2 Route Groups Explanation

| Route Group | Purpose | Auth Required |
|-------------|---------|---------------|
| `(public)` | Public-facing pages (blog, docs, home) | No |
| `(admin)` | Admin dashboard and content management | Yes (admin only) |
| `(auth)` | Authentication pages (login, callback) | No |

---

## 3. Design Patterns

### 3.1 Server-First Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js 16 App Router                     │
├─────────────────────────────────────────────────────────────┤
│  Server Components (Default)                                 │
│  ├─ Data fetching with Drizzle ORM                          │
│  ├─ Supabase Server Client                                  │
│  └─ Direct database access via connection pooling           │
├─────────────────────────────────────────────────────────────┤
│  Client Components ('use client')                           │
│  ├─ Interactive UI (forms, editors, modals)                 │
│  ├─ TanStack Query for client-side data                     │
│  ├─ Zustand for client state                                │
│  └─ BlockNote rich editor                                   │
├─────────────────────────────────────────────────────────────┤
│  Server Actions                                              │
│  ├─ Form submissions                                        │
│  ├─ Data mutations (CRUD)                                   │
│  └─ Revalidation triggers                                   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow Patterns

#### Pattern 1: Server Component Data Fetching (Preferred)
```tsx
// app/(public)/[locale]/blog/page.tsx
import { db } from '@/lib/db'
import { blogs } from '@/lib/db/schema'

export default async function BlogPage() {
  const posts = await db.select().from(blogs).where(eq(blogs.published, true))
  return <BlogList posts={posts} />
}
```

#### Pattern 2: Server Actions for Mutations
```tsx
// lib/actions/blog.ts
'use server'

import { db } from '@/lib/db'
import { blogs } from '@/lib/db/schema'
import { revalidatePath } from 'next/cache'

export async function createBlog(data: NewBlog) {
  await db.insert(blogs).values(data)
  revalidatePath('/blog')
}
```

#### Pattern 3: TanStack Query for Client Components
```tsx
// components/admin/blog-table.tsx
'use client'

import { useQuery } from '@tanstack/react-query'

export function BlogTable() {
  const { data: blogs } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => fetch('/api/admin/blogs').then(r => r.json())
  })
  // ...
}
```

### 3.3 Component Composition Pattern
```tsx
// Recommended component structure
<PageLayout>                    {/* Server Component */}
  <PageHeader />                {/* Server Component */}
  <Suspense fallback={<Skeleton />}>
    <AsyncDataComponent />      {/* Server Component with async */}
  </Suspense>
  <InteractiveSection>          {/* Client Component */}
    <Form />
    <Editor />
  </InteractiveSection>
</PageLayout>
```

---

## 4. State Management Strategy

### 4.1 State Types & Solutions

| State Type | Solution | Example |
|------------|----------|---------|
| Server State | TanStack Query | Blog posts, docs, media |
| URL State | `useSearchParams` | Filters, pagination |
| Form State | React Hook Form + Zod | Blog editor, settings |
| UI State | Zustand (minimal) | Sidebar open, theme |
| Auth State | Supabase Auth | Session, user info |

### 4.2 Zustand Store Structure
```typescript
// lib/stores/ui-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarOpen: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    { name: 'ui-storage' }
  )
)
```

---

## 5. API Strategy

### 5.1 API Routes Usage

| Endpoint | Purpose | Auth |
|----------|---------|------|
| `/api/auth/*` | Auth callbacks, session | Varies |
| `/api/upload` | Cloudinary upload proxy | Admin |
| `/api/revalidate` | On-demand ISR | Webhook |
| `/api/og/[...slug]` | OG image generation | Public |

### 5.2 When to Use API Routes vs Server Actions

**Use Server Actions for:**
- Form submissions
- CRUD operations from UI
- Actions requiring revalidation

**Use API Routes for:**
- External webhooks
- File uploads
- Public APIs
- Complex auth flows

---

## 6. Error Handling Strategy

### 6.1 Error Boundaries
```
app/
├── global-error.tsx          # Root error boundary
├── (public)/
│   ├── error.tsx             # Public routes error
│   └── not-found.tsx         # 404 page
├── (admin)/
│   ├── error.tsx             # Admin routes error
│   └── admin/
│       └── blog/
│           └── error.tsx     # Blog admin error
```

### 6.2 Error Types
```typescript
// lib/utils/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404)
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 'UNAUTHORIZED', 401)
  }
}
```

---

## 7. Performance Optimization

### 7.1 Caching Strategy

| Content Type | Cache Strategy | TTL |
|--------------|---------------|-----|
| Blog posts | ISR + SWR | 60s |
| Docs pages | Static + revalidate | On-demand |
| Admin pages | No cache | - |
| API responses | Cache-Control | Varies |

### 7.2 Next.js 16 Cache Configuration
```typescript
// next.config.ts
import type { NextConfig } from 'next'

const config: NextConfig = {
  experimental: {
    // Enable Partial Prerendering (PPR)
    ppr: true,
    // React Compiler
    reactCompiler: true,
  },
  images: {
    remotePatterns: [
      { hostname: 'res.cloudinary.com' },
      { hostname: '*.supabase.co' },
    ],
  },
}

export default config
```

---

## 8. Security Considerations

### 8.1 Security Checklist
- [ ] Environment variables properly configured
- [ ] Supabase RLS policies enabled
- [ ] Admin routes protected via middleware
- [ ] CSRF protection via Server Actions
- [ ] Input validation with Zod
- [ ] Secure file upload handling
- [ ] Rate limiting on API routes

### 8.2 Middleware Protection
```typescript
// middleware.ts (Next.js 16 uses proxy.ts)
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const supabase = createMiddlewareClient(request)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user || user.user_metadata.role !== 'admin') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  return await updateSession(request)
}
```

---

## 9. Current Issues & Solutions

### 9.1 Issues Identified in Current Codebase

| Issue | Current State | Solution |
|-------|---------------|----------|
| MDX dependency | Using Content Collections | Migrate to DB + Markdown |
| Route structure | Mixed `[locale]`/`[lang]` | Standardize to `[locale]` |
| State management | Zustand underutilized | Apply proper patterns |
| Auth | Not implemented | Implement Supabase Auth |
| Admin panel | Missing | Build from scratch |
| Database | Not connected | Add Supabase + Drizzle |

### 9.2 Migration Path

1. **Phase 1:** Setup Supabase + Drizzle (database foundation)
2. **Phase 2:** Implement Auth (admin protection)
3. **Phase 3:** Build Admin Dashboard (content management)
4. **Phase 4:** Migrate content to database (blog/docs CRUD)
5. **Phase 5:** Implement public features (blog list, docs, search)
6. **Phase 6:** Polish (SEO, performance, UX)

---

## 10. File Naming Conventions

### 10.1 Files
| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `BlogCard.tsx` |
| Hooks | camelCase with `use` | `useBlogConfig.ts` |
| Utils | camelCase | `formatDate.ts` |
| Constants | SCREAMING_SNAKE | `API_ENDPOINTS.ts` |
| Types | PascalCase | `Blog.types.ts` |
| Schemas | camelCase | `blogSchema.ts` |
| Actions | camelCase | `blogActions.ts` |

### 10.2 Folders
| Type | Convention | Example |
|------|-----------|---------|
| Feature folders | kebab-case | `blog-editor/` |
| Route groups | (parentheses) | `(admin)/` |
| Dynamic routes | [brackets] | `[slug]/` |
| Catch-all | [[...slug]] | `[[...slug]]/` |

---

## Next Steps

See the following documents for detailed specifications:
- [02-tech-stack.md](./02-tech-stack.md) - Complete tech stack details
- [03-database-schema.md](./03-database-schema.md) - Database design
- [04-auth-admin.md](./04-auth-admin.md) - Authentication setup
- [05-feature-blog.md](./05-feature-blog.md) - Blog features
- [06-feature-docs.md](./06-feature-docs.md) - Docs features
- [07-feature-admin-dashboard.md](./07-feature-admin-dashboard.md) - Admin dashboard
