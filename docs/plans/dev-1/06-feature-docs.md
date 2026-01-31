# Feature: Documentation System - Blog Personal Next.js

> **For Claude/Copilot:** Implement hierarchical docs with topic navigation and markdown content.

**Goal:** Build a multi-level documentation system with parent/child topic organization.

**Last Updated:** 2026-01-30

---

## 1. Documentation Feature Overview

### 1.1 Feature Map
```
┌─────────────────────────────────────────────────────────────┐
│                   DOCUMENTATION SYSTEM                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PUBLIC FEATURES              ADMIN FEATURES                │
│  ├─ Docs Landing Page         ├─ Topic Management           │
│  │  └─ Overview/Index         │  ├─ Create/Edit Topics      │
│  │                            │  ├─ Reorder Topics          │
│  ├─ Topic Sidebar             │  └─ Parent/Child Relations  │
│  │  ├─ Collapsible Groups     │                             │
│  │  ├─ Active State           ├─ Doc Editor                 │
│  │  └─ Hierarchical Nav       │  ├─ BlockNote Rich Editor   │
│  │                            │  ├─ Assign to Topic         │
│  ├─ Doc Page                  │  └─ Order within Topic      │
│  │  ├─ Markdown Content       │                             │
│  │  ├─ Table of Contents      └─ Docs Admin List            │
│  │  ├─ Prev/Next Navigation   │  ├─ All docs table          │
│  │  └─ Last Updated           │  └─ Quick status toggle     │
│  │                            │                             │
│  └─ Search (Command Menu)                                    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Hierarchy Structure
```
Documentation
├── Topic: Getting Started (parent: null, order: 0)
│   ├── Doc: Introduction (order: 0)
│   ├── Doc: Installation (order: 1)
│   └── Doc: Quick Start (order: 2)
│
├── Topic: Guide (parent: null, order: 1)
│   ├── Topic: Components (parent: Guide, order: 0)  [CHILD TOPIC]
│   │   ├── Doc: Button (order: 0)
│   │   ├── Doc: Card (order: 1)
│   │   └── Doc: Dialog (order: 2)
│   │
│   ├── Topic: Hooks (parent: Guide, order: 1)  [CHILD TOPIC]
│   │   ├── Doc: useForm (order: 0)
│   │   └── Doc: useQuery (order: 1)
│   │
│   └── Doc: Overview (topicId: Guide, order: -1)
│
└── Topic: API Reference (parent: null, order: 2)
    ├── Doc: REST API (order: 0)
    └── Doc: GraphQL API (order: 1)
```

### 1.3 Requirements Summary
| Feature | Description | Priority |
|---------|-------------|----------|
| Topic Hierarchy | Parent/child topics with ordering | High |
| Sidebar Nav | Collapsible hierarchical navigation | High |
| Doc Pages | Markdown content with TOC | High |
| Search | Command menu search across all docs | High |
| Topic CRUD | Admin management of topics | High |
| Doc CRUD | Admin doc management with editor | High |
| Prev/Next Nav | Sequential navigation within topic | Medium |
| Breadcrumbs | Path navigation | Medium |

---

## 2. Database Queries

### 2.1 Topic Queries
```typescript
// lib/db/queries/docs.ts
import { db } from '@/lib/db'
import { docTopics, docs } from '@/lib/db/schema'
import { eq, isNull, asc, and } from 'drizzle-orm'

// Get all topics with their hierarchy
export async function getTopicsWithHierarchy() {
  const allTopics = await db
    .select()
    .from(docTopics)
    .orderBy(asc(docTopics.order))

  // Build hierarchy
  function buildTree(parentId: string | null): TopicWithChildren[] {
    return allTopics
      .filter((t) => t.parentId === parentId)
      .map((topic) => ({
        ...topic,
        children: buildTree(topic.id),
      }))
  }

  return buildTree(null)
}

// Get topics with their docs for sidebar
export async function getSidebarData() {
  const topics = await getTopicsWithHierarchy()

  // For each topic, get its docs
  async function enrichWithDocs(topics: TopicWithChildren[]): Promise<TopicWithDocs[]> {
    return Promise.all(
      topics.map(async (topic) => {
        const topicDocs = await db
          .select({
            id: docs.id,
            title: docs.title,
            slug: docs.slug,
            order: docs.order,
          })
          .from(docs)
          .where(and(eq(docs.topicId, topic.id), eq(docs.published, true)))
          .orderBy(asc(docs.order))

        return {
          ...topic,
          docs: topicDocs,
          children: await enrichWithDocs(topic.children),
        }
      })
    )
  }

  return enrichWithDocs(topics)
}

// Get a single doc by slug with navigation info
export async function getDocBySlug(slug: string) {
  const [doc] = await db
    .select()
    .from(docs)
    .where(eq(docs.slug, slug))
    .limit(1)

  if (!doc) return null

  // Get topic info
  const [topic] = doc.topicId
    ? await db.select().from(docTopics).where(eq(docTopics.id, doc.topicId)).limit(1)
    : [null]

  // Get prev/next docs in same topic
  let prevDoc = null
  let nextDoc = null

  if (doc.topicId) {
    const siblingsQuery = await db
      .select({ id: docs.id, title: docs.title, slug: docs.slug, order: docs.order })
      .from(docs)
      .where(and(eq(docs.topicId, doc.topicId), eq(docs.published, true)))
      .orderBy(asc(docs.order))

    const currentIndex = siblingsQuery.findIndex((d) => d.id === doc.id)
    if (currentIndex > 0) prevDoc = siblingsQuery[currentIndex - 1]
    if (currentIndex < siblingsQuery.length - 1) nextDoc = siblingsQuery[currentIndex + 1]
  }

  return {
    ...doc,
    topic,
    prevDoc,
    nextDoc,
  }
}

// Get all docs for search
export async function getAllDocsForSearch() {
  return db
    .select({
      id: docs.id,
      title: docs.title,
      slug: docs.slug,
      excerpt: docs.excerpt,
    })
    .from(docs)
    .where(eq(docs.published, true))
}
```

---

## 3. Public Documentation Pages

### 3.1 Docs Layout
```tsx
// app/(public)/[locale]/docs/layout.tsx
import { Suspense } from 'react'
import { getSidebarData } from '@/lib/db/queries/docs'
import { DocsSidebar } from '@/components/docs/docs-sidebar'
import { DocsSearch } from '@/components/docs/docs-search'
import { Skeleton } from '@/components/ui/skeleton'

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
      {/* Sidebar */}
      <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
        <div className="h-full overflow-y-auto py-6 pr-6 lg:py-8">
          {/* Search */}
          <div className="mb-4">
            <DocsSearch />
          </div>

          {/* Navigation */}
          <Suspense fallback={<SidebarSkeleton />}>
            <DocsSidebarWrapper />
          </Suspense>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
        {children}
      </main>
    </div>
  )
}

async function DocsSidebarWrapper() {
  const sidebarData = await getSidebarData()
  return <DocsSidebar data={sidebarData} />
}

function SidebarSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="ml-4 h-3 w-20" />
          <Skeleton className="ml-4 h-3 w-16" />
        </div>
      ))}
    </div>
  )
}
```

### 3.2 Docs Sidebar Component
```tsx
// components/docs/docs-sidebar.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, FileText, Folder } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'

interface TopicWithDocs {
  id: string
  name: string
  slug: string
  icon: string | null
  docs: { id: string; title: string; slug: string }[]
  children: TopicWithDocs[]
}

interface DocsSidebarProps {
  data: TopicWithDocs[]
}

export function DocsSidebar({ data }: DocsSidebarProps) {
  return (
    <nav className="space-y-2">
      {data.map((topic) => (
        <TopicItem key={topic.id} topic={topic} level={0} />
      ))}
    </nav>
  )
}

function TopicItem({ topic, level }: { topic: TopicWithDocs; level: number }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true)

  // Check if any doc in this topic or children is active
  const hasActiveDocs = topic.docs.some((doc) => pathname.includes(doc.slug)) ||
    topic.children.some((child) => 
      child.docs.some((doc) => pathname.includes(doc.slug))
    )

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-2 font-medium',
            level > 0 && 'pl-4'
          )}
        >
          {isOpen ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <Folder className="h-4 w-4" />
          {topic.name}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-4">
        {/* Docs in this topic */}
        {topic.docs.map((doc) => (
          <Link
            key={doc.id}
            href={`/docs/${doc.slug}`}
            className={cn(
              'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
              pathname.includes(doc.slug)
                ? 'bg-muted font-medium text-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            <FileText className="h-4 w-4" />
            {doc.title}
          </Link>
        ))}

        {/* Child topics */}
        {topic.children.map((child) => (
          <TopicItem key={child.id} topic={child} level={level + 1} />
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
```

### 3.3 Doc Page
```tsx
// app/(public)/[locale]/docs/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getDocBySlug, getSidebarData } from '@/lib/db/queries/docs'
import { DocContent } from '@/components/docs/doc-content'
import { DocTOC } from '@/components/docs/doc-toc'
import { DocPagination } from '@/components/docs/doc-pagination'
import { DocBreadcrumb } from '@/components/docs/doc-breadcrumb'
import { Skeleton } from '@/components/ui/skeleton'

interface DocPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params
  const doc = await getDocBySlug(slug)

  if (!doc) return {}

  return {
    title: doc.metaTitle || doc.title,
    description: doc.metaDescription || doc.excerpt,
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params
  const doc = await getDocBySlug(slug)

  if (!doc || !doc.published) {
    notFound()
  }

  return (
    <>
      {/* Main Content */}
      <div className="mx-auto w-full min-w-0">
        {/* Breadcrumb */}
        {doc.topic && (
          <DocBreadcrumb topic={doc.topic} doc={{ title: doc.title, slug: doc.slug }} />
        )}

        {/* Header */}
        <div className="space-y-2">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight">
            {doc.title}
          </h1>
          {doc.excerpt && (
            <p className="text-lg text-muted-foreground">{doc.excerpt}</p>
          )}
        </div>

        {/* Content */}
        <div className="pb-12 pt-8">
          <Suspense fallback={<Skeleton className="h-[500px]" />}>
            <DocContent content={doc.content} />
          </Suspense>
        </div>

        {/* Pagination */}
        <DocPagination prevDoc={doc.prevDoc} nextDoc={doc.nextDoc} />
      </div>

      {/* Table of Contents */}
      <aside className="hidden text-sm xl:block">
        <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
          <DocTOC content={doc.content} />
        </div>
      </aside>
    </>
  )
}
```

### 3.4 Doc Pagination Component
```tsx
// components/docs/doc-pagination.tsx
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DocPaginationProps {
  prevDoc: { title: string; slug: string } | null
  nextDoc: { title: string; slug: string } | null
}

export function DocPagination({ prevDoc, nextDoc }: DocPaginationProps) {
  return (
    <div className="flex flex-row items-center justify-between pt-8 border-t">
      {prevDoc ? (
        <Link
          href={`/docs/${prevDoc.slug}`}
          className={cn(
            'group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
          )}
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Previous</p>
            <p className="font-medium text-foreground">{prevDoc.title}</p>
          </div>
        </Link>
      ) : (
        <div />
      )}

      {nextDoc ? (
        <Link
          href={`/docs/${nextDoc.slug}`}
          className={cn(
            'group flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
          )}
        >
          <div className="text-left">
            <p className="text-xs text-muted-foreground">Next</p>
            <p className="font-medium text-foreground">{nextDoc.title}</p>
          </div>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      ) : (
        <div />
      )}
    </div>
  )
}
```

### 3.5 Doc Breadcrumb Component
```tsx
// components/docs/doc-breadcrumb.tsx
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface DocBreadcrumbProps {
  topic: { name: string; slug: string }
  doc: { title: string; slug: string }
}

export function DocBreadcrumb({ topic, doc }: DocBreadcrumbProps) {
  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/docs">Docs</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={`/docs?topic=${topic.slug}`}>{topic.name}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{doc.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
```

### 3.6 Doc Search Component
```tsx
// components/docs/docs-search.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Button } from '@/components/ui/button'
import { Search, FileText } from 'lucide-react'

interface SearchDoc {
  id: string
  title: string
  slug: string
  excerpt: string | null
}

export function DocsSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [docs, setDocs] = useState<SearchDoc[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Fetch docs when dialog opens
  useEffect(() => {
    if (open && docs.length === 0) {
      setIsLoading(true)
      fetch('/api/docs/search')
        .then((res) => res.json())
        .then((data) => setDocs(data))
        .finally(() => setIsLoading(false))
    }
  }, [open, docs.length])

  const handleSelect = (slug: string) => {
    setOpen(false)
    router.push(`/docs/${slug}`)
  }

  return (
    <>
      <Button
        variant="outline"
        className="relative w-full justify-start text-sm text-muted-foreground"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        Search docs...
        <kbd className="pointer-events-none absolute right-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search documentation..." />
        <CommandList>
          <CommandEmpty>
            {isLoading ? 'Loading...' : 'No results found.'}
          </CommandEmpty>
          <CommandGroup heading="Documentation">
            {docs.map((doc) => (
              <CommandItem
                key={doc.id}
                value={doc.title}
                onSelect={() => handleSelect(doc.slug)}
              >
                <FileText className="mr-2 h-4 w-4" />
                <div>
                  <p>{doc.title}</p>
                  {doc.excerpt && (
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {doc.excerpt}
                    </p>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
```

---

## 4. Admin Docs Management

### 4.1 Topics Admin Page
```tsx
// app/(admin)/admin/docs/topics/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { getTopicsWithHierarchy } from '@/lib/db/queries/docs'
import { TopicsTree } from '@/components/admin/docs/topics-tree'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function TopicsAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Topics</h1>
          <p className="text-muted-foreground">
            Organize documentation topics
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/docs/topics/new">
            <Plus className="mr-2 h-4 w-4" />
            New Topic
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <TopicsTreeWrapper />
      </Suspense>
    </div>
  )
}

async function TopicsTreeWrapper() {
  const topics = await getTopicsWithHierarchy()
  return <TopicsTree topics={topics} />
}
```

### 4.2 Topics Tree Component (Drag & Drop)
```tsx
// components/admin/docs/topics-tree.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Folder, GripVertical, Pencil, Trash2 } from 'lucide-react'
import { reorderTopics, deleteTopic } from '@/lib/actions/docs'

interface TopicWithChildren {
  id: string
  name: string
  slug: string
  order: number
  children: TopicWithChildren[]
}

interface TopicsTreeProps {
  topics: TopicWithChildren[]
}

export function TopicsTree({ topics }: TopicsTreeProps) {
  const [items, setItems] = useState(topics)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  async function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((t) => t.id === active.id)
    const newIndex = items.findIndex((t) => t.id === over.id)

    const newItems = [...items]
    const [removed] = newItems.splice(oldIndex, 1)
    newItems.splice(newIndex, 0, removed)

    setItems(newItems)

    // Save new order
    await reorderTopics(newItems.map((t, i) => ({ id: t.id, order: i })))
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={items} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {items.map((topic) => (
            <SortableTopicItem key={topic.id} topic={topic} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

function SortableTopicItem({ topic }: { topic: TopicWithChildren }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: topic.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <Card ref={setNodeRef} style={style} className="border">
      <CardContent className="flex items-center gap-4 p-4">
        <button
          className="cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </button>

        <Folder className="h-5 w-5 text-primary" />

        <div className="flex-1">
          <p className="font-medium">{topic.name}</p>
          <p className="text-sm text-muted-foreground">/{topic.slug}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/docs/topics/${topic.id}/edit`}>
              <Pencil className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => deleteTopic(topic.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      {/* Nested children */}
      {topic.children.length > 0 && (
        <div className="ml-8 border-l pl-4 pb-4">
          {topic.children.map((child) => (
            <Card key={child.id} className="mt-2">
              <CardContent className="flex items-center gap-4 p-3">
                <Folder className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1">{child.name}</span>
                <Button variant="ghost" size="icon" asChild>
                  <Link href={`/admin/docs/topics/${child.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </Card>
  )
}
```

### 4.3 Topic Form
```tsx
// components/admin/docs/topic-form.tsx
'use client'

import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createTopic, updateTopic } from '@/lib/actions/docs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import type { DocTopic } from '@/lib/db/schema'

const topicSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  icon: z.string().optional(),
  parentId: z.string().nullable(),
})

type TopicInput = z.infer<typeof topicSchema>

interface TopicFormProps {
  topic?: DocTopic
  allTopics: DocTopic[]
}

export function TopicForm({ topic, allTopics }: TopicFormProps) {
  const router = useRouter()
  const form = useForm<TopicInput>({
    resolver: zodResolver(topicSchema),
    defaultValues: {
      name: topic?.name || '',
      slug: topic?.slug || '',
      icon: topic?.icon || '',
      parentId: topic?.parentId || null,
    },
  })

  const isSubmitting = form.formState.isSubmitting

  // Auto-generate slug
  const name = form.watch('name')
  const generateSlug = () => {
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    form.setValue('slug', slug)
  }

  async function onSubmit(data: TopicInput) {
    if (topic) {
      await updateTopic(topic.id, data)
    } else {
      await createTopic(data)
    }
    router.push('/admin/docs/topics')
  }

  // Filter out current topic and its children from parent options
  const parentOptions = allTopics.filter((t) => {
    if (!topic) return true
    if (t.id === topic.id) return false
    if (t.parentId === topic.id) return false
    return true
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Getting Started"
                  {...field}
                  onBlur={generateSlug}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input placeholder="getting-started" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Parent Topic</FormLabel>
              <Select
                value={field.value || 'none'}
                onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent topic" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">None (Top Level)</SelectItem>
                  {parentOptions.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon (optional)</FormLabel>
              <FormControl>
                <Input placeholder="book" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {topic ? 'Update' : 'Create'} Topic
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
```

### 4.4 Doc Editor Page
```tsx
// app/(admin)/admin/docs/[id]/edit/page.tsx
import { notFound } from 'next/navigation'
import { getDocById, getTopicsWithHierarchy } from '@/lib/db/queries/docs'
import { DocEditor } from '@/components/admin/docs/doc-editor'

interface EditDocPageProps {
  params: Promise<{ id: string }>
}

export default async function EditDocPage({ params }: EditDocPageProps) {
  const { id } = await params
  const [doc, topics] = await Promise.all([
    getDocById(id),
    getTopicsWithHierarchy(),
  ])

  if (!doc) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Edit Document</h1>
        <p className="text-muted-foreground">
          Update &quot;{doc.title}&quot;
        </p>
      </div>

      <DocEditor doc={doc} topics={topics} />
    </div>
  )
}
```

### 4.5 Doc Editor Component
```tsx
// components/admin/docs/doc-editor.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { docSchema, type DocInput } from '@/lib/schemas/doc'
import { createDoc, updateDoc } from '@/lib/actions/docs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Save } from 'lucide-react'
import type { Doc, DocTopic } from '@/lib/db/schema'

const BlockNoteEditor = dynamic(
  () => import('@/components/editor/block-editor').then((mod) => mod.BlockEditor),
  { ssr: false, loading: () => <div className="h-[400px] animate-pulse bg-muted rounded-lg" /> }
)

interface DocEditorProps {
  doc?: Doc
  topics: DocTopic[]
}

export function DocEditor({ doc, topics }: DocEditorProps) {
  const router = useRouter()
  const [content, setContent] = useState(doc?.content || '')
  const [contentJson, setContentJson] = useState(doc?.contentJson || null)

  const form = useForm<DocInput>({
    resolver: zodResolver(docSchema),
    defaultValues: {
      title: doc?.title || '',
      slug: doc?.slug || '',
      excerpt: doc?.excerpt || '',
      topicId: doc?.topicId || null,
      order: doc?.order || 0,
      published: doc?.published || false,
      metaTitle: doc?.metaTitle || '',
      metaDescription: doc?.metaDescription || '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  // Auto-generate slug
  const title = form.watch('title')
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    form.setValue('slug', slug)
  }

  async function onSubmit(data: DocInput) {
    const payload = {
      ...data,
      content,
      contentJson,
    }

    if (doc) {
      await updateDoc(doc.id, payload)
    } else {
      await createDoc(payload)
    }

    router.push('/admin/docs')
  }

  // Flatten topics for select
  function flattenTopics(topics: DocTopic[], level = 0): { id: string; name: string; level: number }[] {
    return topics.flatMap((topic) => [
      { id: topic.id, name: topic.name, level },
      ...(topic.children ? flattenTopics(topic.children, level + 1) : []),
    ])
  }

  const flatTopics = flattenTopics(topics)

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="content">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Introduction"
                      {...field}
                      onBlur={generateSlug}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <span className="flex items-center text-sm text-muted-foreground">
                        /docs/
                      </span>
                      <Input placeholder="introduction" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel>Content</FormLabel>
              <div className="min-h-[400px] rounded-lg border">
                <BlockNoteEditor
                  initialContent={contentJson}
                  onChange={(json, markdown) => {
                    setContentJson(json)
                    setContent(markdown)
                  }}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description..."
                      className="resize-none"
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <FormField
              control={form.control}
              name="topicId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Topic</FormLabel>
                  <Select
                    value={field.value || 'none'}
                    onValueChange={(v) => field.onChange(v === 'none' ? null : v)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">No Topic</SelectItem>
                      {flatTopics.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {'—'.repeat(t.level)} {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                  </FormControl>
                  <FormDescription>
                    Position within the topic (lower = earlier)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel>Published</FormLabel>
                    <FormDescription>
                      Make this document visible
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="SEO title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="SEO description"
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              {doc ? 'Update' : 'Create'} Document
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
```

---

## 5. Server Actions

### 5.1 Docs Server Actions
```typescript
// lib/actions/docs.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { docTopics, docs } from '@/lib/db/schema'
import { eq, max } from 'drizzle-orm'
import { isAdmin } from '@/lib/auth/get-user'

// Topics

export async function createTopic(data: {
  name: string
  slug: string
  icon?: string
  parentId: string | null
}) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Get max order
  const [maxOrder] = await db
    .select({ max: max(docTopics.order) })
    .from(docTopics)

  await db.insert(docTopics).values({
    ...data,
    order: (maxOrder?.max || 0) + 1,
  })

  revalidatePath('/docs')
  revalidatePath('/admin/docs/topics')
  redirect('/admin/docs/topics')
}

export async function updateTopic(
  id: string,
  data: Partial<{ name: string; slug: string; icon: string; parentId: string | null }>
) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  await db.update(docTopics).set(data).where(eq(docTopics.id, id))

  revalidatePath('/docs')
  revalidatePath('/admin/docs/topics')
}

export async function deleteTopic(id: string) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  await db.delete(docTopics).where(eq(docTopics.id, id))

  revalidatePath('/docs')
  revalidatePath('/admin/docs/topics')
}

export async function reorderTopics(items: { id: string; order: number }[]) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  await Promise.all(
    items.map(({ id, order }) =>
      db.update(docTopics).set({ order }).where(eq(docTopics.id, id))
    )
  )

  revalidatePath('/docs')
  revalidatePath('/admin/docs/topics')
}

// Docs

export async function createDoc(data: {
  title: string
  slug: string
  content: string
  contentJson: any
  excerpt?: string
  topicId: string | null
  order: number
  published: boolean
  metaTitle?: string
  metaDescription?: string
}) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  await db.insert(docs).values(data)

  revalidatePath('/docs')
  revalidatePath('/admin/docs')
  redirect('/admin/docs')
}

export async function updateDoc(
  id: string,
  data: Partial<{
    title: string
    slug: string
    content: string
    contentJson: any
    excerpt: string
    topicId: string | null
    order: number
    published: boolean
    metaTitle: string
    metaDescription: string
  }>
) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  await db
    .update(docs)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(docs.id, id))

  revalidatePath('/docs')
  revalidatePath('/admin/docs')
}

export async function deleteDoc(id: string) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  await db.delete(docs).where(eq(docs.id, id))

  revalidatePath('/docs')
  revalidatePath('/admin/docs')
}
```

---

## Next Steps

See [07-feature-admin-dashboard.md](./07-feature-admin-dashboard.md) for admin dashboard.
