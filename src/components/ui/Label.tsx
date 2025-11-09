/**
 * Label Component
 * Story 8.3: WCAG 2.1 AA Accessibility
 *
 * Accessible label component with proper associations and styling
 */

import { LabelHTMLAttributes, forwardRef } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

const Label = forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', required = false, error = false, children, ...props }, ref) => {
    const baseStyles = 'block text-sm font-medium transition-colors';

    const colorStyles = error
      ? 'text-red-700 dark:text-red-400'
      : 'text-gray-700 dark:text-gray-300';

    return (
      <label ref={ref} className={`${baseStyles} ${colorStyles} ${className}`} {...props}>
        {children}
        {required && (
          <span className="ml-1 text-red-600 dark:text-red-400" aria-label="required">
            *
          </span>
        )}
      </label>
    );
  }
);

Label.displayName = 'Label';

export { Label };
