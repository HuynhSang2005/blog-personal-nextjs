# Tech Stack - Blog Personal Next.js

> **For Claude/Copilot:** Reference this document for all technology decisions and version requirements.

**Goal:** Define the complete tech stack with rationale for each technology choice.

**Last Updated:** 2026-01-30

---

## 1. Core Framework & Runtime

### 1.1 Next.js 16
```json
{
  "next": "^16.1.6"
}
```

**Why Next.js 16:**
- Server Components & Server Actions (stable)
- Partial Prerendering (PPR) for optimal performance
- React Compiler support (automatic memoization)
- Improved caching with `use cache` directive
- Proxy (middleware) improvements
- Native TypeScript support

**Key Features Used:**
| Feature | Usage |
|---------|-------|
| App Router | All routing |
| Server Components | Data fetching, layouts |
| Server Actions | Form submissions, mutations |
| Route Handlers | API endpoints, webhooks |
| Middleware (Proxy) | Auth protection, redirects |
| Image Optimization | All images via `next/image` |
| Font Optimization | Geist font via `next/font` |

### 1.2 React 19
```json
{
  "react": "^19.2.3",
  "react-dom": "^19.2.3"
}
```

**Why React 19:**
- Actions (form handling)
- `use` hook for promises
- Improved Suspense
- Document Metadata
- React Compiler compatibility

### 1.3 Bun.js
```json
{
  "packageManager": "bun@1.2.5"
}
```

**Why Bun:**
- Faster than npm/pnpm (3-4x)
- Native TypeScript execution
- Built-in test runner
- Compatible with npm ecosystem

**Usage:**
```bash
# Development
bun run dev

# Install dependencies
bun install

# Build
bun run build
```

### 1.4 Turborepo
```json
{
  "turbo": "^2.3.0"
}
```

**Why Turborepo:**
- Monorepo task orchestration
- Incremental builds with caching
- Parallel task execution
- Remote caching (optional)

**Tasks Configuration:**
```json
// turbo.json
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "dist/**"]
    },
    "dev": {
      "persistent": true,
      "cache": false
    },
    "lint": { "outputs": [] },
    "format": { "outputs": [] },
    "db:generate": { "cache": false },
    "db:migrate": { "cache": false }
  }
}
```

---

## 2. Database & Backend

### 2.1 Supabase
```json
{
  "@supabase/supabase-js": "^2.x",
  "@supabase/ssr": "^0.x"
}
```

**Why Supabase:**
- PostgreSQL database (full SQL support)
- Built-in authentication
- Row Level Security (RLS)
- Real-time subscriptions
- Edge Functions
- Generous free tier

**Components Used:**
| Component | Purpose |
|-----------|---------|
| Database | PostgreSQL for all data |
| Auth | Admin authentication |
| Storage | Media backup (optional) |
| RLS | Data access control |

### 2.2 Drizzle ORM
```json
{
  "drizzle-orm": "^0.x",
  "drizzle-kit": "^0.x",
  "postgres": "^3.x"
}
```

**Why Drizzle:**
- Type-safe SQL queries
- Lightweight (~7.4kb)
- No code generation needed
- PostgreSQL native features
- Excellent Supabase integration

**Configuration:**
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ['public'],
})
```

### 2.3 Cloudinary (Object Storage)
```json
{
  "cloudinary": "^2.x",
  "next-cloudinary": "^6.x"
}
```

**Why Cloudinary:**
- Image/video optimization
- Automatic transformations
- CDN delivery
- Generous free tier (25GB)
- Easy integration

**Usage:**
```typescript
// Upload
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// In components
import { CldImage } from 'next-cloudinary'
```

---

## 3. UI & Styling

### 3.1 Tailwind CSS 4
```json
{
  "tailwindcss": "^4.x",
  "@tailwindcss/postcss": "^4.x"
}
```

**Why Tailwind CSS 4:**
- New engine (faster)
- CSS-first configuration
- Native @theme support
- Lightning CSS integration

**Configuration (CSS-first):**
```css
/* globals.css */
@import "tailwindcss";

@theme {
  --font-geist-sans: "Geist", sans-serif;
  --font-geist-mono: "Geist Mono", monospace;
  
  --color-background: oklch(100% 0 0);
  --color-foreground: oklch(14.5% 0 0);
  /* ... */
}
```

### 3.2 shadcn/ui
```json
{
  "@radix-ui/react-*": "^1.x",
  "class-variance-authority": "^0.7.x",
  "clsx": "^2.x",
  "tailwind-merge": "^3.x"
}
```

**Why shadcn/ui:**
- Copy-paste components (full control)
- Radix UI primitives (accessible)
- Tailwind CSS styling
- Highly customizable
- Active community

**Components to Use:**
| Component | Usage |
|-----------|-------|
| Button | All buttons |
| Dialog | Modals, confirmations |
| Dropdown Menu | Navigation, actions |
| Form | All forms |
| Input | Text inputs |
| Select | Dropdowns |
| Table | Data tables |
| Tabs | Tab navigation |
| Toast | Notifications |
| Card | Content cards |
| Sidebar | Admin navigation |
| Command | Command palette |

### 3.3 Framer Motion
```json
{
  "framer-motion": "^12.x"
}
```

**Why Framer Motion:**
- Declarative animations
- Gesture support
- Layout animations
- Exit animations

**Usage:**
```tsx
import { motion } from 'framer-motion'

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

### 3.4 Lucide React
```json
{
  "lucide-react": "^0.x"
}
```

**Why Lucide:**
- Tree-shakeable icons
- Consistent design
- Large icon set
- TypeScript support

---

## 4. State & Data Management

### 4.1 TanStack Query
```json
{
  "@tanstack/react-query": "^5.x",
  "@tanstack/react-query-devtools": "^5.x"
}
```

**Why TanStack Query:**
- Server state management
- Automatic caching
- Background refetching
- Optimistic updates
- Devtools

**Configuration:**
```tsx
// lib/providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      gcTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

### 4.2 TanStack Table
```json
{
  "@tanstack/react-table": "^8.x"
}
```

**Why TanStack Table:**
- Headless table logic
- Sorting, filtering, pagination
- Column resizing
- Row selection
- Full TypeScript support

### 4.3 Zustand
```json
{
  "zustand": "^5.x"
}
```

**Why Zustand:**
- Minimal API
- No boilerplate
- Persist middleware
- TypeScript support
- Devtools

**Usage:**
```typescript
// lib/stores/ui-store.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    { name: 'ui-storage' }
  )
)
```

---

## 5. Forms & Validation

### 5.1 React Hook Form
```json
{
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^5.x"
}
```

**Why React Hook Form:**
- Performance (uncontrolled)
- Easy validation
- TypeScript support
- Small bundle size

### 5.2 Zod
```json
{
  "zod": "^4.x"
}
```

**Why Zod:**
- TypeScript-first validation
- Schema inference
- Composable schemas
- Error messages

**Example Schema:**
```typescript
// lib/schemas/blog.ts
import { z } from 'zod'

export const blogSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(500).optional(),
  published: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  featuredImage: z.string().url().optional(),
})

export type BlogInput = z.infer<typeof blogSchema>
```

---

## 6. Content & Editor

### 6.1 BlockNote (Rich Editor)
```json
{
  "@blocknote/core": "^0.x",
  "@blocknote/react": "^0.x",
  "@blocknote/shadcn": "^0.x"
}
```

**Why BlockNote:**
- Block-based (Notion-like)
- Markdown support
- Extensible
- React integration
- Slash commands
- Drag & drop
- **shadcn/ui integration** (consistent with project UI)

**Integration:**
```tsx
// components/editor/block-editor.tsx
'use client'

import { useCreateBlockNote } from '@blocknote/react'
import { BlockNoteView } from '@blocknote/shadcn'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/shadcn/style.css'

export function BlockEditor({ 
  initialContent, 
  onChange 
}: { 
  initialContent?: string
  onChange: (content: string) => void 
}) {
  const editor = useCreateBlockNote({
    initialContent: initialContent ? JSON.parse(initialContent) : undefined,
  })

  return (
    <BlockNoteView 
      editor={editor} 
      onChange={() => {
        onChange(JSON.stringify(editor.document))
      }}
    />
  )
}
```

### 6.2 Markdown Processing
```json
{
  "remark": "^15.x",
  "remark-gfm": "^4.x",
  "rehype-pretty-code": "^0.x",
  "rehype-slug": "^6.x",
  "rehype-autolink-headings": "^7.x",
  "shiki": "^3.x"
}
```

**Why this stack:**
- GFM support (tables, strikethrough)
- Syntax highlighting (Shiki)
- Auto-generated slugs for headings
- Autolink headings for TOC

**Markdown Processing Pipeline:**
```typescript
// lib/utils/markdown.ts
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export async function processMarkdown(content: string) {
  const result = await remark()
    .use(remarkGfm)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypePrettyCode, {
      theme: 'github-dark',
    })
    .process(content)

  return result.toString()
}
```

---

## 7. Internationalization

### 7.1 next-intl
```json
{
  "next-intl": "^4.x"
}
```

**Why next-intl:**
- Next.js App Router native
- Type-safe translations
- ICU message format
- Middleware support

**Configuration:**
```typescript
// i18n/request.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./locales/${locale}.json`)).default
}))
```

**Locales:**
- `vi` (Vietnamese) - Primary
- `en` (English) - Secondary (optional)

---

## 8. Code Quality

### 8.1 TypeScript
```json
{
  "typescript": "^5.9.x"
}
```

**Configuration:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 8.2 Biome
```json
{
  "@biomejs/biome": "^2.2.x"
}
```

**Why Biome:**
- Fast (Rust-based)
- Linting + Formatting
- No config complexity
- Replaces ESLint + Prettier

**Configuration:**
```json
// biome.json
{
  "$schema": "https://biomejs.dev/schemas/1.0.0/schema.json",
  "extends": ["./packages/config/biome/biome.json"],
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2
  },
  "linter": {
    "enabled": true,
    "rules": {
      "recommended": true
    }
  }
}
```

---

## 9. Development Tools

### 9.1 Package Versions Summary
```json
{
  "dependencies": {
    // Core
    "next": "^16.1.5",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    
    // Database
    "@supabase/supabase-js": "^2.x",
    "@supabase/ssr": "^0.x",
    "drizzle-orm": "^0.x",
    "postgres": "^3.x",
    
    // UI
    "tailwindcss": "^4.x",
    "framer-motion": "^12.x",
    "lucide-react": "^0.x",
    "@radix-ui/react-*": "^1.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "tailwind-merge": "^3.x",
    
    // State
    "@tanstack/react-query": "^5.x",
    "@tanstack/react-table": "^8.x",
    "zustand": "^5.x",
    
    // Forms
    "react-hook-form": "^7.x",
    "@hookform/resolvers": "^5.x",
    "zod": "^4.x",
    
    // Editor
    "@blocknote/core": "^0.x",
    "@blocknote/react": "^0.x",
    "@blocknote/shadcn": "^0.x",
    
    // Content
    "remark": "^15.x",
    "remark-gfm": "^4.x",
    "rehype-pretty-code": "^0.x",
    "shiki": "^3.x",
    
    // i18n
    "next-intl": "^4.x",
    
    // Media
    "cloudinary": "^2.x",
    "next-cloudinary": "^6.x",
    
    // Utils
    "date-fns": "^4.x",
    "nanoid": "^5.x"
  },
  "devDependencies": {
    "turbo": "^2.3.x",
    "typescript": "^5.9.x",
    "@biomejs/biome": "^2.2.x",
    "drizzle-kit": "^0.x",
    "@types/node": "^20.x",
    "@types/react": "^19.x",
    "@types/react-dom": "^19.x"
  }
}
```

---

## 10. Environment Variables

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Blog Personal"

# Analytics (optional)
NEXT_PUBLIC_GA_ID=
```

---

## 11. Deployment - Cloudflare Workers

### 11.1 OpenNext Adapter
```json
{
  "@opennextjs/cloudflare": "^1.x"
}
```

**Why OpenNext + Cloudflare Workers:**
- Full Node.js runtime support (unlike Pages/Edge)
- Support Next.js 16 with all features (ISR, Image Optimization, PPR)
- Global edge deployment
- Free tier generous (100k requests/day)
- Custom domain support
- DDoS protection built-in

**Configuration:**
```jsonc
// wrangler.jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "main": ".open-next/worker.js",
  "name": "blog-personal",
  "compatibility_date": "2026-01-30",
  "compatibility_flags": ["nodejs_compat"],
  "assets": {
    "directory": ".open-next/assets",
    "binding": "ASSETS"
  }
}
```

**Scripts:**
```json
{
  "scripts": {
    "preview": "opennextjs-cloudflare build && opennextjs-cloudflare preview",
    "deploy": "opennextjs-cloudflare build && opennextjs-cloudflare deploy"
  }
}
```

**Custom Domain Setup:**
1. Add domain to Cloudflare DNS
2. Configure Workers custom domain in dashboard
3. SSL/TLS auto-provisioned

---

## 12. Packages to Remove

The following packages from the current codebase should be removed:

| Package | Reason |
|---------|--------|
| `@content-collections/*` | Replaced by DB + Markdown |
| `contentlayer` | Abandoned, replaced |
| `mdx-bundler` | Not needed for plain Markdown |
| `next-contentlayer` | Deprecated |

---

## Next Steps

See [03-database-schema.md](./03-database-schema.md) for database design.
