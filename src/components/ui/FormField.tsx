/**
 * FormField Component
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Fully accessible form field wrapper that properly associates labels, inputs, and error messages
 */

import { ReactNode } from 'react';
import { Label } from './Label';
import { Input } from './Input';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}

export function FormField({
  id,
  label,
  error,
  required = false,
  helperText,
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  className = '',
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  return (
    <div className={`space-y-1 ${className}`}>
      <Label htmlFor={id} required={required} error={!!error}>
        {label}
      </Label>

      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        error={!!error}
        aria-describedby={
          [error ? errorId : '', helperText ? helperId : ''].filter(Boolean).join(' ') || undefined
        }
      />

      {/* Helper text */}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-gray-600 dark:text-gray-400">
          {helperText}
        </p>
      )}

      {/* Error message */}
      {error && (
        <p
          id={errorId}
          className="text-sm text-red-600 dark:text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
}
