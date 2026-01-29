'use client';

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type PaginationState,
  type ColumnFiltersState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';

/**
 * TanStack Table v8 Setup Examples
 * 
 * Best practices:
 * - Memoize data and columns to prevent infinite re-renders
 * - Use useReactTable hook with all required options
 * - Separate row model functions for different features
 * - Handle state management for sorting, filtering, pagination
 */

/**
 * Example: Basic Data Table Component
 */
interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
}

export function DataTable<TData>({ data, columns }: DataTableProps<TData>) {
  // CRITICAL: Memoize data and columns for performance
  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      {/* Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '2px solid #e5e7eb',
                    textAlign: 'left',
                    cursor: header.column.getCanSort()
                      ? 'pointer'
                      : 'default',
                  }}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                  {{
                    asc: ' 🔼',
                    desc: ' 🔽',
                  }[header.column.getIsSorted() as string] ?? null}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid #e5e7eb',
                  }}
                >
                  {flexRender(
                    cell.column.columnDef.cell,
                    cell.getContext(),
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <span>
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </span>
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
        <select
          value={table.getState().pagination.pageSize}
          onChange={(e) => {
            table.setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * Example: Advanced Table with Server-Side Operations
 */
interface AdvancedTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  pageCount: number;
  onPaginationChange: (pagination: PaginationState) => void;
  onSortingChange: (sorting: SortingState) => void;
  onColumnFiltersChange: (filters: ColumnFiltersState) => void;
  isLoading?: boolean;
}

export function AdvancedTable<TData>({
  data,
  columns,
  pageCount,
  onPaginationChange,
  onSortingChange,
  onColumnFiltersChange,
  isLoading,
}: AdvancedTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns = useMemo(() => columns, [columns]);

  const table = useReactTable({
    data: memoizedData,
    columns: memoizedColumns,
    pageCount,
    state: {
      sorting,
      pagination,
      columnFilters,
    },
    onSortingChange: (updater) => {
      if (typeof updater === 'function') {
        setSorting(updater);
      } else {
        setSorting(updater);
      }
      onSortingChange(updater as SortingState);
    },
    onPaginationChange: (updater) => {
      if (typeof updater === 'function') {
        setPagination(updater);
      } else {
        setPagination(updater);
      }
      onPaginationChange(updater as PaginationState);
    },
    onColumnFiltersChange: (updater) => {
      if (typeof updater === 'function') {
        setColumnFilters(updater);
      } else {
        setColumnFilters(updater);
      }
      onColumnFiltersChange(updater as ColumnFiltersState);
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true, // Server-side pagination
    manualSorting: true, // Server-side sorting
    manualFiltering: true, // Server-side filtering
  });

  return (
    <div>
      {isLoading && <div>Loading...</div>}
      <DataTable<TData> data={data} columns={columns} />
    </div>
  );
}

/**
 * Helper function to create column definitions
 */
export function createColumnDef<TData>(): ColumnDef<TData>[] {
  return [];
}

/**
 * Example: Column Definition for User Table
 */
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
}

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: (info) => {
      const role = info.getValue() as User['role'];
      const colors = {
        admin: 'red',
        user: 'blue',
        guest: 'gray',
      };
      return (
        <span
          style={{
            color: colors[role],
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            backgroundColor: `${colors[role]}20`,
          }}
        >
          {role}
        </span>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created At',
    cell: (info) => {
      const date = info.getValue() as Date;
      return date.toLocaleDateString();
    },
  },
];
