# Phase 2: Content Collections Setup

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace Contentlayer2 with Content Collections to process MDX content from `apps/content/` folder.

**Files:**
- Create: `apps/web/content-collections.ts`
- Modify: `apps/web/next.config.ts`
- Modify: `apps/web/tsconfig.json`
- Delete: `apps/web/contentlayer.config.ts` (after migration complete)
- Modify: All files importing from `contentlayer/generated`

---

## Task 1: Create Content Collections Configuration

**Step 1: Create content-collections.ts**

Create file `apps/web/content-collections.ts`:

```typescript
import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

// Import code theme configuration
// import { getContentLayerCodeTheme } from "./src/lib/core/utils/code-theme";

// =============================================================================
// DOCS COLLECTION
// =============================================================================

const docs = defineCollection({
  name: "docs",
  directory: "../content/docs",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
    toc: z.boolean().default(true),
  }),
  transform: async (doc, context) => {
    const mdx = await compileMDX(context, doc, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: "github-dark",
            onVisitLine(node: any) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },
            onVisitHighlightedLine(node: any) {
              node.properties.className = ["line--highlighted"];
            },
            onVisitHighlightedChars(node: any) {
              node.properties.className = ["word--highlighted"];
            },
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["subheading-anchor"],
              ariaLabel: "Link to section",
            },
          },
        ],
      ],
    });

    // Generate slug from file path
    const pathParts = doc._meta.path.split("/");
    const slugAsParams = pathParts.join("/");

    return {
      ...doc,
      mdx,
      slug: `/${doc._meta.path}`,
      slugAsParams,
      // Compatibility with old Contentlayer structure
      _id: doc._meta.filePath,
      _raw: {
        sourceFilePath: doc._meta.filePath,
        sourceFileName: doc._meta.fileName,
        sourceFileDir: doc._meta.directory,
        flattenedPath: doc._meta.path,
        contentType: "mdx",
      },
    };
  },
});

// =============================================================================
// BLOG COLLECTION
// =============================================================================

const blogs = defineCollection({
  name: "blogs",
  directory: "../content/blog",
  include: "**/*.mdx",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.string(),
    published: z.boolean().default(true),
    featured: z.boolean().default(false),
    author_id: z.string().default("huynhsang"),
    image: z.string().optional(),
    tags: z.array(z.string()).default([]),
  }),
  transform: async (doc, context) => {
    const mdx = await compileMDX(context, doc, {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [
          rehypePrettyCode,
          {
            theme: "github-dark",
            onVisitLine(node: any) {
              if (node.children.length === 0) {
                node.children = [{ type: "text", value: " " }];
              }
            },
            onVisitHighlightedLine(node: any) {
              node.properties.className = ["line--highlighted"];
            },
            onVisitHighlightedChars(node: any) {
              node.properties.className = ["word--highlighted"];
            },
          },
        ],
        [
          rehypeAutolinkHeadings,
          {
            properties: {
              className: ["subheading-anchor"],
              ariaLabel: "Link to section",
            },
          },
        ],
      ],
    });

    // Generate slug from file path
    const pathParts = doc._meta.path.split("/");
    const slugAsParams = pathParts.join("/");

    // Calculate read time
    const wordsPerMinute = 200;
    const numberOfWords = doc.content.trim().split(/\s+/).length;
    const readTimeInMinutes = Math.ceil(numberOfWords / wordsPerMinute);

    return {
      ...doc,
      mdx,
      slug: `/${doc._meta.path}`,
      slugAsParams,
      readTimeInMinutes,
      // Compatibility with old Contentlayer structure
      _id: doc._meta.filePath,
      _raw: {
        sourceFilePath: doc._meta.filePath,
        sourceFileName: doc._meta.fileName,
        sourceFileDir: doc._meta.directory,
        flattenedPath: doc._meta.path,
        contentType: "mdx",
      },
    };
  },
});

// =============================================================================
// EXPORT CONFIG
// =============================================================================

export default defineConfig({
  collections: [docs, blogs],
});
```

**Step 2: Commit**

```bash
git add apps/web/content-collections.ts
git commit -m "feat(web): add content-collections configuration"
```

---

## Task 2: Update Next.js Configuration

**Step 1: Update next.config.ts**

Modify `apps/web/next.config.ts`:

```typescript
import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";

const nextConfig: NextConfig = {
  // Enable Turbopack by default (stable in Next.js 16)

  // Cache Components - explicit caching model for Next.js 16
  cacheComponents: true,

  // React Compiler (stable in Next.js 16)
  reactCompiler: true,

  // TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },

  // Images
  images: {
    formats: ["image/avif", "image/webp"],
  },

  // Experimental features for performance
  experimental: {
    turbopackFileSystemCacheForBuild: true,
  },
};

export default withContentCollections(nextConfig);
```

**Step 2: Commit**

```bash
git add apps/web/next.config.ts
git commit -m "feat(web): integrate content-collections with next.config.ts"
```

---

## Task 3: Update TypeScript Configuration

**Step 1: Update tsconfig.json paths**

Modify `apps/web/tsconfig.json` to add content-collections path:

```jsonc
{
  "compilerOptions": {
    // ... existing options ...
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@blog/i18n": ["../../packages/i18n/src/index.ts"],
      "content-collections": ["./.content-collections/generated"]
    }
  },
  "include": [
    "src/**/*",
    ".next/types/**/*.ts",
    ".next/dev/types/**/*.ts",
    ".content-collections/generated/**/*"
  ]
}
```

**Step 2: Commit**

```bash
git add apps/web/tsconfig.json
git commit -m "feat(web): update tsconfig for content-collections"
```

---

## Task 4: Create Type Definitions

**Step 1: Create content types file**

Create file `apps/web/src/lib/core/types/content.ts`:

```typescript
// Re-export types from content-collections
export type { Doc, Blog } from "content-collections";

// Legacy type aliases for backward compatibility
export type Doc = import("content-collections").Doc;
export type Blog = import("content-collections").Blog;

// Helper types
export interface DocPageProps {
  params: {
    locale: string;
    slug?: string[];
  };
}

export interface BlogPageProps {
  params: {
    locale: string;
    slug?: string[];
  };
}
```

**Step 2: Commit**

```bash
git add apps/web/src/lib/core/types/content.ts
git commit -m "feat(web): add content type definitions"
```

---

## Task 5: Update Import Statements

**Step 1: Find all files importing from contentlayer/generated**

Files to update:
- `src/app/sitemap.ts`
- `src/app/[locale]/blog/og/[slug]/route.tsx`
- `src/app/[locale]/blog/[[...slug]]/page.tsx`
- `src/app/[locale]/docs/[[...slug]]/page.tsx`
- `src/app/[locale]/feed/[feed]/route.ts`
- `src/components/blog/author.tsx`
- `src/components/blog/breadcrumb.tsx`
- `src/components/blog/heading.tsx`
- `src/components/blog/paginated-posts.tsx`
- `src/components/blog/post-item-tags.tsx`
- `src/components/blog/post-tags.tsx`
- `src/components/command-menu.tsx`
- `src/components/docs/breadcrumb.tsx`
- `src/components/docs/heading.tsx`
- `src/components/docs/links.tsx`
- `src/components/docs/pager.tsx`
- `src/lib/core/utils/blog.ts`
- `src/lib/core/utils/doc.ts`

**Step 2: Replace imports**

Change from:
```typescript
import { allBlogs, allDocs, type Blog, type Doc } from 'contentlayer/generated'
```

To:
```typescript
import { allBlogs, allDocs, type Blog, type Doc } from 'content-collections'
```

**Step 3: Update useMDXComponent usage**

Change from:
```typescript
import { useMDXComponent } from 'next-contentlayer2/hooks'

// Usage
const Component = useMDXComponent(doc.body.code)
```

To:
```typescript
import { MDXContent } from "@content-collections/mdx/react";

// Usage
<MDXContent code={doc.mdx} components={mdxComponents} />
```

**Step 4: Commit**

```bash
git add src/
git commit -m "refactor(web): migrate all imports from contentlayer to content-collections"
```

---

## Task 6: Update MDX Component Rendering

**Step 1: Update src/components/docs/mdx.tsx**

Change from useMDXComponent to MDXContent:

```typescript
import { MDXContent } from "@content-collections/mdx/react";
import type { Doc } from "content-collections";

// Import all MDX components
import { mdxComponents } from "./mdx-components";

interface MdxProps {
  doc: Doc;
}

export function Mdx({ doc }: MdxProps) {
  return <MDXContent code={doc.mdx} components={mdxComponents} />;
}
```

**Step 2: Commit**

```bash
git add src/components/docs/mdx.tsx
git commit -m "refactor(web): update MDX rendering to use content-collections"
```

---

## Task 7: Delete Old Contentlayer Config

**Step 1: Remove contentlayer.config.ts**

Only after all migrations are complete and verified:

```bash
rm apps/web/contentlayer.config.ts
```

**Step 2: Commit**

```bash
git add -A
git commit -m "chore(web): remove deprecated contentlayer.config.ts"
```

---

## Checklist

- [ ] content-collections.ts created with docs and blogs collections
- [ ] next.config.ts updated with withContentCollections
- [ ] tsconfig.json paths updated for content-collections
- [ ] Type definitions created for Doc and Blog
- [ ] All imports updated from contentlayer/generated to content-collections
- [ ] MDX rendering updated to use MDXContent component
- [ ] Old contentlayer.config.ts removed
- [ ] Content builds successfully with `bun run build`
- [ ] All MDX pages render correctly

---

## Troubleshooting

### If content-collections fails to build:
1. Check content path is correct (`../content/docs`, `../content/blog`)
2. Verify MDX files have valid frontmatter
3. Check rehype/remark plugins are installed

### If types are not generated:
1. Run `bun run dev` once to generate types
2. Check `.content-collections/generated` folder exists
3. Verify tsconfig includes the generated folder

### If MDX rendering fails:
1. Check MDXContent import is correct
2. Verify doc.mdx contains compiled code
3. Check mdxComponents are properly defined
