/**
 * Input Component
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Enhanced input component with full accessibility support
 */

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
  describedBy?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error = false, errorMessage, describedBy, ...props }, ref) => {
    const baseStyles =
      'w-full px-3 py-2 border rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50';

    const normalStyles = 'border-gray-300 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-white';
    const errorStyles = 'border-red-500 focus:ring-red-500 focus:border-red-500 dark:border-red-400';

    const colorStyles = error ? errorStyles : normalStyles;

    // Generate aria-describedby for error messages
    const ariaDescribedBy = error && errorMessage
      ? `${props.id}-error ${describedBy || ''}`.trim()
      : describedBy;

    return (
      <input
        ref={ref}
        className={`${baseStyles} ${colorStyles} ${className}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={ariaDescribedBy || undefined}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
