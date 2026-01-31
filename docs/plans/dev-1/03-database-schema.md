# Database Schema - Blog Personal Next.js

> **For Claude/Copilot:** Use these Drizzle ORM schemas exactly as specified. Generate migrations with `drizzle-kit generate`.

**Goal:** Design a scalable PostgreSQL schema for blog, docs, media, and user management.

**Last Updated:** 2026-01-30

---

## 1. Schema Overview

### 1.1 Entity Relationship Diagram
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    profiles     │     │      blogs      │     │   blog_tags     │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ email           │     │ author_id (FK)──┼────▶│ blog_id (FK)    │
│ name            │◀────┼─author_id       │     │ tag_id (FK)     │
│ avatar_url      │     │ title           │     └────────┬────────┘
│ role            │     │ slug            │              │
│ is_admin        │     │ content         │              ▼
└─────────────────┘     │ excerpt         │     ┌─────────────────┐
                        │ featured_image  │     │      tags       │
                        │ published       │     ├─────────────────┤
                        │ view_count      │     │ id (PK)         │
                        │ created_at      │     │ name            │
                        │ updated_at      │     │ slug            │
                        │ published_at    │     └─────────────────┘
                        └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      docs       │     │   doc_topics    │     │     media       │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ topic_id (FK)───┼────▶│ name            │     │ uploaded_by(FK) │
│ author_id (FK)  │     │ slug            │     │ url             │
│ title           │     │ parent_id (FK)──┼──┐  │ public_id       │
│ slug            │     │ order           │  │  │ type            │
│ content         │     └────────┬────────┘  │  │ size            │
│ order           │              │           │  │ alt_text        │
│ created_at      │              ▼           │  │ created_at      │
│ updated_at      │     ┌─────────────────┐  │  └─────────────────┘
└─────────────────┘     │   (self-ref)    │◀─┘
                        └─────────────────┘

┌─────────────────┐
│   site_settings │
├─────────────────┤
│ id (PK)         │
│ key             │
│ value           │
│ updated_at      │
└─────────────────┘
```

---

## 2. Drizzle Schema Definitions

### 2.1 Profiles Table
```typescript
// lib/db/schema/profiles.ts
import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core'

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(), // References auth.users
  email: text('email').notNull().unique(),
  name: text('name'),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  role: text('role').default('user').notNull(), // 'admin' | 'user'
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Types
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
```

### 2.2 Tags Table
```typescript
// lib/db/schema/tags.ts
import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'

export const tags = pgTable('tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Tag = typeof tags.$inferSelect
export type NewTag = typeof tags.$inferInsert
```

### 2.3 Blogs Table
```typescript
// lib/db/schema/blogs.ts
import { pgTable, uuid, text, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const blogs = pgTable('blogs', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').references(() => profiles.id).notNull(),
  
  // Content
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  content: text('content').notNull(), // Markdown content
  contentJson: jsonb('content_json'), // BlockNote JSON (for editor)
  excerpt: text('excerpt'),
  
  // Media
  featuredImage: text('featured_image'), // Cloudinary URL
  featuredImageAlt: text('featured_image_alt'),
  
  // Status
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  
  // Analytics
  viewCount: integer('view_count').default(0).notNull(),
  
  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Performance indexes
  authorIdx: index('blogs_author_id_idx').on(table.authorId),
  publishedIdx: index('blogs_published_idx').on(table.published),
  publishedAtIdx: index('blogs_published_at_idx').on(table.publishedAt),
  slugIdx: index('blogs_slug_idx').on(table.slug),
}))

export type Blog = typeof blogs.$inferSelect
export type NewBlog = typeof blogs.$inferInsert
```

### 2.4 Blog Tags Junction Table
```typescript
// lib/db/schema/blog-tags.ts
import { pgTable, uuid, primaryKey, index } from 'drizzle-orm/pg-core'
import { blogs } from './blogs'
import { tags } from './tags'

export const blogTags = pgTable('blog_tags', {
  blogId: uuid('blog_id').references(() => blogs.id, { onDelete: 'cascade' }).notNull(),
  tagId: uuid('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.blogId, table.tagId] }),
  // Indexes for efficient joins
  blogIdx: index('blog_tags_blog_id_idx').on(table.blogId),
  tagIdx: index('blog_tags_tag_id_idx').on(table.tagId),
}))

export type BlogTag = typeof blogTags.$inferSelect
export type NewBlogTag = typeof blogTags.$inferInsert
```

### 2.5 Doc Topics Table (Hierarchical)
```typescript
// lib/db/schema/doc-topics.ts
import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core'

export const docTopics = pgTable('doc_topics', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  parentId: uuid('parent_id').references((): any => docTopics.id, { onDelete: 'cascade' }),
  order: integer('order').default(0).notNull(),
  icon: text('icon'), // Lucide icon name
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  // Index for parent lookup (hierarchical queries)
  parentIdx: index('doc_topics_parent_id_idx').on(table.parentId),
  orderIdx: index('doc_topics_order_idx').on(table.order),
}))

export type DocTopic = typeof docTopics.$inferSelect
export type NewDocTopic = typeof docTopics.$inferInsert
```

### 2.6 Docs Table
```typescript
// lib/db/schema/docs.ts
import { pgTable, uuid, text, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'
import { docTopics } from './doc-topics'

export const docs = pgTable('docs', {
  id: uuid('id').primaryKey().defaultRandom(),
  topicId: uuid('topic_id').references(() => docTopics.id, { onDelete: 'cascade' }).notNull(),
  authorId: uuid('author_id').references(() => profiles.id).notNull(),
  
  // Content
  title: text('title').notNull(),
  slug: text('slug').notNull(),
  content: text('content').notNull(), // Markdown content
  contentJson: jsonb('content_json'), // BlockNote JSON
  
  // Order within topic
  order: integer('order').default(0).notNull(),
  
  // SEO
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Doc = typeof docs.$inferSelect
export type NewDoc = typeof docs.$inferInsert
```

### 2.7 Media Table
```typescript
// lib/db/schema/media.ts
import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core'
import { profiles } from './profiles'

export const media = pgTable('media', {
  id: uuid('id').primaryKey().defaultRandom(),
  uploadedBy: uuid('uploaded_by').references(() => profiles.id).notNull(),
  
  // Cloudinary
  url: text('url').notNull(),
  publicId: text('public_id').notNull().unique(),
  
  // Metadata
  filename: text('filename').notNull(),
  mimeType: text('mime_type').notNull(),
  size: integer('size').notNull(), // bytes
  width: integer('width'),
  height: integer('height'),
  
  // SEO
  altText: text('alt_text'),
  caption: text('caption'),
  
  // Organization
  folder: text('folder').default('/'),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export type Media = typeof media.$inferSelect
export type NewMedia = typeof media.$inferInsert
```

### 2.8 Site Settings Table
```typescript
// lib/db/schema/site-settings.ts
import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'

export const siteSettings = pgTable('site_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export type SiteSetting = typeof siteSettings.$inferSelect
export type NewSiteSetting = typeof siteSettings.$inferInsert
```

### 2.9 Schema Index Export
```typescript
// lib/db/schema/index.ts
export * from './profiles'
export * from './tags'
export * from './blogs'
export * from './blog-tags'
export * from './doc-topics'
export * from './docs'
export * from './media'
export * from './site-settings'
```

---

## 3. Database Client Setup

### 3.1 Drizzle Client
```typescript
// lib/db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Connection for queries
const queryClient = postgres(process.env.DATABASE_URL!, {
  prepare: false, // Required for Supabase connection pooling
})

export const db = drizzle(queryClient, { schema })

// Export schema for type inference
export { schema }
export type Database = typeof db
```

### 3.2 Drizzle Config
```typescript
// drizzle.config.ts
import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

config({ path: '.env.local' })

export default defineConfig({
  schema: './src/lib/db/schema/index.ts',
  out: './supabase/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: ['public'],
  verbose: true,
  strict: true,
})
```

---

## 4. Row Level Security (RLS) Policies

### 4.1 Profiles RLS
```sql
-- supabase/migrations/xxx_rls_profiles.sql

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public can view profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- Auto-create profile on signup
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);
```

### 4.2 Blogs RLS
```sql
-- supabase/migrations/xxx_rls_blogs.sql

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Public can view published blogs
CREATE POLICY "Public can view published blogs"
  ON blogs FOR SELECT
  USING (published = true);

-- Admins can view all blogs
CREATE POLICY "Admins can view all blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );

-- Admins can insert blogs
CREATE POLICY "Admins can insert blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );

-- Admins can update blogs
CREATE POLICY "Admins can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );

-- Admins can delete blogs
CREATE POLICY "Admins can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );
```

### 4.3 Docs RLS
```sql
-- supabase/migrations/xxx_rls_docs.sql

ALTER TABLE doc_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE docs ENABLE ROW LEVEL SECURITY;

-- Public can view all doc topics
CREATE POLICY "Public can view doc topics"
  ON doc_topics FOR SELECT
  USING (true);

-- Public can view all docs
CREATE POLICY "Public can view docs"
  ON docs FOR SELECT
  USING (true);

-- Admin policies for doc_topics
CREATE POLICY "Admins can manage doc topics"
  ON doc_topics FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );

-- Admin policies for docs
CREATE POLICY "Admins can manage docs"
  ON docs FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );
```

### 4.4 Media RLS
```sql
-- supabase/migrations/xxx_rls_media.sql

ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Public can view media (for blog/doc images)
CREATE POLICY "Public can view media"
  ON media FOR SELECT
  USING (true);

-- Only admins can manage media
CREATE POLICY "Admins can manage media"
  ON media FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );
```

### 4.5 Tags RLS
```sql
-- supabase/migrations/xxx_rls_tags.sql

ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;

-- Public can view tags
CREATE POLICY "Public can view tags"
  ON tags FOR SELECT
  USING (true);

CREATE POLICY "Public can view blog_tags"
  ON blog_tags FOR SELECT
  USING (true);

-- Only admins can manage tags
CREATE POLICY "Admins can manage tags"
  ON tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );

CREATE POLICY "Admins can manage blog_tags"
  ON blog_tags FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );
```

### 4.6 Site Settings RLS
```sql
-- supabase/migrations/xxx_rls_site_settings.sql

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public can view settings
CREATE POLICY "Public can view site settings"
  ON site_settings FOR SELECT
  USING (true);

-- Only admins can manage settings
CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = (SELECT auth.uid()) 
      AND profiles.is_admin = true
    )
  );
```

---

## 5. Database Functions & Triggers

### 5.1 Auto-create Profile on Signup
```sql
-- supabase/migrations/xxx_profile_trigger.sql

-- Function to create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 5.2 Update Timestamps
```sql
-- supabase/migrations/xxx_update_timestamps.sql

-- Function to update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_docs_updated_at
  BEFORE UPDATE ON docs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_doc_topics_updated_at
  BEFORE UPDATE ON doc_topics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 5.3 Generate Slug Function
```sql
-- supabase/migrations/xxx_slug_function.sql

CREATE OR REPLACE FUNCTION public.generate_slug(title TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN LOWER(
    REGEXP_REPLACE(
      REGEXP_REPLACE(
        UNACCENT(title),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

### 5.4 Increment View Count
```sql
-- supabase/migrations/xxx_view_count.sql

CREATE OR REPLACE FUNCTION public.increment_blog_view(blog_slug TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE blogs
  SET view_count = view_count + 1
  WHERE slug = blog_slug;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 6. Query Examples (Drizzle)

### 6.1 Blog Queries
```typescript
// lib/db/queries/blogs.ts
import { db } from '@/lib/db'
import { blogs, blogTags, tags, profiles } from '@/lib/db/schema'
import { eq, desc, and, sql } from 'drizzle-orm'

// Get all published blogs with author and tags
export async function getPublishedBlogs(limit = 10, offset = 0) {
  return db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      featuredImage: blogs.featuredImage,
      publishedAt: blogs.publishedAt,
      viewCount: blogs.viewCount,
      author: {
        name: profiles.name,
        avatarUrl: profiles.avatarUrl,
      },
    })
    .from(blogs)
    .leftJoin(profiles, eq(blogs.authorId, profiles.id))
    .where(eq(blogs.published, true))
    .orderBy(desc(blogs.publishedAt))
    .limit(limit)
    .offset(offset)
}

// Get blog by slug with tags
export async function getBlogBySlug(slug: string) {
  const blog = await db
    .select()
    .from(blogs)
    .leftJoin(profiles, eq(blogs.authorId, profiles.id))
    .where(and(eq(blogs.slug, slug), eq(blogs.published, true)))
    .limit(1)
    .then(rows => rows[0])

  if (!blog) return null

  const blogTagsData = await db
    .select({ tag: tags })
    .from(blogTags)
    .leftJoin(tags, eq(blogTags.tagId, tags.id))
    .where(eq(blogTags.blogId, blog.blogs.id))

  return {
    ...blog.blogs,
    author: blog.profiles,
    tags: blogTagsData.map(bt => bt.tag),
  }
}

// Create blog
export async function createBlog(data: NewBlog) {
  const [blog] = await db.insert(blogs).values(data).returning()
  return blog
}

// Update blog
export async function updateBlog(id: string, data: Partial<NewBlog>) {
  const [blog] = await db
    .update(blogs)
    .set(data)
    .where(eq(blogs.id, id))
    .returning()
  return blog
}

// Delete blog
export async function deleteBlog(id: string) {
  await db.delete(blogs).where(eq(blogs.id, id))
}
```

### 6.2 Docs Queries
```typescript
// lib/db/queries/docs.ts
import { db } from '@/lib/db'
import { docs, docTopics, profiles } from '@/lib/db/schema'
import { eq, asc, isNull } from 'drizzle-orm'

// Get doc topics tree
export async function getDocTopicsTree() {
  const topics = await db
    .select()
    .from(docTopics)
    .orderBy(asc(docTopics.order))

  // Build tree structure
  const topicMap = new Map(topics.map(t => [t.id, { ...t, children: [] }]))
  const tree: DocTopic[] = []

  for (const topic of topics) {
    if (topic.parentId) {
      const parent = topicMap.get(topic.parentId)
      if (parent) parent.children.push(topicMap.get(topic.id)!)
    } else {
      tree.push(topicMap.get(topic.id)!)
    }
  }

  return tree
}

// Get docs by topic
export async function getDocsByTopic(topicSlug: string) {
  const topic = await db
    .select()
    .from(docTopics)
    .where(eq(docTopics.slug, topicSlug))
    .limit(1)
    .then(rows => rows[0])

  if (!topic) return null

  const topicDocs = await db
    .select()
    .from(docs)
    .where(eq(docs.topicId, topic.id))
    .orderBy(asc(docs.order))

  return { topic, docs: topicDocs }
}

// Get doc by slug
export async function getDocBySlug(topicSlug: string, docSlug: string) {
  return db
    .select()
    .from(docs)
    .leftJoin(docTopics, eq(docs.topicId, docTopics.id))
    .leftJoin(profiles, eq(docs.authorId, profiles.id))
    .where(and(
      eq(docTopics.slug, topicSlug),
      eq(docs.slug, docSlug)
    ))
    .limit(1)
    .then(rows => rows[0])
}
```

---

## 7. Seed Data

### 7.1 Seed Script
```typescript
// scripts/seed.ts
import { db } from '@/lib/db'
import { profiles, tags, docTopics, siteSettings } from '@/lib/db/schema'

async function seed() {
  console.log('🌱 Seeding database...')

  // Create admin profile (after Supabase auth user exists)
  // Note: Run this after creating user via Supabase Auth

  // Seed tags
  await db.insert(tags).values([
    { name: 'Next.js', slug: 'nextjs' },
    { name: 'React', slug: 'react' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'Supabase', slug: 'supabase' },
    { name: 'Tailwind CSS', slug: 'tailwind-css' },
  ]).onConflictDoNothing()

  // Seed doc topics
  await db.insert(docTopics).values([
    { name: 'Getting Started', slug: 'getting-started', order: 0 },
    { name: 'Customizing', slug: 'customizing', order: 1 },
    { name: 'Components', slug: 'components', order: 2 },
  ]).onConflictDoNothing()

  // Seed site settings
  await db.insert(siteSettings).values([
    { key: 'site_name', value: '"Blog Personal"' },
    { key: 'site_description', value: '"A personal blog about web development"' },
    { key: 'social_links', value: JSON.stringify({
      github: 'https://github.com/username',
      twitter: 'https://twitter.com/username',
    })},
  ]).onConflictDoNothing()

  console.log('✅ Seed completed!')
}

seed().catch(console.error)
```

---

## 8. Migration Commands

```bash
# Generate migration from schema changes
bun run db:generate

# Apply migrations locally
bun run db:migrate

# Push schema directly (dev only)
bun run db:push

# Open Drizzle Studio
bun run db:studio

# Run seed script
bun run db:seed
```

**package.json scripts:**
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:push": "drizzle-kit push",
    "db:studio": "drizzle-kit studio",
    "db:seed": "bun run scripts/seed.ts"
  }
}
```

---

## Next Steps

See [04-auth-admin.md](./04-auth-admin.md) for authentication setup.
