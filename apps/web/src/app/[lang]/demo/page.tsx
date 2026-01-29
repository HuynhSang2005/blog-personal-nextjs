'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserPreferencesStore, useCounterStore, useTodoStore } from '@/lib/stores';
import { loginSchema, type LoginFormData } from '@/lib/schemas';
import { DataTable, userColumns, type User } from '@/lib/tables';
import { useZodForm, InputField, SubmitButton, FormWrapper } from '@/lib/forms';
import { z } from 'zod';

// Mock data for table example
const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin', createdAt: new Date('2024-01-01') },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user', createdAt: new Date('2024-01-02') },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'guest', createdAt: new Date('2024-01-03') },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'user', createdAt: new Date('2024-01-04') },
];

// Mock API function
async function fetchUsers(): Promise<User[]> {
  // Simulate API call
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return mockUsers;
}

async function submitLogin(data: LoginFormData): Promise<{ success: boolean; message: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return { success: true, message: `Welcome, ${data.email}!` };
}

export default function DemoPage() {
  const queryClient = useQueryClient();

  // TanStack Query - Data fetching example
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  // TanStack Query - Mutation example
  const loginMutation = useMutation({
    mutationFn: submitLogin,
    onSuccess: (data) => {
      alert(data.message);
    },
  });

  // Zustand - State management examples
  const { theme, setTheme } = useUserPreferencesStore();
  const { count, increment, decrement } = useCounterStore();
  const { todos, addTodo, toggleTodo, removeTodo } = useTodoStore();

  // React Hook Form + Zod example
  const loginForm = useZodForm(loginSchema, {
    defaultValues: { email: '', password: '' },
  });

  const handleLogin = async (data: LoginFormData) => {
    await loginMutation.mutateAsync(data);
  };

  const handleAddTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const text = formData.get('todo') as string;
    if (text.trim()) {
      addTodo(text);
      e.currentTarget.reset();
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem' }}>
        Library Setup Demo
      </h1>

      {/* Section 1: TanStack Query */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          1. TanStack Query (Data Fetching)
        </h2>
        {isLoading && <p>Loading users...</p>}
        {error && <p style={{ color: 'red' }}>Error loading users</p>}
        {users && (
          <DataTable data={users} columns={userColumns} />
        )}
      </section>

      {/* Section 2: React Hook Form + Zod */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          2. React Hook Form + Zod Validation
        </h2>
        <FormWrapper
          schema={loginSchema}
          onSubmit={handleLogin}
          defaultValues={{ email: '', password: '' }}
        >
          {(methods) => (
            <div style={{ maxWidth: '400px' }}>
              <InputField
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your email"
              />
              <InputField
                name="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
              />
              <SubmitButton isLoading={loginMutation.isPending}>
                Login
              </SubmitButton>
            </div>
          )}
        </FormWrapper>
      </section>

      {/* Section 3: Zustand State Management */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          3. Zustand (State Management)
        </h2>

        {/* Theme selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Theme: {theme}</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {(['light', 'dark', 'system'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: theme === t ? '#007bff' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Counter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Counter: {count}</h3>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={decrement}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Decrement
            </button>
            <button
              onClick={increment}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Increment
            </button>
          </div>
        </div>

        {/* Todo List */}
        <div>
          <h3 style={{ marginBottom: '0.5rem' }}>Todo List ({todos.length} items)</h3>
          <form onSubmit={handleAddTodo} style={{ marginBottom: '1rem' }}>
            <input
              name="todo"
              placeholder="Add a new todo"
              style={{
                padding: '0.5rem',
                marginRight: '0.5rem',
                border: '1px solid #ccc',
                borderRadius: '4px',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Add
            </button>
          </form>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {todos.map((todo) => (
              <li
                key={todo.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee',
                }}
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span
                  style={{
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    flex: 1,
                  }}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => removeTodo(todo.id)}
                  style={{
                    padding: '0.25rem 0.5rem',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Section 4: TanStack Table */}
      <section>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
          4. TanStack Table (Already shown above)
        </h2>
        <p>The DataTable component above demonstrates TanStack Table with:</p>
        <ul>
          <li>Column definitions with accessors</li>
          <li>Sorting functionality</li>
          <li>Pagination controls</li>
          <li>Custom cell rendering</li>
        </ul>
      </section>
    </div>
  );
}
