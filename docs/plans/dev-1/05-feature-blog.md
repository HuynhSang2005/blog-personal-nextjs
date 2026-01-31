# Feature: Blog System - Blog Personal Next.js

> **For Claude/Copilot:** Implement all blog features as specified. Focus on performance and UX.

**Goal:** Build a complete blog system with CRUD, rich editor, markdown rendering, media, and public display.

**Last Updated:** 2026-01-30

---

## 1. Blog Feature Overview

### 1.1 Feature Map
```
┌─────────────────────────────────────────────────────────────┐
│                      BLOG SYSTEM                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  PUBLIC FEATURES              ADMIN FEATURES                │
│  ├─ Blog List Page            ├─ Blog List (Admin)          │
│  │  ├─ Blog Cards (max 5)     │  ├─ CRUD Operations         │
│  │  ├─ Search Bar             │  └─ Status Management       │
│  │  ├─ Filter (date)          │                             │
│  │  └─ Pagination             ├─ Blog Editor                │
│  │                            │  ├─ BlockNote Rich Editor   │
│  ├─ Blog Detail Page          │  ├─ Media Upload            │
│  │  ├─ Markdown Content       │  ├─ Tag Management          │
│  │  ├─ Table of Contents      │  ├─ SEO Fields              │
│  │  ├─ Author Info            │  └─ Preview Mode            │
│  │  ├─ View Count             │                             │
│  │  ├─ Tags                   └─ Media Manager              │
│  │  ├─ Updated Date           │  ├─ Upload Images           │
│  │  └─ Media (image/video)    │  └─ Browse Media            │
│  │                            │                             │
│  └─ RSS Feed                  └─ Analytics (view counts)    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Requirements Summary
| Feature | Description | Priority |
|---------|-------------|----------|
| Blog List | Display blog cards with pagination | High |
| Search | Search by title/content | High |
| Filter | Filter by date (newest, oldest, range) | Medium |
| Blog Detail | Full markdown content with TOC | High |
| Rich Editor | BlockNote for content editing | High |
| Media | Image/video in content via Cloudinary | High |
| Tags | Categorize blogs with tags | Medium |
| View Count | Track and display views | Medium |
| RSS Feed | Generate RSS/Atom feeds | Low |

---

## 2. Public Blog Pages

### 2.1 Blog List Page
```tsx
// app/(public)/[locale]/blog/page.tsx
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { BlogList } from '@/components/blog/blog-list'
import { BlogSearch } from '@/components/blog/blog-search'
import { BlogFilters } from '@/components/blog/blog-filters'
import { Skeleton } from '@/components/ui/skeleton'

interface BlogPageProps {
  searchParams: Promise<{
    search?: string
    sort?: 'newest' | 'oldest'
    from?: string
    to?: string
    page?: string
  }>
}

export async function generateMetadata() {
  const t = await getTranslations('blog')
  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const params = await searchParams
  const t = await getTranslations('blog')

  return (
    <div className="container py-10">
      {/* Header */}
      <div className="mb-8 space-y-4">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="text-lg text-muted-foreground">{t('subtitle')}</p>
      </div>

      {/* Search & Filters */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <BlogSearch defaultValue={params.search} />
        <BlogFilters 
          sort={params.sort} 
          from={params.from} 
          to={params.to} 
        />
      </div>

      {/* Blog List */}
      <Suspense fallback={<BlogListSkeleton />}>
        <BlogList 
          search={params.search}
          sort={params.sort || 'newest'}
          from={params.from}
          to={params.to}
          page={Number(params.page) || 1}
        />
      </Suspense>
    </div>
  )
}

function BlogListSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[300px] rounded-lg" />
      ))}
    </div>
  )
}
```

### 2.2 Blog List Component
```tsx
// components/blog/blog-list.tsx
import { getPublishedBlogs } from '@/lib/db/queries/blogs'
import { BlogCard } from './blog-card'
import { BlogPagination } from './blog-pagination'

interface BlogListProps {
  search?: string
  sort: 'newest' | 'oldest'
  from?: string
  to?: string
  page: number
}

const BLOGS_PER_PAGE = 5

export async function BlogList({ search, sort, from, to, page }: BlogListProps) {
  const { blogs, total } = await getPublishedBlogs({
    search,
    sort,
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
    limit: BLOGS_PER_PAGE,
    offset: (page - 1) * BLOGS_PER_PAGE,
  })

  if (blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">No blogs found</p>
      </div>
    )
  }

  const totalPages = Math.ceil(total / BLOGS_PER_PAGE)

  return (
    <div className="space-y-8">
      {/* Blog Grid - Max 5 cards per section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blogs.map((blog) => (
          <BlogCard key={blog.id} blog={blog} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <BlogPagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  )
}
```

### 2.3 Blog Card Component
```tsx
// components/blog/blog-card.tsx
import Link from 'next/link'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Eye, Calendar } from 'lucide-react'
import type { Blog, Profile, Tag } from '@/lib/db/schema'

interface BlogCardProps {
  blog: Blog & {
    author: Pick<Profile, 'name' | 'avatarUrl'> | null
    tags: Tag[]
  }
}

export function BlogCard({ blog }: BlogCardProps) {
  return (
    <Card className="flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      {/* Featured Image */}
      {blog.featuredImage && (
        <Link href={`/blog/${blog.slug}`}>
          <div className="relative aspect-video">
            <Image
              src={blog.featuredImage}
              alt={blog.featuredImageAlt || blog.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </Link>
      )}

      <CardHeader className="flex-1">
        {/* Tags */}
        {blog.tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {blog.tags.slice(0, 3).map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        {/* Title */}
        <Link href={`/blog/${blog.slug}`} className="hover:underline">
          <h2 className="line-clamp-2 text-xl font-semibold">{blog.title}</h2>
        </Link>

        {/* Excerpt */}
        {blog.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
            {blog.excerpt}
          </p>
        )}
      </CardHeader>

      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center justify-between">
          {/* Author */}
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={blog.author?.avatarUrl || undefined} />
              <AvatarFallback>
                {blog.author?.name?.charAt(0) || 'A'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-muted-foreground">
              {blog.author?.name || 'Admin'}
            </span>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(blog.publishedAt || blog.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {blog.viewCount}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
```

### 2.4 Blog Search Component
```tsx
// components/blog/blog-search.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Search, Loader2 } from 'lucide-react'
import { useDebounce } from '@/lib/hooks/use-debounce'

interface BlogSearchProps {
  defaultValue?: string
}

export function BlogSearch({ defaultValue = '' }: BlogSearchProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [value, setValue] = useState(defaultValue)
  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedValue) {
      params.set('search', debouncedValue)
    } else {
      params.delete('search')
    }
    params.delete('page') // Reset to page 1 on search

    startTransition(() => {
      router.push(`?${params.toString()}`)
    })
  }, [debouncedValue, router, searchParams])

  return (
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search blogs..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="pl-9"
      />
      {isPending && (
        <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
      )}
    </div>
  )
}
```

### 2.5 Blog Filters Component
```tsx
// components/blog/blog-filters.tsx
'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'

interface BlogFiltersProps {
  sort?: string
  from?: string
  to?: string
}

export function BlogFilters({ sort = 'newest', from, to }: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const updateParams = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
    })
    params.delete('page')
    
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    router.push('/blog')
  }

  const hasFilters = from || to || sort !== 'newest'

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Sort */}
      <Select
        value={sort}
        onValueChange={(value) => updateParams({ sort: value })}
      >
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest first</SelectItem>
          <SelectItem value="oldest">Oldest first</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range */}
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <CalendarIcon className="h-4 w-4" />
            {from && to ? (
              <>
                {format(new Date(from), 'MMM d')} - {format(new Date(to), 'MMM d')}
              </>
            ) : (
              'Date range'
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: from ? new Date(from) : undefined,
              to: to ? new Date(to) : undefined,
            }}
            onSelect={(range) => {
              updateParams({
                from: range?.from?.toISOString().split('T')[0],
                to: range?.to?.toISOString().split('T')[0],
              })
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Clear */}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
```

---

## 3. Blog Detail Page

### 3.1 Blog Detail Page
```tsx
// app/(public)/[locale]/blog/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getBlogBySlug, incrementViewCount } from '@/lib/db/queries/blogs'
import { BlogContent } from '@/components/blog/blog-content'
import { BlogTOC } from '@/components/blog/blog-toc'
import { BlogHeader } from '@/components/blog/blog-header'
import { Skeleton } from '@/components/ui/skeleton'

interface BlogDetailPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)
  
  if (!blog) return {}

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    openGraph: {
      title: blog.title,
      description: blog.excerpt || undefined,
      images: blog.featuredImage ? [blog.featuredImage] : undefined,
    },
  }
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    notFound()
  }

  // Increment view count (fire and forget)
  incrementViewCount(slug)

  return (
    <div className="container py-10">
      <article className="mx-auto max-w-4xl">
        {/* Header */}
        <BlogHeader blog={blog} />

        {/* Content with TOC */}
        <div className="mt-8 lg:grid lg:grid-cols-[1fr_250px] lg:gap-8">
          {/* Main Content */}
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <Suspense fallback={<Skeleton className="h-[500px]" />}>
              <BlogContent content={blog.content} />
            </Suspense>
          </div>

          {/* Table of Contents */}
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <BlogTOC content={blog.content} />
            </div>
          </aside>
        </div>
      </article>
    </div>
  )
}
```

### 3.2 Blog Header Component
```tsx
// components/blog/blog-header.tsx
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Calendar, Eye, Clock } from 'lucide-react'
import { calculateReadTime } from '@/lib/utils/read-time'
import type { Blog, Profile, Tag } from '@/lib/db/schema'

interface BlogHeaderProps {
  blog: Blog & {
    author: Profile | null
    tags: Tag[]
  }
}

export function BlogHeader({ blog }: BlogHeaderProps) {
  const readTime = calculateReadTime(blog.content)

  return (
    <header className="space-y-6">
      {/* Tags */}
      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        {blog.title}
      </h1>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        {/* Author */}
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={blog.author?.avatarUrl || undefined} />
            <AvatarFallback>
              {blog.author?.name?.charAt(0) || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium text-foreground">
              {blog.author?.name || 'Admin'}
            </p>
            <p className="text-xs">Author</p>
          </div>
        </div>

        <span className="text-border">|</span>

        {/* Date */}
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formatDate(blog.publishedAt || blog.createdAt)}
        </span>

        {/* Read Time */}
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {readTime} min read
        </span>

        {/* Views */}
        <span className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          {blog.viewCount} views
        </span>
      </div>

      {/* Featured Image */}
      {blog.featuredImage && (
        <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={blog.featuredImage}
            alt={blog.featuredImageAlt || blog.title}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>
      )}
    </header>
  )
}
```

### 3.3 Blog Content Component (Markdown Rendering)
```tsx
// components/blog/blog-content.tsx
import { processMarkdown } from '@/lib/utils/markdown'

interface BlogContentProps {
  content: string
}

export async function BlogContent({ content }: BlogContentProps) {
  const html = await processMarkdown(content)

  return (
    <div 
      className="prose-headings:scroll-mt-20"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  )
}
```

### 3.4 Table of Contents Component
```tsx
// components/blog/blog-toc.tsx
'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TOCItem {
  id: string
  text: string
  level: number
}

interface BlogTOCProps {
  content: string
}

export function BlogTOC({ content }: BlogTOCProps) {
  const [items, setItems] = useState<TOCItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // Extract headings from content
  useEffect(() => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const matches: TOCItem[] = []
    let match

    while ((match = headingRegex.exec(content)) !== null) {
      const level = match[1].length
      const text = match[2]
      const id = text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

      matches.push({ id, text, level })
    }

    setItems(matches)
  }, [content])

  // Track active heading
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-80px 0% -80% 0%' }
    )

    items.forEach((item) => {
      const element = document.getElementById(item.id)
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className="space-y-2">
      <h3 className="font-semibold">On this page</h3>
      <ul className="space-y-1 text-sm">
        {items.map((item) => (
          <li
            key={item.id}
            style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
          >
            <a
              href={`#${item.id}`}
              className={cn(
                'block py-1 text-muted-foreground transition-colors hover:text-foreground',
                activeId === item.id && 'font-medium text-foreground'
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

---

## 4. Admin Blog Management

### 4.1 Blog Admin List Page
```tsx
// app/(admin)/admin/blog/page.tsx
import { Suspense } from 'react'
import Link from 'next/link'
import { getAllBlogs } from '@/lib/db/queries/blogs'
import { BlogAdminTable } from '@/components/admin/blog/blog-table'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function BlogAdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Blog Posts</h1>
          <p className="text-muted-foreground">
            Manage your blog posts
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus className="mr-2 h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <BlogAdminTableWrapper />
      </Suspense>
    </div>
  )
}

async function BlogAdminTableWrapper() {
  const blogs = await getAllBlogs()
  return <BlogAdminTable blogs={blogs} />
}
```

### 4.2 Blog Admin Table Component
```tsx
// components/admin/blog/blog-table.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { formatDate } from '@/lib/utils/date'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Pencil, Trash2, Eye } from 'lucide-react'
import { deleteBlog } from '@/lib/actions/blog'
import type { Blog } from '@/lib/db/schema'

interface BlogAdminTableProps {
  blogs: Blog[]
}

const columns: ColumnDef<Blog>[] = [
  {
    accessorKey: 'title',
    header: 'Title',
    cell: ({ row }) => (
      <div className="max-w-[300px]">
        <p className="truncate font-medium">{row.getValue('title')}</p>
        <p className="truncate text-xs text-muted-foreground">
          /{row.original.slug}
        </p>
      </div>
    ),
  },
  {
    accessorKey: 'published',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.getValue('published') ? 'default' : 'secondary'}>
        {row.getValue('published') ? 'Published' : 'Draft'}
      </Badge>
    ),
  },
  {
    accessorKey: 'viewCount',
    header: 'Views',
    cell: ({ row }) => row.getValue('viewCount'),
  },
  {
    accessorKey: 'updatedAt',
    header: 'Updated',
    cell: ({ row }) => formatDate(row.getValue('updatedAt')),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/blog/${row.original.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              View
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/blog/${row.original.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => deleteBlog(row.original.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
]

export function BlogAdminTable({ blogs }: BlogAdminTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data: blogs,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      globalFilter,
    },
  })

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search posts..."
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        className="max-w-sm"
      />

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No posts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
```

### 4.3 Blog Editor Page
```tsx
// app/(admin)/admin/blog/new/page.tsx
import { BlogEditor } from '@/components/admin/blog/blog-editor'

export default function NewBlogPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">New Blog Post</h1>
        <p className="text-muted-foreground">
          Create a new blog post
        </p>
      </div>

      <BlogEditor />
    </div>
  )
}
```

### 4.4 Blog Editor Component with BlockNote
```tsx
// components/admin/blog/blog-editor.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import dynamic from 'next/dynamic'
import { blogSchema, type BlogInput } from '@/lib/schemas/blog'
import { createBlog, updateBlog } from '@/lib/actions/blog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ImageUploader } from '@/components/admin/media/image-uploader'
import { TagSelector } from '@/components/admin/blog/tag-selector'
import { Loader2, Save, Eye } from 'lucide-react'
import type { Blog, Tag } from '@/lib/db/schema'

// Dynamic import for BlockNote (client-only)
const BlockNoteEditor = dynamic(
  () => import('@/components/editor/block-editor').then((mod) => mod.BlockEditor),
  { ssr: false, loading: () => <div className="h-[400px] animate-pulse bg-muted rounded-lg" /> }
)

interface BlogEditorProps {
  blog?: Blog & { tags: Tag[] }
}

export function BlogEditor({ blog }: BlogEditorProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [content, setContent] = useState(blog?.content || '')
  const [contentJson, setContentJson] = useState(blog?.contentJson || null)

  const form = useForm<BlogInput>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: blog?.title || '',
      slug: blog?.slug || '',
      excerpt: blog?.excerpt || '',
      featuredImage: blog?.featuredImage || '',
      featuredImageAlt: blog?.featuredImageAlt || '',
      published: blog?.published || false,
      metaTitle: blog?.metaTitle || '',
      metaDescription: blog?.metaDescription || '',
      tags: blog?.tags.map((t) => t.id) || [],
    },
  })

  // Auto-generate slug from title
  const title = form.watch('title')
  const generateSlug = () => {
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    form.setValue('slug', slug)
  }

  async function onSubmit(data: BlogInput) {
    setIsLoading(true)
    
    const payload = {
      ...data,
      content,
      contentJson,
    }

    if (blog) {
      await updateBlog(blog.id, payload)
    } else {
      await createBlog(payload)
    }

    setIsLoading(false)
    router.push('/admin/blog')
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="content" className="space-y-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="My awesome blog post" 
                      {...field} 
                      onBlur={generateSlug}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Slug */}
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <span className="flex items-center text-sm text-muted-foreground">
                        /blog/
                      </span>
                      <Input placeholder="my-awesome-blog-post" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content Editor */}
            <div className="space-y-2">
              <Label>Content</Label>
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

            {/* Excerpt */}
            <FormField
              control={form.control}
              name="excerpt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Excerpt</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="A short summary of the post..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Used in blog cards and meta description if not set.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagSelector
                      selected={field.value}
                      onSelect={(tags) => field.onChange(tags)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Published */}
            <FormField
              control={form.control}
              name="published"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Published</FormLabel>
                    <FormDescription>
                      Make this post visible to the public.
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

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-4">
            <FormField
              control={form.control}
              name="featuredImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Featured Image</FormLabel>
                  <FormControl>
                    <ImageUploader
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="featuredImageAlt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image Alt Text</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Describe the image..."
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="SEO title (defaults to post title)"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/60 characters
                  </FormDescription>
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
                      placeholder="SEO description (defaults to excerpt)"
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value?.length || 0}/160 characters
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {blog ? 'Update' : 'Create'} Post
              </>
            )}
          </Button>
          
          {blog && (
            <Button type="button" variant="outline" asChild>
              <a href={`/blog/${blog.slug}`} target="_blank">
                <Eye className="mr-2 h-4 w-4" />
                Preview
              </a>
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}
```

---

## 5. Blog Actions (Server Actions)

### 5.1 Blog Server Actions
```typescript
// lib/actions/blog.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { blogs, blogTags } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser, isAdmin } from '@/lib/auth/get-user'
import type { BlogInput } from '@/lib/schemas/blog'

export async function createBlog(data: BlogInput & { content: string; contentJson: any }) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const [blog] = await db
    .insert(blogs)
    .values({
      ...data,
      authorId: user.id,
      publishedAt: data.published ? new Date() : null,
    })
    .returning()

  // Insert tags
  if (data.tags.length > 0) {
    await db.insert(blogTags).values(
      data.tags.map((tagId) => ({
        blogId: blog.id,
        tagId,
      }))
    )
  }

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
  redirect('/admin/blog')
}

export async function updateBlog(
  id: string,
  data: Partial<BlogInput> & { content?: string; contentJson?: any }
) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  const [blog] = await db
    .update(blogs)
    .set({
      ...data,
      publishedAt: data.published ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(blogs.id, id))
    .returning()

  // Update tags if provided
  if (data.tags) {
    await db.delete(blogTags).where(eq(blogTags.blogId, id))
    if (data.tags.length > 0) {
      await db.insert(blogTags).values(
        data.tags.map((tagId) => ({
          blogId: id,
          tagId,
        }))
      )
    }
  }

  revalidatePath('/blog')
  revalidatePath(`/blog/${blog.slug}`)
  revalidatePath('/admin/blog')
}

export async function deleteBlog(id: string) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  await db.delete(blogs).where(eq(blogs.id, id))

  revalidatePath('/blog')
  revalidatePath('/admin/blog')
}
```

---

## 6. RSS Feed

### 6.1 RSS Feed Route
```typescript
// app/(public)/[locale]/feed/[feed]/route.ts
import { getPublishedBlogs } from '@/lib/db/queries/blogs'
import { Feed } from 'feed'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ feed: string; locale: string }> }
) {
  const { feed: feedType, locale } = await params
  const { blogs } = await getPublishedBlogs({ limit: 20 })

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const feed = new Feed({
    title: 'Blog Personal',
    description: 'A personal blog about web development',
    id: siteUrl,
    link: siteUrl,
    language: locale,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}`,
    author: {
      name: 'Admin',
    },
  })

  blogs.forEach((blog) => {
    feed.addItem({
      title: blog.title,
      id: `${siteUrl}/blog/${blog.slug}`,
      link: `${siteUrl}/blog/${blog.slug}`,
      description: blog.excerpt || '',
      date: new Date(blog.publishedAt || blog.createdAt),
      image: blog.featuredImage || undefined,
    })
  })

  const contentType = feedType === 'atom' ? 'application/atom+xml' : 'application/rss+xml'
  const content = feedType === 'atom' ? feed.atom1() : feed.rss2()

  return new Response(content, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
```

---

## Next Steps

See [06-feature-docs.md](./06-feature-docs.md) for documentation system.
