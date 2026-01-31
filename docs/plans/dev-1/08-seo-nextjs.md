# SEO Implementation - Blog Personal Next.js

> **For Claude/Copilot:** Implement comprehensive SEO using Next.js 16 metadata APIs.

**Goal:** Maximize search engine visibility with proper metadata, OG images, sitemaps, and structured data.

**Last Updated:** 2026-01-30

---

## 1. SEO Strategy Overview

### 1.1 SEO Checklist
```
┌─────────────────────────────────────────────────────────────┐
│                      SEO IMPLEMENTATION                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  TECHNICAL SEO                 CONTENT SEO                  │
│  ├─ Metadata API               ├─ Title Optimization        │
│  │  ├─ Title templates         ├─ Meta Descriptions         │
│  │  ├─ Description             ├─ Heading Structure         │
│  │  └─ Robots directives       └─ Image Alt Text            │
│  │                                                          │
│  ├─ Open Graph                 STRUCTURED DATA              │
│  │  ├─ Title/Description       ├─ Website Schema            │
│  │  ├─ Dynamic OG Images       ├─ Article Schema            │
│  │  └─ Twitter Cards           ├─ Breadcrumb Schema         │
│  │                             └─ FAQ Schema (if needed)    │
│  ├─ Sitemap.xml                                             │
│  │  ├─ Static pages            PERFORMANCE                  │
│  │  ├─ Blog posts              ├─ Core Web Vitals           │
│  │  └─ Doc pages               ├─ Image Optimization        │
│  │                             └─ Font Optimization         │
│  ├─ Robots.txt                                              │
│  │                                                          │
│  └─ Canonical URLs                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Key Principles
- **Server Components first** - Generate metadata at build/request time
- **Dynamic OG images** - Generate images for each blog/doc post
- **Proper caching** - Static pages should have long cache times
- **Structured data** - Help search engines understand content

---

## 2. Root Layout Metadata

### 2.1 Root Layout with Default Metadata
```tsx
// app/layout.tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { getSiteSettings } from '@/lib/db/queries/settings'
import { ThemeProvider } from '@/components/theme-provider'
import '@/styles/globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

// Default metadata (can be overridden by child pages)
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    metadataBase: new URL(settings?.siteUrl || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
    title: {
      default: settings?.siteName || 'Blog Personal',
      template: `%s | ${settings?.siteName || 'Blog Personal'}`,
    },
    description: settings?.siteDescription || 'A personal blog about web development',
    keywords: ['blog', 'web development', 'programming', 'nextjs', 'react'],
    authors: [{ name: 'Admin' }],
    creator: 'Admin',
    publisher: 'Admin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    openGraph: {
      type: 'website',
      locale: 'en_US',
      url: settings?.siteUrl,
      siteName: settings?.siteName || 'Blog Personal',
      title: settings?.siteName || 'Blog Personal',
      description: settings?.siteDescription || 'A personal blog about web development',
      images: [
        {
          url: '/og-default.png',
          width: 1200,
          height: 630,
          alt: settings?.siteName || 'Blog Personal',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: settings?.siteName || 'Blog Personal',
      description: settings?.siteDescription || 'A personal blog about web development',
      images: ['/og-default.png'],
      creator: settings?.socialTwitter?.replace('https://twitter.com/', '@') || undefined,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: settings?.favicon || '/favicon.ico',
      shortcut: '/favicon-16x16.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    alternates: {
      canonical: settings?.siteUrl,
      types: {
        'application/rss+xml': [
          { url: '/feed/rss', title: 'RSS Feed' },
          { url: '/feed/atom', title: 'Atom Feed' },
        ],
      },
    },
  }
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## 3. Page-Specific Metadata

### 3.1 Blog List Page Metadata
```tsx
// app/(public)/[locale]/blog/page.tsx
import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'blog' })

  return {
    title: t('pageTitle'),
    description: t('pageDescription'),
    openGraph: {
      title: t('pageTitle'),
      description: t('pageDescription'),
    },
    alternates: {
      canonical: '/blog',
      languages: {
        'en': '/en/blog',
        'vi': '/vi/blog',
      },
    },
  }
}
```

### 3.2 Blog Detail Page Metadata
```tsx
// app/(public)/[locale]/blog/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getBlogBySlug, getAllBlogSlugs } from '@/lib/db/queries/blogs'

interface BlogPageProps {
  params: Promise<{ slug: string; locale: string }>
}

// Generate static params for SSG
export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) {
    return {}
  }

  const ogImageUrl = new URL('/api/og/blog', process.env.NEXT_PUBLIC_APP_URL)
  ogImageUrl.searchParams.set('title', blog.title)
  ogImageUrl.searchParams.set('date', blog.publishedAt?.toISOString() || '')
  if (blog.featuredImage) {
    ogImageUrl.searchParams.set('image', blog.featuredImage)
  }

  return {
    title: blog.metaTitle || blog.title,
    description: blog.metaDescription || blog.excerpt,
    authors: blog.author ? [{ name: blog.author.name }] : undefined,
    openGraph: {
      type: 'article',
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt || undefined,
      url: `/blog/${blog.slug}`,
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
      publishedTime: blog.publishedAt?.toISOString(),
      modifiedTime: blog.updatedAt?.toISOString(),
      authors: blog.author ? [blog.author.name] : undefined,
      tags: blog.tags?.map((t) => t.name),
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt || undefined,
      images: [ogImageUrl.toString()],
    },
    alternates: {
      canonical: `/blog/${blog.slug}`,
      languages: {
        'en': `/en/blog/${blog.slug}`,
        'vi': `/vi/blog/${blog.slug}`,
      },
    },
  }
}
```

### 3.3 Documentation Page Metadata
```tsx
// app/(public)/[locale]/docs/[slug]/page.tsx
import type { Metadata } from 'next'
import { getDocBySlug, getAllDocSlugs } from '@/lib/db/queries/docs'

interface DocPageProps {
  params: Promise<{ slug: string; locale: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllDocSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: DocPageProps): Promise<Metadata> {
  const { slug, locale } = await params
  const doc = await getDocBySlug(slug)

  if (!doc) {
    return {}
  }

  return {
    title: doc.metaTitle || doc.title,
    description: doc.metaDescription || doc.excerpt,
    openGraph: {
      type: 'article',
      title: doc.metaTitle || doc.title,
      description: doc.metaDescription || doc.excerpt || undefined,
      url: `/docs/${doc.slug}`,
    },
    alternates: {
      canonical: `/docs/${doc.slug}`,
    },
  }
}
```

---

## 4. Dynamic OG Image Generation

### 4.1 Blog OG Image Route
```tsx
// app/api/og/blog/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const title = searchParams.get('title') || 'Blog Post'
  const date = searchParams.get('date')
  const image = searchParams.get('image')

  // Load font
  const interBold = await fetch(
    new URL('../../../../public/fonts/Inter-Bold.ttf', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0a0a0a',
          padding: '60px',
        }}
      >
        {/* Background gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 50%, #16213e 100%)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '24px',
            }}
          >
            <span
              style={{
                padding: '8px 16px',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                color: '#a78bfa',
                borderRadius: '9999px',
                fontSize: '18px',
                fontWeight: 600,
              }}
            >
              Blog Post
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.2,
              marginBottom: '24px',
              maxWidth: '900px',
            }}
          >
            {title}
          </h1>

          {/* Date */}
          {date && (
            <p
              style={{
                fontSize: '24px',
                color: '#9ca3af',
              }}
            >
              {new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            {/* Logo placeholder */}
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ color: 'white', fontSize: '24px', fontWeight: 700 }}>
                B
              </span>
            </div>
            <span style={{ color: 'white', fontSize: '24px', fontWeight: 600 }}>
              Blog Personal
            </span>
          </div>
        </div>

        {/* Featured image (if provided) */}
        {image && (
          <div
            style={{
              position: 'absolute',
              right: '60px',
              top: '60px',
              width: '300px',
              height: '300px',
              borderRadius: '24px',
              overflow: 'hidden',
            }}
          >
            <img
              src={image}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: 'Inter',
          data: interBold,
          style: 'normal',
          weight: 700,
        },
      ],
    }
  )
}
```

### 4.2 Default OG Image Route
```tsx
// app/api/og/route.tsx
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || 'Blog Personal'
  const description = searchParams.get('description') || 'A personal blog about web development'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0a0a0a',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #0a0a0a 50%, #16213e 100%)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            width: '120px',
            height: '120px',
            borderRadius: '24px',
            backgroundColor: '#8b5cf6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '32px',
          }}
        >
          <span style={{ color: 'white', fontSize: '64px', fontWeight: 700 }}>
            B
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '72px',
            fontWeight: 700,
            color: 'white',
            marginBottom: '16px',
          }}
        >
          {title}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '28px',
            color: '#9ca3af',
            maxWidth: '800px',
            textAlign: 'center',
          }}
        >
          {description}
        </p>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
```

---

## 5. Sitemap Generation

### 5.1 Dynamic Sitemap
```tsx
// app/sitemap.ts
import { MetadataRoute } from 'next'
import { getAllBlogSlugs } from '@/lib/db/queries/blogs'
import { getAllDocSlugs } from '@/lib/db/queries/docs'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  // Blog posts
  const blogSlugs = await getAllBlogSlugs()
  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE_URL}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  // Documentation pages
  const docSlugs = await getAllDocSlugs()
  const docPages: MetadataRoute.Sitemap = docSlugs.map((slug) => ({
    url: `${BASE_URL}/docs/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...staticPages, ...blogPages, ...docPages]
}
```

### 5.2 Localized Sitemap (Optional)
```tsx
// app/sitemap.ts (with i18n support)
import { MetadataRoute } from 'next'
import { locales } from '@/i18n-config'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = ['', '/blog', '/docs']
  
  const staticPages: MetadataRoute.Sitemap = pages.flatMap((page) =>
    locales.map((locale) => ({
      url: `${BASE_URL}/${locale}${page}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: page === '' ? 1 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          locales.map((l) => [l, `${BASE_URL}/${l}${page}`])
        ),
      },
    }))
  )

  // ... add blog and doc pages

  return staticPages
}
```

---

## 6. Robots.txt

### 6.1 Static Robots.txt
```txt
// app/robots.txt (static file in app directory)
User-agent: *
Allow: /

# Disallow admin routes
Disallow: /admin
Disallow: /api/admin

# Sitemap
Sitemap: https://example.com/sitemap.xml
```

### 6.2 Dynamic Robots.txt
```tsx
// app/robots.ts
import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin', '/login'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
```

---

## 7. Structured Data (JSON-LD)

### 7.1 Website Schema
```tsx
// components/structured-data/website-schema.tsx
import { getSiteSettings } from '@/lib/db/queries/settings'

export async function WebsiteSchema() {
  const settings = await getSiteSettings()
  const siteUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_APP_URL

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings?.siteName || 'Blog Personal',
    description: settings?.siteDescription,
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 7.2 Article Schema for Blog Posts
```tsx
// components/structured-data/article-schema.tsx
import type { Blog, Profile, Tag } from '@/lib/db/schema'

interface ArticleSchemaProps {
  blog: Blog & {
    author: Profile | null
    tags: Tag[]
  }
}

export function ArticleSchema({ blog }: ArticleSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: blog.title,
    description: blog.excerpt,
    image: blog.featuredImage,
    datePublished: blog.publishedAt?.toISOString(),
    dateModified: blog.updatedAt?.toISOString(),
    author: {
      '@type': 'Person',
      name: blog.author?.name || 'Admin',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Blog Personal',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${blog.slug}`,
    },
    keywords: blog.tags?.map((t) => t.name).join(', '),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 7.3 Breadcrumb Schema
```tsx
// components/structured-data/breadcrumb-schema.tsx
interface BreadcrumbItem {
  name: string
  url: string
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[]
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.url}`,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
```

### 7.4 Using Structured Data in Pages
```tsx
// app/(public)/[locale]/blog/[slug]/page.tsx
import { ArticleSchema } from '@/components/structured-data/article-schema'
import { BreadcrumbSchema } from '@/components/structured-data/breadcrumb-schema'

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params
  const blog = await getBlogBySlug(slug)

  if (!blog) notFound()

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: blog.title, url: `/blog/${blog.slug}` },
  ]

  return (
    <>
      {/* Structured Data */}
      <ArticleSchema blog={blog} />
      <BreadcrumbSchema items={breadcrumbs} />

      {/* Page Content */}
      <article>
        {/* ... */}
      </article>
    </>
  )
}
```

---

## 8. Manifest & PWA

### 8.1 Web App Manifest
```tsx
// app/manifest.ts
import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Blog Personal',
    short_name: 'Blog',
    description: 'A personal blog about web development',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#8b5cf6',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
```

---

## 9. SEO Best Practices Checklist

### 9.1 Technical SEO
- [ ] All pages have unique `title` and `description`
- [ ] Title length: 50-60 characters
- [ ] Description length: 150-160 characters
- [ ] Canonical URLs set for all pages
- [ ] Proper heading hierarchy (H1 → H2 → H3)
- [ ] Image alt text for all images
- [ ] Lazy loading for below-fold images
- [ ] Mobile responsive design
- [ ] Fast page load times (< 3s)
- [ ] HTTPS enabled
- [ ] Clean URL structure

### 9.2 Content SEO
- [ ] Keyword research done
- [ ] Primary keyword in title, H1, and first paragraph
- [ ] Internal linking between related content
- [ ] External links to authoritative sources
- [ ] Fresh content updates
- [ ] Proper use of structured data

### 9.3 Social SEO
- [ ] Open Graph tags for all pages
- [ ] Twitter Card tags
- [ ] Dynamic OG images for blog posts
- [ ] Social share buttons (optional)

### 9.4 Monitoring
- [ ] Google Search Console connected
- [ ] Google Analytics (or alternative) set up
- [ ] Core Web Vitals monitoring
- [ ] Regular sitemap submissions

---

## Next Steps

See [09-ux-guidelines.md](./09-ux-guidelines.md) for UX implementation guidelines.
