# UX Guidelines - Blog Personal Next.js

> **For Claude/Copilot:** Follow these guidelines for consistent, accessible, and responsive UI.

**Goal:** Create a polished, accessible, and consistent user experience across all pages.

**Last Updated:** 2026-01-30

---

## 1. Design System Overview

### 1.1 Design Principles
```
┌─────────────────────────────────────────────────────────────┐
│                     DESIGN PRINCIPLES                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. CLARITY          Content is king, UI supports it        │
│  2. CONSISTENCY      Same patterns everywhere               │
│  3. ACCESSIBILITY    WCAG 2.1 AA compliance minimum         │
│  4. PERFORMANCE      Fast loads, smooth interactions        │
│  5. RESPONSIVENESS   Mobile-first, works everywhere         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Color Palette
```tsx
// tailwind.config.ts colors (via CSS variables)
const colors = {
  // Base
  background: 'hsl(var(--background))',      // Light: white, Dark: #0a0a0a
  foreground: 'hsl(var(--foreground))',      // Light: #0a0a0a, Dark: white
  
  // Card
  card: 'hsl(var(--card))',
  'card-foreground': 'hsl(var(--card-foreground))',
  
  // Primary (Purple accent)
  primary: 'hsl(var(--primary))',            // #8b5cf6
  'primary-foreground': 'hsl(var(--primary-foreground))',
  
  // Secondary
  secondary: 'hsl(var(--secondary))',
  'secondary-foreground': 'hsl(var(--secondary-foreground))',
  
  // Muted
  muted: 'hsl(var(--muted))',
  'muted-foreground': 'hsl(var(--muted-foreground))',
  
  // Accent
  accent: 'hsl(var(--accent))',
  'accent-foreground': 'hsl(var(--accent-foreground))',
  
  // Destructive
  destructive: 'hsl(var(--destructive))',
  'destructive-foreground': 'hsl(var(--destructive-foreground))',
  
  // Border/Input/Ring
  border: 'hsl(var(--border))',
  input: 'hsl(var(--input))',
  ring: 'hsl(var(--ring))',
}
```

### 1.3 Typography Scale
```css
/* Base: 16px */
.text-xs   { font-size: 0.75rem; }    /* 12px */
.text-sm   { font-size: 0.875rem; }   /* 14px */
.text-base { font-size: 1rem; }       /* 16px */
.text-lg   { font-size: 1.125rem; }   /* 18px */
.text-xl   { font-size: 1.25rem; }    /* 20px */
.text-2xl  { font-size: 1.5rem; }     /* 24px */
.text-3xl  { font-size: 1.875rem; }   /* 30px */
.text-4xl  { font-size: 2.25rem; }    /* 36px */
.text-5xl  { font-size: 3rem; }       /* 48px */

/* Line heights */
.leading-tight  { line-height: 1.25; }
.leading-snug   { line-height: 1.375; }
.leading-normal { line-height: 1.5; }
.leading-relaxed { line-height: 1.625; }

/* Font weights */
.font-normal    { font-weight: 400; }
.font-medium    { font-weight: 500; }
.font-semibold  { font-weight: 600; }
.font-bold      { font-weight: 700; }
```

### 1.4 Spacing Scale
```css
/* Base unit: 4px */
.p-1  { padding: 0.25rem; }   /* 4px */
.p-2  { padding: 0.5rem; }    /* 8px */
.p-3  { padding: 0.75rem; }   /* 12px */
.p-4  { padding: 1rem; }      /* 16px */
.p-5  { padding: 1.25rem; }   /* 20px */
.p-6  { padding: 1.5rem; }    /* 24px */
.p-8  { padding: 2rem; }      /* 32px */
.p-10 { padding: 2.5rem; }    /* 40px */
.p-12 { padding: 3rem; }      /* 48px */
```

---

## 2. Component Patterns

### 2.1 Button Variants
```tsx
// Always use shadcn/ui Button component
import { Button } from '@/components/ui/button'

// Variants
<Button variant="default">Primary Action</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>
<Button variant="link">Link Style</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// States
<Button disabled>Disabled</Button>
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>

// With icons
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add Item
</Button>
```

### 2.2 Form Patterns
```tsx
// Always use React Hook Form + Zod + shadcn Form
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

const schema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
})

function MyForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      name: '',
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormDescription>
                We'll never share your email.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
```

### 2.3 Card Patterns
```tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

// Standard Card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content goes here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Interactive Card (clickable)
<Card className="cursor-pointer transition-shadow hover:shadow-lg">
  {/* ... */}
</Card>

// Compact Card (no padding)
<Card>
  <CardContent className="p-0">
    <Image src="..." />
    <div className="p-4">Text content</div>
  </CardContent>
</Card>
```

### 2.4 Dialog Patterns
```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

// Controlled Dialog
function MyDialog() {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Open Dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your profile here.
          </DialogDescription>
        </DialogHeader>
        {/* Content */}
        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Confirmation Dialog (Destructive)
<AlertDialog>
  <AlertDialogTrigger asChild>
    <Button variant="destructive">Delete</Button>
  </AlertDialogTrigger>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### 2.5 Toast Notifications
```tsx
import { toast } from 'sonner'

// Success
toast.success('Changes saved successfully')

// Error
toast.error('Something went wrong')

// With description
toast.success('Post published', {
  description: 'Your post is now live',
})

// With action
toast.success('Post deleted', {
  action: {
    label: 'Undo',
    onClick: () => undoDelete(),
  },
})

// Loading state
const toastId = toast.loading('Saving...')
// ... after operation
toast.success('Saved!', { id: toastId })
```

---

## 3. Layout Patterns

### 3.1 Page Container
```tsx
// Standard container
<div className="container py-10">
  {/* Content */}
</div>

// Narrow container (for article content)
<div className="container max-w-3xl py-10">
  {/* Content */}
</div>

// Wide container (for dashboards)
<div className="container max-w-7xl py-10">
  {/* Content */}
</div>
```

### 3.2 Page Header Pattern
```tsx
// components/page-header.tsx
interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode // Actions
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}

// Usage
<PageHeader 
  title="Blog Posts" 
  description="Manage your blog posts"
>
  <Button asChild>
    <Link href="/admin/blog/new">
      <Plus className="mr-2 h-4 w-4" />
      New Post
    </Link>
  </Button>
</PageHeader>
```

### 3.3 Two-Column Layout (Docs/Blog)
```tsx
// Layout with sidebar
<div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
  {/* Sidebar */}
  <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
    <div className="h-full overflow-y-auto py-6 pr-6 lg:py-8">
      {/* Sidebar content */}
    </div>
  </aside>

  {/* Main content */}
  <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_200px]">
    {/* Article */}
    <div className="mx-auto w-full min-w-0">
      {/* Content */}
    </div>

    {/* TOC (on xl screens) */}
    <aside className="hidden text-sm xl:block">
      <div className="sticky top-16 -mt-10 max-h-[calc(var(--vh)-4rem)] overflow-y-auto pt-10">
        {/* Table of contents */}
      </div>
    </aside>
  </main>
</div>
```

### 3.4 Grid Layouts
```tsx
// Blog Cards Grid (responsive)
<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {posts.map((post) => (
    <BlogCard key={post.id} post={post} />
  ))}
</div>

// Stats Cards Grid
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  {stats.map((stat) => (
    <StatCard key={stat.id} stat={stat} />
  ))}
</div>

// Two-column form
<div className="grid gap-4 md:grid-cols-2">
  <FormField name="firstName" />
  <FormField name="lastName" />
</div>
```

---

## 4. Responsive Design

### 4.1 Breakpoints
```css
/* Tailwind breakpoints */
sm: 640px   /* Small devices */
md: 768px   /* Medium devices */
lg: 1024px  /* Large devices */
xl: 1280px  /* Extra large */
2xl: 1536px /* 2X Extra large */
```

### 4.2 Mobile-First Approach
```tsx
// Start with mobile styles, add breakpoints for larger screens
<div className="
  p-4                        /* Mobile: 16px padding */
  md:p-6                     /* Tablet: 24px padding */
  lg:p-8                     /* Desktop: 32px padding */
">
  <h1 className="
    text-2xl                 /* Mobile: 24px */
    md:text-3xl              /* Tablet: 30px */
    lg:text-4xl              /* Desktop: 36px */
  ">
    Title
  </h1>
</div>
```

### 4.3 Mobile Navigation
```tsx
// components/mobile-nav.tsx
'use client'

import { useState } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <nav className="flex flex-col gap-4">
          <MobileLink href="/" onOpenChange={setOpen}>
            Home
          </MobileLink>
          <MobileLink href="/blog" onOpenChange={setOpen}>
            Blog
          </MobileLink>
          <MobileLink href="/docs" onOpenChange={setOpen}>
            Docs
          </MobileLink>
        </nav>
      </SheetContent>
    </Sheet>
  )
}
```

### 4.4 Responsive Tables
```tsx
// For complex tables, use horizontal scroll on mobile
<div className="overflow-x-auto">
  <Table>
    {/* Table content */}
  </Table>
</div>

// Or convert to cards on mobile
<div className="hidden md:block">
  <Table>{/* Desktop table */}</Table>
</div>
<div className="md:hidden space-y-4">
  {items.map((item) => (
    <Card key={item.id}>{/* Mobile card */}</Card>
  ))}
</div>
```

---

## 5. Accessibility (A11y)

### 5.1 Focus Management
```tsx
// Always visible focus rings
<Button className="focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
  Click me
</Button>

// Skip to main content link
<a
  href="#main-content"
  className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-background focus:p-4"
>
  Skip to main content
</a>

// Focus trap in modals (handled by Radix)
<Dialog>
  {/* Focus is trapped inside */}
</Dialog>
```

### 5.2 Semantic HTML
```tsx
// Use proper heading hierarchy
<main id="main-content">
  <article>
    <h1>Page Title</h1>
    <section>
      <h2>Section Title</h2>
      <h3>Subsection</h3>
    </section>
  </article>
</main>

// Use landmarks
<header role="banner">
  <nav aria-label="Main navigation">...</nav>
</header>
<main role="main">...</main>
<footer role="contentinfo">...</footer>
<aside role="complementary">...</aside>
```

### 5.3 ARIA Attributes
```tsx
// Labels for interactive elements
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Expanded state
<Button
  aria-expanded={isOpen}
  aria-controls="menu-content"
  onClick={() => setIsOpen(!isOpen)}
>
  Menu
</Button>
<div id="menu-content" hidden={!isOpen}>
  {/* Menu items */}
</div>

// Loading states
<Button disabled aria-busy="true">
  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
  <span>Saving...</span>
</Button>

// Live regions for dynamic updates
<div aria-live="polite" aria-atomic="true">
  {message && <p>{message}</p>}
</div>
```

### 5.4 Color Contrast
```tsx
// Ensure 4.5:1 contrast ratio for text
// Use muted-foreground sparingly on important text
<p className="text-foreground">Important text</p>        // High contrast
<p className="text-muted-foreground">Less important</p>  // Lower contrast (still AA compliant)

// Don't rely on color alone
<Badge variant="destructive" className="gap-1">
  <AlertCircle className="h-3 w-3" />
  Error
</Badge>
```

### 5.5 Screen Reader Support
```tsx
// Visually hidden but accessible
<span className="sr-only">Screen reader only text</span>

// Icon buttons need labels
<Button size="icon" aria-label="Delete item">
  <Trash2 className="h-4 w-4" />
</Button>

// Announce dynamic content
<div role="status" aria-live="polite">
  {isLoading ? 'Loading...' : 'Content loaded'}
</div>
```

---

## 6. Animation Guidelines

### 6.1 Motion Principles
```tsx
// Use subtle animations
// Duration: 150-300ms for micro-interactions
// Easing: ease-out for enters, ease-in for exits

// Tailwind animation classes
<div className="transition-colors duration-200">Hover effect</div>
<div className="transition-transform duration-300 ease-out">Transform</div>
<div className="animate-spin">Spinner</div>
<div className="animate-pulse">Skeleton</div>
```

### 6.2 Framer Motion Patterns
```tsx
import { motion } from 'framer-motion'

// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Stagger children
<motion.ul
  initial="hidden"
  animate="visible"
  variants={{
    visible: {
      transition: { staggerChildren: 0.05 }
    }
  }}
>
  {items.map((item) => (
    <motion.li
      key={item.id}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
    >
      {item.name}
    </motion.li>
  ))}
</motion.ul>

// Respect reduced motion preference
const prefersReducedMotion = useReducedMotion()

<motion.div
  initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
  animate={{ opacity: 1, y: 0 }}
>
  Content
</motion.div>
```

### 6.3 Loading States
```tsx
// Skeleton loading
function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-24" />
      </CardContent>
    </Card>
  )
}

// Suspense with skeleton
<Suspense fallback={<CardSkeleton />}>
  <AsyncCard />
</Suspense>

// Button loading
<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Please wait
</Button>
```

---

## 7. Dark Mode

### 7.1 Theme Toggle
```tsx
'use client'

import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-react'

export function ThemeModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

### 7.2 Theme-Aware Styles
```tsx
// Use CSS variables (automatic)
<div className="bg-background text-foreground">
  Auto-switches
</div>

// Explicit dark mode classes
<div className="bg-white dark:bg-gray-900">
  Explicit control
</div>

// Images for different themes
<picture>
  <source srcSet="/logo-dark.png" media="(prefers-color-scheme: dark)" />
  <img src="/logo-light.png" alt="Logo" />
</picture>
```

---

## 8. Error Handling UI

### 8.1 Error Boundary
```tsx
// app/error.tsx
'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <AlertTriangle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">Something went wrong!</h2>
      <p className="text-muted-foreground text-center max-w-md">
        {error.message || 'An unexpected error occurred'}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
```

### 8.2 Not Found Page
```tsx
// app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground">
        The page you're looking for doesn't exist.
      </p>
      <Button asChild>
        <Link href="/">Go home</Link>
      </Button>
    </div>
  )
}
```

### 8.3 Empty States
```tsx
function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType
  title: string
  description: string
  action?: {
    label: string
    href: string
  }
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Icon className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-muted-foreground mt-1 max-w-sm">{description}</p>
      {action && (
        <Button className="mt-4" asChild>
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  )
}

// Usage
<EmptyState
  icon={FileText}
  title="No posts yet"
  description="Get started by creating your first blog post."
  action={{ label: 'Create Post', href: '/admin/blog/new' }}
/>
```

---

## 9. Performance Considerations

### 9.1 Image Optimization
```tsx
import Image from 'next/image'

// Always use Next.js Image
<Image
  src="/image.jpg"
  alt="Description"
  width={800}
  height={600}
  priority={isAboveFold}           // For LCP images
  placeholder="blur"                // Blur placeholder
  blurDataURL="data:image/..."     // Base64 placeholder
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>

// For responsive images
<Image
  src="/hero.jpg"
  alt="Hero"
  fill
  className="object-cover"
  sizes="100vw"
  priority
/>
```

### 9.2 Font Optimization
```tsx
// next/font (automatic optimization)
import { Inter, JetBrains_Mono } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const mono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-mono',
})

// In layout
<body className={`${inter.variable} ${mono.variable}`}>
```

### 9.3 Lazy Loading
```tsx
// Dynamic imports for heavy components
import dynamic from 'next/dynamic'

const BlockNoteEditor = dynamic(
  () => import('@/components/editor/block-editor'),
  { 
    ssr: false,
    loading: () => <Skeleton className="h-[400px]" />
  }
)

// Lazy load below-fold content
<Suspense fallback={<Skeleton className="h-[200px]" />}>
  <BelowFoldContent />
</Suspense>
```

---

## Next Steps

See [10-implementation-plan.md](./10-implementation-plan.md) for phased implementation.
