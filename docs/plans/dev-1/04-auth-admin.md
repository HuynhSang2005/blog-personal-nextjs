# Authentication & Admin - Blog Personal Next.js

> **For Claude/Copilot:** Implement authentication exactly as specified. Single admin role only.

**Goal:** Implement secure authentication for a single admin user using Supabase Auth.

**Last Updated:** 2026-01-30

---

## 1. Authentication Overview

### 1.1 Auth Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Public Users          Admin User                          │
│        │                    │                               │
│        ▼                    ▼                               │
│   [No Auth Required]    [Email/Password Login]              │
│        │                    │                               │
│        ▼                    ▼                               │
│   View Blog/Docs        Supabase Auth                       │
│                             │                               │
│                             ▼                               │
│                      Check is_admin in profiles             │
│                             │                               │
│                    ┌────────┴────────┐                      │
│                    │                 │                      │
│                    ▼                 ▼                      │
│               is_admin=true    is_admin=false               │
│                    │                 │                      │
│                    ▼                 ▼                      │
│              Admin Dashboard    Redirect to /               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Auth Requirements
| Requirement | Implementation |
|-------------|----------------|
| Provider | Email/Password only |
| Roles | Single `admin` role |
| Session | Server-side with cookies |
| Protection | Proxy + Server Actions |
| Storage | Supabase Auth + profiles table |

---

## 2. Supabase Auth Configuration

### 2.1 Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

### 2.2 Supabase Dashboard Settings
1. **Authentication > Providers**: Enable only Email provider
2. **Authentication > URL Configuration**:
   - Site URL: `http://localhost:3000` (dev) / `https://yourdomain.com` (prod)
   - Redirect URLs: `http://localhost:3000/auth/callback`
3. **Authentication > Email Templates**: Customize confirmation emails
4. **Disable signups** (optional): Only allow manual admin creation

---

## 3. Supabase Client Setup

### 3.1 Browser Client
```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 3.2 Server Client
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component - can be ignored
          }
        },
      },
    }
  )
}
```

### 3.3 Middleware Helper
```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Refresh the auth token
  await supabase.auth.getUser()

  return supabaseResponse
}
```

---

## 4. Proxy (Middleware) Configuration

### 4.1 Proxy File
```typescript
// proxy.ts (Next.js 16 naming convention)
import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { createServerClient } from '@supabase/ssr'

export async function proxy(request: NextRequest) {
  // Update session first
  const response = await updateSession(request)
  
  const { pathname } = request.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              response.cookies.set(name, value)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // No user - redirect to login
    if (!user) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      // Not admin - redirect to home
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

---

## 5. Auth Pages

### 5.1 Login Page
```tsx
// app/(auth)/login/page.tsx
import { LoginForm } from '@/components/auth/login-form'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Already logged in
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profile?.is_admin) {
      redirect(params.redirect || '/admin')
    }
    redirect('/')
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto w-full max-w-md space-y-6 p-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Admin Login</h1>
          <p className="text-muted-foreground">
            Enter your credentials to access the admin panel
          </p>
        </div>
        
        {params.error && (
          <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
            {params.error === 'unauthorized' && 'You are not authorized to access this page.'}
            {params.error === 'invalid_credentials' && 'Invalid email or password.'}
          </div>
        )}
        
        <LoginForm redirectTo={params.redirect} />
      </div>
    </div>
  )
}
```

### 5.2 Login Form Component
```tsx
// components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { login } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginInput = z.infer<typeof loginSchema>

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [isLoading, setIsLoading] = useState(false)
  
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(data: LoginInput) {
    setIsLoading(true)
    
    const formData = new FormData()
    formData.append('email', data.email)
    formData.append('password', data.password)
    if (redirectTo) formData.append('redirectTo', redirectTo)
    
    await login(formData)
    setIsLoading(false)
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="admin@example.com"
          {...form.register('email')}
          disabled={isLoading}
        />
        {form.formState.errors.email && (
          <p className="text-sm text-destructive">
            {form.formState.errors.email.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...form.register('password')}
          disabled={isLoading}
        />
        {form.formState.errors.password && (
          <p className="text-sm text-destructive">
            {form.formState.errors.password.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          'Sign in'
        )}
      </Button>
    </form>
  )
}
```

### 5.3 Auth Callback Route
```typescript
// app/(auth)/callback/route.ts
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_error`)
}
```

---

## 6. Auth Actions

### 6.1 Login Action
```typescript
// lib/actions/auth.ts
'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=invalid_credentials')
  }

  // Check if user is admin
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      await supabase.auth.signOut()
      redirect('/login?error=unauthorized')
    }
  }

  const redirectTo = formData.get('redirectTo') as string || '/admin'
  
  revalidatePath('/', 'layout')
  redirect(redirectTo)
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  
  revalidatePath('/', 'layout')
  redirect('/')
}
```

---

## 7. Auth Helpers

### 7.1 Get Current User
```typescript
// lib/auth/get-user.ts
import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return profile
})

export const isAdmin = cache(async () => {
  const user = await getCurrentUser()
  return user?.is_admin ?? false
})
```

### 7.2 Require Admin Hook
```typescript
// lib/auth/require-admin.ts
import { redirect } from 'next/navigation'
import { isAdmin } from './get-user'

export async function requireAdmin() {
  const admin = await isAdmin()
  
  if (!admin) {
    redirect('/login?error=unauthorized')
  }
}
```

---

## 8. Protected Admin Layout

### 8.1 Admin Layout
```tsx
// app/(admin)/layout.tsx
import { requireAdmin } from '@/lib/auth/require-admin'
import { getCurrentUser } from '@/lib/auth/get-user'
import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        <AdminHeader user={user} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 9. Creating the Admin User

### 9.1 Initial Admin Setup (SQL)
```sql
-- Run this in Supabase SQL Editor after creating user via Auth

-- Option 1: Make existing user an admin
UPDATE profiles
SET is_admin = true, role = 'admin'
WHERE email = 'your-admin-email@example.com';

-- Option 2: Create admin user directly (requires existing auth.users entry)
-- First create user via Supabase Dashboard > Authentication > Users > Add User
-- Then run:
UPDATE profiles
SET 
  is_admin = true,
  role = 'admin',
  name = 'Admin'
WHERE id = 'user-uuid-from-auth';
```

### 9.2 Admin Creation Script
```typescript
// scripts/create-admin.ts
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
)

async function createAdmin(email: string, password: string, name: string) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name },
  })

  if (authError) {
    console.error('Error creating user:', authError)
    return
  }

  // Update profile to be admin
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ is_admin: true, role: 'admin', name })
    .eq('id', authData.user.id)

  if (profileError) {
    console.error('Error updating profile:', profileError)
    return
  }

  console.log('✅ Admin user created:', email)
}

// Usage
createAdmin(
  'admin@example.com',
  'secure-password-123',
  'Admin User'
)
```

---

## 10. Auth Security Checklist

### 10.1 Security Measures
- [x] Server-side session validation via `getUser()`
- [x] Middleware protection for admin routes
- [x] RLS policies for database access
- [x] Password validation (min 6 chars)
- [x] HTTPS in production
- [x] Secure cookies with `httpOnly`
- [x] CSRF protection via Server Actions
- [x] Rate limiting (Supabase built-in)

### 10.2 Testing Checklist
- [ ] Login with valid admin credentials → Success
- [ ] Login with invalid credentials → Error message
- [ ] Login with non-admin user → Redirect to home
- [ ] Access /admin without auth → Redirect to login
- [ ] Access /admin with non-admin → Redirect to home
- [ ] Logout → Redirect to home, clear session
- [ ] Session expiry → Automatic refresh

---

## Next Steps

See [05-feature-blog.md](./05-feature-blog.md) for blog implementation.
