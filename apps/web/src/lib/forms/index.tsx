'use client';

import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, UseFormReturn } from 'react-hook-form';
import type { z } from 'zod';

/**
 * React Hook Form + Zod Integration Examples
 * 
 * Best practices:
 * - Use FormProvider to avoid prop drilling
 * - Always provide defaultValues to prevent uncontrolled warnings
 * - Use zodResolver to connect Zod schemas with React Hook Form
 * - Handle form state with proper error messages
 * 
 * Note: Using type assertions (as any) to work around Zod v4 type compatibility
 * with @hookform/resolvers. The runtime behavior is correct.
 */

/**
 * Hook to get form methods with Zod resolver
 * 
 * @param schema - A Zod schema for validation
 * @param options - Form options including defaultValues and mode
 * @returns Form methods from useForm hook
 */
export function useZodForm<T extends FieldValues = FieldValues>(
  schema: z.ZodType,
  options?: {
    defaultValues?: Partial<T>;
    mode?: 'onSubmit' | 'onBlur' | 'onChange' | 'all';
  },
): UseFormReturn<T> {
  return useForm<T>({
    // @ts-ignore - Type compatibility issue between Zod v4 and @hookform/resolvers
    // The resolver works correctly at runtime, this is purely a TypeScript limitation
    resolver: zodResolver(schema),
    defaultValues: options?.defaultValues,
    mode: options?.mode || 'onSubmit',
  } as any);
}

/**
 * Example: Form Provider Wrapper Component
 * 
 * @param schema - Zod schema for validation
 * @param children - Render function that receives form methods
 * @param onSubmit - Form submission handler
 * @param defaultValues - Initial form values
 */
interface FormWrapperProps<T extends FieldValues = FieldValues> {
  schema: z.ZodType;
  children: (methods: UseFormReturn<T>) => React.ReactNode;
  onSubmit: (data: T) => Promise<void>;
  defaultValues?: Partial<T>;
}

export function FormWrapper<T extends FieldValues = FieldValues>({
  schema,
  children,
  onSubmit,
  defaultValues,
}: FormWrapperProps<T>) {
  const methods = useZodForm<T>(schema, { defaultValues });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {children(methods)}
      </form>
    </FormProvider>
  );
}

/**
 * Example: Reusable Input Field Component
 */
interface InputFieldProps {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  disabled?: boolean;
}

export function InputField({
  name,
  label,
  type = 'text',
  placeholder,
  disabled,
}: InputFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={{ display: 'block', marginBottom: '0.5rem' }}>
        {label}
      </label>
      <input
        {...register(name)}
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: error ? '1px solid red' : '1px solid #ccc',
          borderRadius: '4px',
        }}
      />
      {error && (
        <span
          role="alert"
          style={{ color: 'red', fontSize: '0.875rem' }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Example: Reusable Select Field Component
 */
interface SelectFieldProps {
  name: string;
  label: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  disabled?: boolean;
}

export function SelectField({
  name,
  label,
  options,
  placeholder,
  disabled,
}: SelectFieldProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message as string | undefined;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <label htmlFor={name} style={{ display: 'block', marginBottom: '0.5rem' }}>
        {label}
      </label>
      <select
        {...register(name)}
        id={name}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '0.5rem',
          border: error ? '1px solid red' : '1px solid #ccc',
          borderRadius: '4px',
        }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <span
          role="alert"
          style={{ color: 'red', fontSize: '0.875rem' }}
        >
          {error}
        </span>
      )}
    </div>
  );
}

/**
 * Example: Submit Button Component
 */
interface SubmitButtonProps {
  children: React.ReactNode;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SubmitButton({ children, isLoading, disabled }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={disabled || isLoading}
      style={{
        padding: '0.75rem 1.5rem',
        backgroundColor: isLoading ? '#ccc' : '#007bff',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      }}
    >
      {isLoading ? 'Submitting...' : children}
    </button>
  );
}
