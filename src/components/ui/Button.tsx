/**
 * Button Component
 * Story 8.3: WCAG 2.1 AA Accessibility
 * Story 8.4: Mobile-First Responsive Design
 *
 * Enhanced button component with loading states, ARIA support, and touch-friendly sizing
 */

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'default',
      size = 'md',
      isLoading = false,
      loadingText,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      default: 'bg-primary text-white hover:bg-primary/90',
      outline:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-700',
      ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };

    // Story 8.4: All button sizes meet minimum 44x44px touch target
    const sizes = {
      sm: 'px-3 py-2 text-sm min-h-touch-min min-w-[44px]', // 44px minimum
      md: 'px-4 py-2.5 text-base min-h-touch-min min-w-[56px]', // 44px+ comfortable
      lg: 'px-6 py-3 text-lg min-h-[52px] min-w-[80px]', // Large touch target
    };

    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={isDisabled}
        aria-busy={isLoading ? 'true' : 'false'}
        aria-disabled={isDisabled ? 'true' : 'false'}
        {...props}
      >
        {/* Loading spinner */}
        {isLoading && (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Button content */}
        <span>{isLoading && loadingText ? loadingText : children}</span>

        {/* Screen reader announcement for loading state */}
        {isLoading && <span className="sr-only">Loading</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
