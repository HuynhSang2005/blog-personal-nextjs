# Library Setup Guide

This document describes the setup and usage of all libraries in the project.

## Installed Libraries

All libraries are already installed at their latest versions:

- **@tanstack/react-query**: ^5.90.20 - Data fetching and server state management
- **@tanstack/react-query-devtools**: ^5.91.2 - Devtools for React Query
- **@tanstack/react-table**: ^8.21.3 - Headless table library
- **zod**: ^4.3.6 - Schema validation and type inference
- **zustand**: ^5.0.10 - Client-side state management
- **react-hook-form**: ^7.71.1 - Form management
- **@hookform/resolvers**: ^5.2.2 - Zod resolver for React Hook Form

## Directory Structure

```
apps/web/src/lib/
├── providers/         # Context providers (QueryClientProvider)
├── stores/           # Zustand stores
├── schemas/          # Zod validation schemas
├── forms/            # React Hook Form components
├── tables/           # TanStack Table components
└── utils.ts          # Utility functions
```

## Quick Start

### 1. TanStack Query (Data Fetching)

Wrap your app with QueryProvider in layout.tsx:

```tsx
import { QueryProvider } from '@/lib/providers/query-provider';

export default function RootLayout({ children }) {
  return (
    <QueryProvider>
      {children}
    </QueryProvider>
  );
}
```

Use in components:

```tsx
import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch data
const { data, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
});

// Mutate data
const mutation = useMutation({
  mutationFn: createUser,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['users'] });
  },
});
```

### 2. Zustand (State Management)

Create a store:

```tsx
import { create } from 'zustand';

interface StoreState {
  count: number;
  increment: () => void;
}

export const useStore = create<StoreState>()((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
}));
```

Use in components:

```tsx
const count = useStore((state) => state.count);
const increment = useStore((state) => state.increment);
```

With persistence:

```tsx
import { persist, createJSONStorage } from 'zustand/middleware';

const useStore = create<StoreState>()(
  persist(
    (set) => ({ ... }),
    {
      name: 'storage-key',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 3. React Hook Form + Zod (Forms)

Define a schema:

```tsx
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

type FormData = z.infer<typeof schema>;
```

Use in a form:

```tsx
import { useZodForm } from '@/lib/forms';
import { FormWrapper, InputField, SubmitButton } from '@/lib/forms';

const methods = useZodForm(schema, {
  defaultValues: { email: '', password: '' },
});

<FormWrapper schema={schema} onSubmit={handleSubmit} defaultValues={...}>
  {(methods) => (
    <>
      <InputField name="email" label="Email" />
      <InputField name="password" label="Password" type="password" />
      <SubmitButton>Login</SubmitButton>
    </>
  )}
</FormWrapper>
```

### 4. TanStack Table (Data Tables)

Define columns and use the table:

```tsx
import { useReactTable, getCoreRowModel } from '@tanstack/react-table';
import { DataTable } from '@/lib/tables';

const columns: ColumnDef<User>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'email', header: 'Email' },
];

<DataTable data={data} columns={columns} />
```

With server-side operations:

```tsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 20 });

const table = useReactTable({
  data,
  columns,
  state: { pagination },
  onPaginationChange: setPagination,
  getCoreRowModel: getCoreRowModel(),
  manualPagination: true, // Server-side
});
```

## Best Practices

### TanStack Query
- Always use unique query keys
- Use `staleTime` to prevent unnecessary refetching
- Handle errors with `errorBoundary` or error state
- Prefetch data when possible

### Zustand
- Use `create<T>()()` double parentheses for TypeScript
- Memoize selectors to prevent unnecessary re-renders
- Use `useShallow` for multiple state selections
- Handle hydration properly in Next.js

### React Hook Form + Zod
- Always provide `defaultValues`
- Use `FormProvider` to avoid prop drilling
- Reuse same schema on server for validation
- Use `mode: 'onSubmit'` for best performance

### TanStack Table
- Memoize `data` and `columns` with `useMemo`
- Use `getCoreRowModel()` at minimum
- Consider server-side operations for large datasets
- Use column pinning for wide tables

## Resources

- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Zustand Docs](https://zustand-demo.pmnd.rs/)
- [React Hook Form Docs](https://react-hook-form.com/)
- [Zod Docs](https://zod.dev/)
- [TanStack Table Docs](https://tanstack.com/table/latest)
