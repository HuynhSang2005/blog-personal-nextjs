# Feature: Admin Dashboard - Blog Personal Next.js

> **For Claude/Copilot:** Implement the admin dashboard with all management features.

**Goal:** Build a comprehensive admin dashboard for content management, analytics, and settings.

**Last Updated:** 2026-01-30

---

## 1. Admin Dashboard Overview

### 1.1 Feature Map
```
┌─────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  SIDEBAR NAVIGATION                                         │
│  ├─ Dashboard (Overview)                                    │
│  ├─ Blog Posts                                              │
│  │   ├─ All Posts                                           │
│  │   └─ New Post                                            │
│  ├─ Documentation                                           │
│  │   ├─ All Docs                                            │
│  │   ├─ Topics                                              │
│  │   └─ New Doc                                             │
│  ├─ Media                                                   │
│  │   └─ Media Library                                       │
│  └─ Settings                                                │
│      ├─ General                                             │
│      ├─ SEO                                                 │
│      └─ Profile                                             │
│                                                              │
│  DASHBOARD OVERVIEW                                         │
│  ├─ Stats Cards (Blogs, Docs, Views, Media)                │
│  ├─ Views Chart (Last 30 days)                             │
│  ├─ Recent Posts Table                                      │
│  └─ Quick Actions                                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Route Structure
```
app/(admin)/
├── layout.tsx          # Admin shell with sidebar
├── admin/
│   ├── page.tsx        # Dashboard overview
│   ├── blog/
│   │   ├── page.tsx    # Blog list
│   │   ├── new/page.tsx
│   │   └── [id]/edit/page.tsx
│   ├── docs/
│   │   ├── page.tsx    # Docs list
│   │   ├── new/page.tsx
│   │   ├── [id]/edit/page.tsx
│   │   └── topics/
│   │       ├── page.tsx
│   │       ├── new/page.tsx
│   │       └── [id]/edit/page.tsx
│   ├── media/
│   │   └── page.tsx    # Media library
│   └── settings/
│       ├── page.tsx    # General settings
│       ├── seo/page.tsx
│       └── profile/page.tsx
```

---

## 2. Admin Layout

### 2.1 Admin Layout Component
```tsx
// app/(admin)/layout.tsx
import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/get-user'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminHeader } from '@/components/admin/admin-header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div className="flex flex-1 flex-col pl-64">
        <AdminHeader />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
```

### 2.2 Admin Sidebar
```tsx
// components/admin/admin-sidebar.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Image,
  Settings,
  ChevronDown,
  PenLine,
  FolderTree,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Blog',
    icon: FileText,
    children: [
      { name: 'All Posts', href: '/admin/blog' },
      { name: 'New Post', href: '/admin/blog/new' },
    ],
  },
  {
    name: 'Docs',
    icon: BookOpen,
    children: [
      { name: 'All Docs', href: '/admin/docs' },
      { name: 'Topics', href: '/admin/docs/topics' },
      { name: 'New Doc', href: '/admin/docs/new' },
    ],
  },
  {
    name: 'Media',
    href: '/admin/media',
    icon: Image,
  },
  {
    name: 'Settings',
    icon: Settings,
    children: [
      { name: 'General', href: '/admin/settings' },
      { name: 'SEO', href: '/admin/settings/seo' },
      { name: 'Profile', href: '/admin/settings/profile' },
    ],
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-background">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <PenLine className="h-6 w-6" />
          <span>Blog Admin</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="space-y-1 p-4">
        {navigation.map((item) =>
          item.children ? (
            <NavGroup key={item.name} item={item} pathname={pathname} />
          ) : (
            <NavLink key={item.name} item={item} pathname={pathname} />
          )
        )}
      </nav>
    </aside>
  )
}

function NavLink({
  item,
  pathname,
}: {
  item: { name: string; href: string; icon: any }
  pathname: string
}) {
  const isActive = pathname === item.href

  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
        isActive
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <item.icon className="h-4 w-4" />
      {item.name}
    </Link>
  )
}

function NavGroup({
  item,
  pathname,
}: {
  item: {
    name: string
    icon: any
    children: { name: string; href: string }[]
  }
  pathname: string
}) {
  const isActive = item.children.some((child) => pathname.startsWith(child.href))
  const [isOpen, setIsOpen] = useState(isActive)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-between',
            isActive && 'bg-muted'
          )}
        >
          <span className="flex items-center gap-3">
            <item.icon className="h-4 w-4" />
            {item.name}
          </span>
          <ChevronDown
            className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="pl-9 pt-1">
        {item.children.map((child) => (
          <Link
            key={child.href}
            href={child.href}
            className={cn(
              'block rounded-lg px-3 py-2 text-sm transition-colors',
              pathname === child.href
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )}
          >
            {child.name}
          </Link>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
```

### 2.3 Admin Header
```tsx
// components/admin/admin-header.tsx
import { getCurrentUser } from '@/lib/auth/get-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ThemeModeToggle } from '@/components/theme-mode-toggle'
import { LogOut, User, ExternalLink } from 'lucide-react'
import { signOut } from '@/lib/actions/auth'
import Link from 'next/link'

export async function AdminHeader() {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Left side - Breadcrumbs would go here */}
      <div />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* View Site */}
        <Button variant="outline" size="sm" asChild>
          <Link href="/" target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            View Site
          </Link>
        </Button>

        {/* Theme Toggle */}
        <ThemeModeToggle />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Admin</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/admin/settings/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <form action={signOut}>
                <button className="flex w-full items-center">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
```

---

## 3. Dashboard Overview Page

### 3.1 Dashboard Page
```tsx
// app/(admin)/admin/page.tsx
import { Suspense } from 'react'
import { StatsCards } from '@/components/admin/dashboard/stats-cards'
import { ViewsChart } from '@/components/admin/dashboard/views-chart'
import { RecentPosts } from '@/components/admin/dashboard/recent-posts'
import { QuickActions } from '@/components/admin/dashboard/quick-actions'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here&apos;s an overview of your site.
        </p>
      </div>

      {/* Stats Cards */}
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCards />
      </Suspense>

      {/* Charts & Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Views Chart */}
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <ViewsChart />
        </Suspense>

        {/* Recent Posts */}
        <Suspense fallback={<Skeleton className="h-[400px]" />}>
          <RecentPosts />
        </Suspense>
      </div>

      {/* Quick Actions */}
      <QuickActions />
    </div>
  )
}

function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-[120px]" />
      ))}
    </div>
  )
}
```

### 3.2 Stats Cards Component
```tsx
// components/admin/dashboard/stats-cards.tsx
import { getDashboardStats } from '@/lib/db/queries/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, BookOpen, Eye, Image } from 'lucide-react'

export async function StatsCards() {
  const stats = await getDashboardStats()

  const cards = [
    {
      title: 'Total Posts',
      value: stats.totalBlogs,
      change: stats.blogsThisMonth,
      changeLabel: 'this month',
      icon: FileText,
    },
    {
      title: 'Total Docs',
      value: stats.totalDocs,
      change: stats.docsThisMonth,
      changeLabel: 'this month',
      icon: BookOpen,
    },
    {
      title: 'Total Views',
      value: stats.totalViews,
      change: stats.viewsThisMonth,
      changeLabel: 'this month',
      icon: Eye,
    },
    {
      title: 'Media Files',
      value: stats.totalMedia,
      change: stats.mediaThisMonth,
      changeLabel: 'this month',
      icon: Image,
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {card.value.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +{card.change} {card.changeLabel}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
```

### 3.3 Dashboard Stats Query
```typescript
// lib/db/queries/dashboard.ts
import { db } from '@/lib/db'
import { blogs, docs, media } from '@/lib/db/schema'
import { count, sum, gte, and, sql } from 'drizzle-orm'

export async function getDashboardStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Total counts
  const [blogCount] = await db.select({ count: count() }).from(blogs)
  const [docCount] = await db.select({ count: count() }).from(docs)
  const [mediaCount] = await db.select({ count: count() }).from(media)
  const [viewsSum] = await db.select({ total: sum(blogs.viewCount) }).from(blogs)

  // This month counts
  const [blogsMonth] = await db
    .select({ count: count() })
    .from(blogs)
    .where(gte(blogs.createdAt, startOfMonth))

  const [docsMonth] = await db
    .select({ count: count() })
    .from(docs)
    .where(gte(docs.createdAt, startOfMonth))

  const [mediaMonth] = await db
    .select({ count: count() })
    .from(media)
    .where(gte(media.createdAt, startOfMonth))

  // Views this month (would need a separate views tracking table for accuracy)
  // For now, approximate with recent posts' views
  const [viewsMonth] = await db
    .select({ total: sum(blogs.viewCount) })
    .from(blogs)
    .where(gte(blogs.publishedAt, startOfMonth))

  return {
    totalBlogs: blogCount?.count || 0,
    totalDocs: docCount?.count || 0,
    totalMedia: mediaCount?.count || 0,
    totalViews: Number(viewsSum?.total) || 0,
    blogsThisMonth: blogsMonth?.count || 0,
    docsThisMonth: docsMonth?.count || 0,
    mediaThisMonth: mediaMonth?.count || 0,
    viewsThisMonth: Number(viewsMonth?.total) || 0,
  }
}

export async function getViewsChartData() {
  // Get daily views for last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // This would ideally come from a dedicated views tracking table
  // For simplicity, returning mock data structure
  const result = await db.execute(sql`
    SELECT 
      DATE(created_at) as date,
      SUM(view_count) as views
    FROM blogs
    WHERE created_at >= ${thirtyDaysAgo.toISOString()}
    GROUP BY DATE(created_at)
    ORDER BY date
  `)

  return result.rows.map((row: any) => ({
    date: row.date,
    views: Number(row.views) || 0,
  }))
}
```

### 3.4 Views Chart Component
```tsx
// components/admin/dashboard/views-chart.tsx
'use client'

import { useEffect, useState } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const chartConfig = {
  views: {
    label: 'Views',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export function ViewsChart() {
  const [data, setData] = useState<{ date: string; views: number }[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats/views')
      .then((res) => res.json())
      .then((data) => setData(data))
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Page Views</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] animate-pulse bg-muted" />
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Views</CardTitle>
        <CardDescription>Last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) =>
                new Date(value).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="views"
              stroke="var(--color-views)"
              fill="var(--color-views)"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
```

### 3.5 Recent Posts Component
```tsx
// components/admin/dashboard/recent-posts.tsx
import Link from 'next/link'
import { getRecentBlogs } from '@/lib/db/queries/blogs'
import { formatDate } from '@/lib/utils/date'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil, Eye } from 'lucide-react'

export async function RecentPosts() {
  const posts = await getRecentBlogs(5)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Posts</CardTitle>
        <CardDescription>Your latest blog posts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">No posts yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex-1 space-y-1 overflow-hidden">
                <p className="truncate font-medium">{post.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{formatDate(post.createdAt)}</span>
                  <Badge
                    variant={post.published ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {post.published ? 'Published' : 'Draft'}
                  </Badge>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {post.viewCount}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" asChild>
                <Link href={`/admin/blog/${post.id}/edit`}>
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          ))
        )}

        <Button variant="outline" className="w-full" asChild>
          <Link href="/admin/blog">View All Posts</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
```

### 3.6 Quick Actions Component
```tsx
// components/admin/dashboard/quick-actions.tsx
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PenLine, BookOpen, Image, Settings } from 'lucide-react'

const actions = [
  {
    title: 'New Blog Post',
    description: 'Create a new blog post',
    href: '/admin/blog/new',
    icon: PenLine,
  },
  {
    title: 'New Document',
    description: 'Add documentation',
    href: '/admin/docs/new',
    icon: BookOpen,
  },
  {
    title: 'Upload Media',
    description: 'Add images or videos',
    href: '/admin/media',
    icon: Image,
  },
  {
    title: 'Site Settings',
    description: 'Configure your site',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((action) => (
            <Button
              key={action.href}
              variant="outline"
              className="h-auto flex-col gap-2 p-4"
              asChild
            >
              <Link href={action.href}>
                <action.icon className="h-6 w-6" />
                <span className="font-medium">{action.title}</span>
                <span className="text-xs text-muted-foreground">
                  {action.description}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 4. Media Library

### 4.1 Media Page
```tsx
// app/(admin)/admin/media/page.tsx
import { Suspense } from 'react'
import { getAllMedia } from '@/lib/db/queries/media'
import { MediaGrid } from '@/components/admin/media/media-grid'
import { MediaUploadZone } from '@/components/admin/media/media-upload-zone'
import { Skeleton } from '@/components/ui/skeleton'

export default async function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Media Library</h1>
        <p className="text-muted-foreground">
          Upload and manage your images and videos
        </p>
      </div>

      {/* Upload Zone */}
      <MediaUploadZone />

      {/* Media Grid */}
      <Suspense fallback={<MediaGridSkeleton />}>
        <MediaGridWrapper />
      </Suspense>
    </div>
  )
}

async function MediaGridWrapper() {
  const media = await getAllMedia()
  return <MediaGrid media={media} />
}

function MediaGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-square rounded-lg" />
      ))}
    </div>
  )
}
```

### 4.2 Media Upload Zone
```tsx
// components/admin/media/media-upload-zone.tsx
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadMedia } from '@/lib/actions/media'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Upload, X, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'complete' | 'error'
  error?: string
}

export function MediaUploadZone() {
  const [uploads, setUploads] = useState<UploadingFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // Add files to upload queue
    const newUploads = acceptedFiles.map((file) => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }))
    setUploads((prev) => [...prev, ...newUploads])

    // Upload each file
    for (const upload of newUploads) {
      try {
        const formData = new FormData()
        formData.append('file', upload.file)
        
        await uploadMedia(formData)

        // Mark as complete
        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file ? { ...u, progress: 100, status: 'complete' } : u
          )
        )
      } catch (error) {
        setUploads((prev) =>
          prev.map((u) =>
            u.file === upload.file
              ? { ...u, status: 'error', error: 'Upload failed' }
              : u
          )
        )
      }
    }

    // Clear completed uploads after delay
    setTimeout(() => {
      setUploads((prev) => prev.filter((u) => u.status !== 'complete'))
    }, 3000)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'video/*': ['.mp4', '.webm'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  })

  return (
    <div className="space-y-4">
      <Card
        {...getRootProps()}
        className={cn(
          'cursor-pointer border-2 border-dashed transition-colors',
          isDragActive && 'border-primary bg-primary/5'
        )}
      >
        <CardContent className="flex flex-col items-center justify-center gap-2 py-8">
          <input {...getInputProps()} />
          <Upload className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {isDragActive
              ? 'Drop files here...'
              : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground">
            Supports: PNG, JPG, GIF, WebP, MP4, WebM (max 10MB)
          </p>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map((upload, index) => (
            <div
              key={index}
              className="flex items-center gap-4 rounded-lg border p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                {upload.status === 'uploading' && (
                  <Progress value={upload.progress} className="mt-1 h-1" />
                )}
                {upload.status === 'error' && (
                  <p className="text-xs text-destructive">{upload.error}</p>
                )}
              </div>
              {upload.status === 'complete' && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {upload.status === 'error' && (
                <X className="h-5 w-5 text-destructive" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### 4.3 Media Grid
```tsx
// components/admin/media/media-grid.tsx
'use client'

import { useState } from 'react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import { formatBytes } from '@/lib/utils/format'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, Trash2, ExternalLink, Play } from 'lucide-react'
import { deleteMedia } from '@/lib/actions/media'
import type { Media } from '@/lib/db/schema'

interface MediaGridProps {
  media: Media[]
}

export function MediaGrid({ media }: MediaGridProps) {
  const [selected, setSelected] = useState<Media | null>(null)

  if (media.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg text-muted-foreground">No media files yet</p>
        <p className="text-sm text-muted-foreground">
          Upload some images or videos to get started
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {media.map((item) => (
          <MediaCard
            key={item.id}
            media={item}
            onClick={() => setSelected(item)}
          />
        ))}
      </div>

      {/* Media Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.filename}</DialogTitle>
                <DialogDescription>
                  Uploaded {formatDate(selected.createdAt)}
                </DialogDescription>
              </DialogHeader>

              {/* Preview */}
              <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
                {selected.type === 'image' ? (
                  <Image
                    src={selected.url}
                    alt={selected.altText || selected.filename}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <video
                    src={selected.url}
                    controls
                    className="h-full w-full object-contain"
                  />
                )}
              </div>

              {/* Details */}
              <div className="space-y-4">
                <div>
                  <Label>URL</Label>
                  <div className="flex gap-2">
                    <Input value={selected.url} readOnly />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigator.clipboard.writeText(selected.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <a href={selected.url} target="_blank" rel="noopener">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatBytes(selected.size)}</span>
                  <span>
                    {selected.width}×{selected.height}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex justify-end">
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await deleteMedia(selected.id)
                      setSelected(null)
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

function MediaCard({
  media,
  onClick,
}: {
  media: Media
  onClick: () => void
}) {
  return (
    <Card
      className="cursor-pointer overflow-hidden transition-shadow hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="relative aspect-square bg-muted">
          {media.type === 'image' ? (
            <Image
              src={media.url}
              alt={media.altText || media.filename}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Play className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="p-2">
          <p className="truncate text-xs font-medium">{media.filename}</p>
          <p className="text-xs text-muted-foreground">
            {formatBytes(media.size)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

### 4.4 Media Server Actions
```typescript
// lib/actions/media.ts
'use server'

import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { media } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { isAdmin } from '@/lib/auth/get-user'
import { uploadToCloudinary, deleteFromCloudinary } from '@/lib/cloudinary'

export async function uploadMedia(formData: FormData) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  const file = formData.get('file') as File
  if (!file) throw new Error('No file provided')

  // Upload to Cloudinary
  const result = await uploadToCloudinary(file)

  // Save to database
  await db.insert(media).values({
    filename: file.name,
    url: result.secure_url,
    publicId: result.public_id,
    type: file.type.startsWith('image') ? 'image' : 'video',
    size: file.size,
    width: result.width,
    height: result.height,
    format: result.format,
  })

  revalidatePath('/admin/media')
}

export async function deleteMedia(id: string) {
  const admin = await isAdmin()
  if (!admin) throw new Error('Unauthorized')

  // Get media record
  const [mediaItem] = await db
    .select()
    .from(media)
    .where(eq(media.id, id))
    .limit(1)

  if (!mediaItem) throw new Error('Media not found')

  // Delete from Cloudinary
  await deleteFromCloudinary(mediaItem.publicId)

  // Delete from database
  await db.delete(media).where(eq(media.id, id))

  revalidatePath('/admin/media')
}
```

---

## 5. Settings Pages

### 5.1 General Settings Page
```tsx
// app/(admin)/admin/settings/page.tsx
import { getSiteSettings } from '@/lib/db/queries/settings'
import { GeneralSettingsForm } from '@/components/admin/settings/general-settings-form'

export default async function SettingsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">General Settings</h1>
        <p className="text-muted-foreground">
          Configure your site settings
        </p>
      </div>

      <GeneralSettingsForm settings={settings} />
    </div>
  )
}
```

### 5.2 General Settings Form
```tsx
// components/admin/settings/general-settings-form.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { updateSiteSettings } from '@/lib/actions/settings'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Save } from 'lucide-react'
import { ImageUploader } from '@/components/admin/media/image-uploader'
import type { SiteSettings } from '@/lib/db/schema'

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Site name is required'),
  siteDescription: z.string().optional(),
  siteUrl: z.string().url('Must be a valid URL'),
  logo: z.string().optional(),
  favicon: z.string().optional(),
  socialTwitter: z.string().optional(),
  socialGithub: z.string().optional(),
  socialLinkedin: z.string().optional(),
})

type SettingsInput = z.infer<typeof settingsSchema>

interface GeneralSettingsFormProps {
  settings: SiteSettings | null
}

export function GeneralSettingsForm({ settings }: GeneralSettingsFormProps) {
  const form = useForm<SettingsInput>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteName: settings?.siteName || '',
      siteDescription: settings?.siteDescription || '',
      siteUrl: settings?.siteUrl || '',
      logo: settings?.logo || '',
      favicon: settings?.favicon || '',
      socialTwitter: settings?.socialTwitter || '',
      socialGithub: settings?.socialGithub || '',
      socialLinkedin: settings?.socialLinkedin || '',
    },
  })

  const isSubmitting = form.formState.isSubmitting

  async function onSubmit(data: SettingsInput) {
    await updateSiteSettings(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Site Info */}
        <Card>
          <CardHeader>
            <CardTitle>Site Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="siteName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Blog" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A blog about..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="siteUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Branding */}
        <Card>
          <CardHeader>
            <CardTitle>Branding</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo</FormLabel>
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
              name="favicon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Favicon</FormLabel>
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
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social Links</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="socialTwitter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Twitter/X</FormLabel>
                  <FormControl>
                    <Input placeholder="https://twitter.com/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialGithub"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="socialLinkedin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn</FormLabel>
                  <FormControl>
                    <Input placeholder="https://linkedin.com/in/username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </Button>
      </form>
    </Form>
  )
}
```

---

## Next Steps

See [08-seo-nextjs.md](./08-seo-nextjs.md) for SEO implementation.
